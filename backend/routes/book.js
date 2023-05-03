const express = require('express');
const Book = require("../models/Book");
const router = express.Router();

router.get('/api/books', (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json (books))
        .catch(error => res.status(400).json ({error}));
});

router.get('/api/books/:id', (req, res, next) => {
    Book.findOne({_id: req.params.id})
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({error}));

});

router.post('/api/books', (req, res, next) => {
    delete req.body._id;
    const book = new Book({
        ...req.body
    });
    book.save()
        .then(() => res.status(201).json({message: 'Livre enregistré !'}))
        .catch(error => res.status(400).json({error}));
});

router.put('/api/books/:id', (req, res, next) => {
    Book.updateOne({_id: req.params.id}, {...req.body, _id: req.params.id})
        .then(() => res.status(200).json({message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({error}));
});

router.delete('/api/books/:id', (req, res, next) => {
    Book.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
        .catch(error => res.status(400).json({ error }));
});