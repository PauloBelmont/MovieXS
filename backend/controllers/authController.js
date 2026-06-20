//Este arquivo contém as funções relacionadas à autenticação dos usuários no sistema

//Bibliotecas
const bcrypt = require("bcryptjs"); //Cifra
const jwt = require("jsonwebtoken"); //Funções de assinatura e validação do JWT
const RefreshToken = require("../models/RefreshToken");

const { User } = require("../models/Schemas");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

//Gera um par access/refresh token e persiste o refresh token no Mongo
async function issueTokenPair(user) {
    const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        accessTokenSecret,
        { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
        { id: user._id, username: user.username },
        refreshTokenSecret,
        { expiresIn: "7d" } // expiração também no próprio token, defesa em profundidade
    );

    await RefreshToken.create({
        userId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    return { accessToken, refreshToken };
}

//Revoga todos os refresh tokens ativos de um usuário (usado em logout-all e reuse detection)
async function revokeAllUserTokens(userId) {
    await RefreshToken.updateMany(
        { userId, revokedAt: null },
        { revokedAt: new Date() }
    );
}

//Cadastro
exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        //Verifica se não há outro usuário com mesmo username (ou e-mail, se enviado) já cadastrado.
        const existingUser = await User.findOne(
            email ? { $or: [{ username }, { email }] } : { username }
        );
        if (existingUser) {
            return res.status(400).json({ message: "Já existe um usuário com esse nome ou e-mail." });
        }

        //Cifra a senha do usuário para armazenamento seguro
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, password: hashedPassword, ...(email && { email }) });
        await newUser.save();

        // Emite tokens já no registro, permitindo login automático no frontend
        const { accessToken, refreshToken } = await issueTokenPair(newUser);

        res.status(201).json({ message: "Usuário registrado com sucesso", accessToken, refreshToken });
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

        const { accessToken, refreshToken } = await issueTokenPair(user);

        res.json({ accessToken, refreshToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Atualização de token JWT — com rotação e detecção de reuso
exports.refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'Refresh token não fornecido.' });
        }

        const storedToken = await RefreshToken.findOne({ token });

        if (!storedToken) {
            // Token desconhecido: nunca existiu ou já foi removido pelo TTL
            return res.status(403).json({ message: 'Token inválido ou não encontrado.' });
        }

        if (storedToken.revokedAt) {
            // REUSE DETECTION: um token já revogado está sendo usado de novo.
            // Isso é um forte indício de que o refresh token foi roubado/copiado.
            // Resposta: revogar TODAS as sessões do usuário, forçando novo login em todos os dispositivos.
            await revokeAllUserTokens(storedToken.userId);
            return res.status(403).json({
                message: 'Token já utilizado/revogado. Por segurança, todas as sessões foram encerradas.',
            });
        }

        if (storedToken.expiresAt < new Date()) {
            return res.status(403).json({ message: 'Refresh token expirado.' });
        }

        // Valida assinatura/expiração do JWT em si (defesa em profundidade)
        let payload;
        try {
            payload = jwt.verify(token, refreshTokenSecret);
        } catch (err) {
            return res.status(403).json({ message: 'Erro ao verificar o refresh token.' });
        }

        const user = await User.findById(payload.id);
        if (!user) {
            return res.status(403).json({ message: 'Usuário não encontrado.' });
        }

        // Rotação: emite um novo par e revoga o token atual, encadeando via replacedByToken
        const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(user);

        storedToken.revokedAt = new Date();
        storedToken.replacedByToken = newRefreshToken;
        await storedToken.save();

        res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Logout
//Logout
exports.logout = async (req, res) => {
    try {
        const { token } = req.body;

        // Marcar token como revogado
        const result = await RefreshToken.updateOne(
            { token },
            { revokedAt: new Date() }
        );

        if (result.modifiedCount === 0) {
            return res.status(400).json({ message: 'Token não encontrado.' });
        }

        res.sendStatus(204);
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({ message: 'Erro no servidor ao tentar fazer logout.' });
    }
};