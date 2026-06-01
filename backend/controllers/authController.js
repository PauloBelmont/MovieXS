//Este arquivo contém as funções relacionadas à autenticação dos usuários no sistema

//Bibliotecas
const bcrypt = require("bcryptjs"); //Cifra
const jwt = require("jsonwebtoken"); //Funções de assinatura e validação do JWT
const RefreshToken = require("../models/RefreshToken");

const { User } = require("../models/Schemas");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
let refreshTokens = [];

//Cadastro
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        //Verifica se não há outro usuário com mesmo username já cadastrado.
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Já existe um usuário com esse nome." });
        }

        //Cifra a senha do usuário para armazenamento seguro
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Usuário registrado com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }

        // Incluindo o username no payload do token
        const accessToken = jwt.sign(
            { id: user._id, username: user.username },
            accessTokenSecret,
            { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
            { id: user._id, username: user.username },
            refreshTokenSecret
        );

        // Salvar em DB (7 dias de expiração)
        await RefreshToken.create({
            userId: user._id,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        res.json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Atualização de token JWT
exports.refreshToken = async (req, res) => {
    const { token } = req.body;
    const refreshToken = await RefreshToken.findOne({ token });

    if (!refreshToken || refreshToken.revokedAt) {
        return res.status(403).json({ message: 'Token inválido ou não encontrado.' });
    }

    jwt.verify(token, refreshTokenSecret, (err, user) => {
        if (err) return res.status(403).json({ message: 'Erro ao verificar o refresh token.' });

        // Se o refreshToken for válido, gere um novo accessToken
        const newAccessToken = jwt.sign(
            { id: user.id, username: user.username },
            accessTokenSecret,
            { expiresIn: "15m" }
        );
        res.json({ accessToken: newAccessToken });
    });
};

//Logout
exports.logout = (req, res) => {
    try {
        const { token } = req.body;

        // Verifica se o token está na lista
        if (!refreshTokens.includes(token)) {
            return res.status(400).json({ message: 'Token não encontrado na lista.' });
        }

        // Remove o token da lista
        refreshTokens = refreshTokens.filter((t) => t !== token);

        // Responde com status 204 (sem conteúdo)
        res.sendStatus(204);
    } catch (error) {
        console.error('Erro no logout:', error);  // Log de erro
        res.status(500).json({ message: 'Erro no servidor ao tentar fazer logout.' });
    }
};