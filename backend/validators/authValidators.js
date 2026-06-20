//Schemas Joi para validação de entrada nas rotas de autenticação
const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        'string.alphanum': 'Usuário deve conter apenas letras e números.',
        'string.min': 'Usuário deve ter ao menos 3 caracteres.',
        'string.max': 'Usuário deve ter no máximo 30 caracteres.',
        'any.required': 'Usuário é obrigatório.',
    }),
    password: Joi.string().min(6).max(72).required().messages({
        'string.min': 'Senha deve ter ao menos 6 caracteres.',
        'any.required': 'Senha é obrigatória.',
    }),
    email: Joi.string().email().optional().messages({
        'string.email': 'E-mail inválido.',
    }),
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
});

const refreshSchema = Joi.object({
    token: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
