const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES ={
    'images/jpg': 'jpg',
    'images/jpeg': 'jpeg',
    'images/png': 'png',
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'images')
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

const upload = multer({ storage }).single('image');

// Middleware pour traiter l'image avant de l'enregistrer
const processImage = (req, res, next) => {
    if (!req.file) {
        // Aucun fichier n'a été téléchargé
        return next();
    }

    // Ouvrir l'image téléchargée avec sharp
    sharp(req.file.path)
        // Redimensionner l'image à 500 pixels de large
        .resize({ width: 500 })
        // Compresser l'image avec une qualité de 80%
        .jpeg({ quality: 80 })
        // Enregistrer l'image traitée dans un fichier
        .toFile(req.file.path + '.optimized', (err) => {
            if (err) {
                return next(err);
            }
            // Supprimer l'ancien fichier et renommer le nouveau fichier
            fs.unlinkSync(req.file.path);
            req.file.filename = req.file.filename + '.optimized';
            req.file.path = req.file.path + '.optimized';
            next();
        });
};

module.exports = { upload, processImage };