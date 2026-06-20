// Configuração centralizada de variáveis de ambiente.
// Único ponto da aplicação que deve ler `process.env` diretamente (além do
// `jwtInitializer`, que roda antes disso para auto-gerar secrets em dev).
// Falha rápido (process.exit) se faltar algo obrigatório, em vez de deixar
// o erro aparecer só depois, silenciosamente, em alguma rota.

const path = require('path');
const dotenv = require('dotenv');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().integer().positive().default(5000),

    MONGO_URI: Joi.string().required().messages({
        'any.required': 'MONGO_URI não definida. Configure no .env (veja .env.example).',
    }),

    ACCESS_TOKEN_SECRET: Joi.string().min(16).required().messages({
        'any.required': 'ACCESS_TOKEN_SECRET não definida.',
    }),
    REFRESH_TOKEN_SECRET: Joi.string().min(16).required().messages({
        'any.required': 'REFRESH_TOKEN_SECRET não definida.',
    }),

    // Ainda não usadas pela aplicação em runtime (só pelo script de seed) — opcionais por ora.
    TMDB_API_KEY: Joi.string().allow('').optional(),
    TMDB_BEARER: Joi.string().allow('').optional(),
}).unknown(true); // não falha por outras variáveis do sistema (PATH, etc.)

const { error, value: env } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
    console.error('❌ Configuração de ambiente inválida:');
    error.details.forEach((d) => console.error(`   - ${d.message}`));
    process.exit(1);
}

module.exports = {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    mongoUri: env.MONGO_URI,
    jwt: {
        accessSecret: env.ACCESS_TOKEN_SECRET,
        refreshSecret: env.REFRESH_TOKEN_SECRET,
    },
    tmdb: {
        apiKey: env.TMDB_API_KEY,
        bearer: env.TMDB_BEARER,
    },
};
