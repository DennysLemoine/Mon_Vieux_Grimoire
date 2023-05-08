const Book = require("../models/Book");
const fs = require('fs');

exports.getAllBook = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json (books))
        .catch(error => res.status(400).json ({error}));
}

exports.getOneBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({error}));
}

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject.userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    book.save()
        .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
        .catch(error => { res.status(400).json( { error })})
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message : 'Non-autorisé !'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                    .then(() => res.status(200).json({message : 'Objet modifié!'}))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({message: 'Non-autorisé !'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

// Notation d'un livre :
exports.rateBook = (req, res, next) => {
    const userId = req.body.userId;
    const rating = req.body.rating;
    if (rating < 0 || rating > 5) {
        return res.status(400).json({ message: 'La note doit être comprise entre 0 et 5.' });
    }
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: 'Livre non trouvé.' });
            }
            const userRating = book.ratings.find((r) => r.userId === userId);
            if (userRating) {
                return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
            }
            book.ratings.push({ userId: userId, grade: rating });
            const nbRatings = book.ratings.length;
            const sumRatings = book.ratings.reduce((acc, r) => acc + r.grade, 0);
            book.averageRating = sumRatings / nbRatings;
            book.save()
                .then(() => res.status(201).json(book))
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};


// Calcul de la moyenne d'un livre :
exports.updateBookRating = (req, res, next) => {
    const userId = req.auth.userId;
    const bookId = req.params.id;
    const grade = req.body.grade;

    // Vérifier si l'utilisateur a déjà noté le livre
    Book.findOne({ _id: bookId, 'ratings.userId': userId })
        .then(book => {
            // Si l'utilisateur a déjà noté le livre, mettre à jour la note existante
            if (book) {
                book.ratings.forEach(rating => {
                    if (rating.userId === userId) {
                        rating.grade = grade;
                    }
                });
            } else {
                // Sinon, ajouter une nouvelle note pour l'utilisateur
                book = new Book({
                    _id: bookId,
                    ratings: [{ userId, grade }]
                });
            }

            // Calculer la moyenne des notes pour le livre
            let totalGrade = 0;
            book.ratings.forEach(rating => {
                totalGrade += rating.grade;
            });
            book.averageRating = totalGrade / book.ratings.length;

            // Sauvegarder les modifications et renvoyer le livre mis à jour
            book.save()
                .then(() => res.status(200).json(book))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(400).json({ error }));
};

// Avoir les 3 livres les mieux notés de la BDD :
exports.getThreeBestRatings = (req, res, next) => {

    // Récupérer les trois meilleurs livres selon leur note moyenne
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(bestBooks => {
            // Renvoyer les trois meilleurs livres
            res.status(200).json({ bestBooks });
        })
        .catch(error => res.status(400).json({ error }));
};
