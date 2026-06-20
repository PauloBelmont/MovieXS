//Middleware verifyToken, que controla o acesso a rotas protegidas

const jwt = require('jsonwebtoken');
const config = require('../config/env');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido. Redirecionar para login.' });
    }

    jwt.verify(token, config.jwt.accessSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido. Redirecionar para login.' });
        }

        req.user = user;
        next();
    });
};

module.exports = verifyToken;