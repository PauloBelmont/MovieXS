//Rate limiting para rotas sensíveis de autenticação (mitiga brute-force/credential stuffing)
const rateLimit = require('express-rate-limit');

//Login: poucas tentativas por janela, por IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas por IP na janela
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
});

//Registro: evita criação massiva de contas
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas tentativas de registro. Tente novamente mais tarde.' },
});

//Refresh: mais permissivo (uso normal da aplicação), mas ainda limitado
const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Muitas requisições de refresh. Tente novamente em alguns minutos.' },
});

module.exports = { loginLimiter, registerLimiter, refreshLimiter };
