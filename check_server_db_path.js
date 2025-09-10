const { join } = require('path');
const fs = require('fs');

console.log('🔍 Verificando configuração do banco de dados do servidor...');
console.log('');

// Verificar variáveis de ambiente
console.log('📋 Variáveis de ambiente:');
console.log('- DB_PATH:', process.env.DB_PATH || 'NÃO DEFINIDA');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'NÃO DEFINIDA');
console.log('- PWD:', process.env.PWD || process.cwd());
console.log('');

// Calcular o caminho que o servidor usaria
const serverDbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'erp.sqlite');
console.log('🎯 Caminho do banco que o servidor usaria:', serverDbPath);
console.log('📁 Arquivo existe:', fs.existsSync(serverDbPath));
console.log('');

// Verificar outros possíveis caminhos
const possiblePaths = [
  join(process.cwd(), 'data', 'erp.sqlite'),
  join(process.cwd(), 'banco-de-dados', 'erp.sqlite'),
  join(__dirname, 'data', 'erp.sqlite'),
  join(__dirname, 'banco-de-dados', 'erp.sqlite'),
  './data/erp.sqlite',
  './banco-de-dados/erp.sqlite'
];

console.log('🔍 Verificando possíveis localizações do banco:');
possiblePaths.forEach((path, index) => {
  const exists = fs.existsSync(path);
  console.log(`${index + 1}. ${path} - ${exists ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
  
  if (exists) {
    const stats = fs.statSync(path);
    console.log(`   📊 Tamanho: ${stats.size} bytes`);
    console.log(`   📅 Modificado: ${stats.mtime}`);
  }
});

console.log('');
console.log('💡 Dica: O servidor Next.js pode estar usando um caminho diferente do esperado.');
console.log('💡 Verifique se há um arquivo .env ou .env.local definindo DB_PATH.');}