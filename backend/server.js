//Arquivo principal do backend
//Services
const tfidfService = require('./services/tfidfService');
const { initializeJwtSecrets } = require('./services/jwtInitializer');

// Gerar secrets se não existirem
initializeJwtSecrets();

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./database/database");

// Importação dos arquivos roteadores
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const movieRoutes = require("./routes/movieRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

//Aplicativo Express
const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

//Inicializa o serviço de recomendação TD-IDF
tfidfService.initialize().catch(err => {
    console.error('TF-IDF initialization failed:', err);
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes); // Rotas de autenticação
app.use("/api/user", userRoutes); // Rotas do usuário
app.use("/api/movies", movieRoutes); // Rotas de filmes
app.use("/api/recommendations", recommendationRoutes); // Rotas de recomendações
app.use("/api/reviews", reviewRoutes); // Rotas de avaliações

// Iniciar o servidor
app.listen(PORT, () => console.log(`Servidor on-line na porta ${PORT}`));