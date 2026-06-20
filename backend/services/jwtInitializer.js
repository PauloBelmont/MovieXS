const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dotenv = require('dotenv');

function generateSecretKey() {
  return crypto.randomBytes(32).toString('hex');
}

function initializeJwtSecrets() {
  const envPath = path.join(__dirname, '../../.env');
  let envContent = '';

  // Ler .env se existir
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Reload para pegar valores atualizados
  dotenv.config({ path: envPath });

  // Verificar se secrets já existem
  const hasAccessSecret = process.env.ACCESS_TOKEN_SECRET;
  const hasRefreshSecret = process.env.REFRESH_TOKEN_SECRET;

  let needsUpdate = false;

  // Se falta ACCESS_TOKEN_SECRET, gerar
  if (!hasAccessSecret) {
    const accessSecret = generateSecretKey();
    envContent += `\nACCESS_TOKEN_SECRET=${accessSecret}`;
    process.env.ACCESS_TOKEN_SECRET = accessSecret;
    console.log('✅ ACCESS_TOKEN_SECRET gerado automaticamente');
    needsUpdate = true;
  }

  // Se falta REFRESH_TOKEN_SECRET, gerar
  if (!hasRefreshSecret) {
    const refreshSecret = generateSecretKey();
    envContent += `\nREFRESH_TOKEN_SECRET=${refreshSecret}`;
    process.env.REFRESH_TOKEN_SECRET = refreshSecret;
    console.log('✅ REFRESH_TOKEN_SECRET gerado automaticamente');
    needsUpdate = true;
  }

  // Salvar .env se teve mudanças
  if (needsUpdate) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Secrets salvos em .env');
  }
}

module.exports = { initializeJwtSecrets };