//Rotas de autenticação e autorização
const express = require("express");
const { register, login, refreshToken, logout } = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { registerSchema, loginSchema, refreshSchema } = require("../validators/authValidators");
const { loginLimiter, registerLimiter, refreshLimiter } = require("../middlewares/rateLimiter");

const router = express.Router();

router.post("/register", registerLimiter, validate(registerSchema), register);
router.post("/login", loginLimiter, validate(loginSchema), login);
router.post("/refresh", refreshLimiter, validate(refreshSchema), refreshToken);
router.post("/logout", logout);

module.exports = router;