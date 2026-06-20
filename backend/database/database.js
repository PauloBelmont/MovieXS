//Conexão com o mongoDB

const mongoose = require('mongoose');
const config = require('../config/env');

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Conectado');
    } catch (error) {
        console.error('Erro de conexão com o MongoDB:', error);
        process.exit(1); // Exit process on failure
    }
};

module.exports = connectDB;