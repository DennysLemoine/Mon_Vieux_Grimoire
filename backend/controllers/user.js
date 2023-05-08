const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const User = require('../models/User');

exports.signup = (req, res, next) => {
    const { email, password } = req.body;

    // Vérifier si l'adresse email est valide
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Adresse email invalide' });
    }

    // Vérifier si le mot de passe est valide
    if (!validator.isStrongPassword(password)) {
        return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères dont au moins 1 lettre majuscule, 1 lettre minuscule, 1 chiffre et 1 caractère spécial' });
    }

    bcrypt.hash(password, 10)
        .then(hash => {
            const user = new User({
                email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;

    // Vérifier si l'adresse email est valide
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Adresse email invalide' });
    }

    User.findOne({ email })
        .then(user => {
            if (user === null) {
                res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
            } else {
                bcrypt.compare(password, user.password)
                    .then(valid => {
                        if (!valid) {
                            res.status(401).json({ message: 'Paire identifiant/mot de passe incorrecte' });
                        } else {
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    { userId: user._id },
                                    'RANDOM_TOKEN_SECRET',
                                    { expiresIn: '24h' }
                                )
                            });
                        }
                    })
                    .catch(error => {
                        res.status(500).json({ error })
                    })
            }
        })
        .catch(error => {
            res.status(500).json({ error });
        })
};
