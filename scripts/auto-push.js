#!/usr/bin/env node
/**
 * Script para hacer commit y push automático a git
 * Uso: npm run git:push "mensaje del commit"
 * O: node scripts/auto-push.js "mensaje del commit"
 */

const { execSync } = require('child_process');
const readline = require('readline');

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`❌ Error ejecutando: ${command}`);
    process.exit(1);
  }
}

function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch {
    return 'main';
  }
}

async function askForMessage() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('💬 Mensaje del commit: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  const mensaje = process.argv[2] || await askForMessage();

  if (!mensaje) {
    console.error('❌ Error: Debes proporcionar un mensaje de commit');
    process.exit(1);
  }

  console.log('🔄 Iniciando proceso automático de git...\n');

  const branch = getCurrentBranch();
  console.log(`📍 Rama actual: ${branch}\n`);

  console.log('📦 Agregando cambios...');
  exec('git add .');

  console.log('💾 Haciendo commit...');
  exec(`git commit -m "${mensaje}"`);

  console.log(`🚀 Haciendo push a ${branch}...`);
  exec(`git push origin ${branch}`);

  console.log(`\n✅ ¡Todo subido exitosamente a ${branch}!`);
}

main().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

