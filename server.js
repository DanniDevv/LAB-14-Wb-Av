const express = require('express');
const multer = require('multer');
const path = require('path');
const ejs = require('ejs');

const app = express();

// Configuración de Multer con validaciones
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = function (req, file, cb) {
    // Validar el tipo de archivo permitido
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Tipo de archivo no permitido');
        error.code = 'LIMIT_FILE_TYPE';
        return cb(error, false);
    }

    // Validar el tamaño máximo del archivo (en bytes)
    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
        const error = new Error('Tamaño de archivo excede el límite permitido');
        error.code = 'LIMIT_FILE_SIZE';
        return cb(error, false);
    }

    cb(null, true);
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No se ha seleccionado ningún archivo');
    }

    // Obtener detalles del archivo
    const fileInfo = {
        filename: req.file.filename,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
    };

    // Renderizar la vista con los detalles del archivo
    res.render('details', { fileInfo });
});

app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto 3000');
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
