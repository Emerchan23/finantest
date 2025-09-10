const Database = require('better-sqlite3');
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');

console.log('🔍 Verificando configurações SMTP no banco de dados...');
console.log('📁 Caminho do banco:', dbPath);

try {
  const db = new Database(dbPath);
  console.log('✅ Conectado ao banco de dados SQLite.');

  // Verificar estrutura da tabela empresas
  const columns = db.prepare("PRAGMA table_info(empresas)").all();
  
  console.log('\n📋 Estrutura da tabela empresas:');
  columns.forEach(col => {
    if (col.name.includes('smtp') || col.name.includes('email')) {
      console.log(`  - ${col.name}: ${col.type}`);
    }
  });

  // Buscar configurações SMTP
  const rows = db.prepare("SELECT id, nome, smtp_host, smtp_port, smtp_user, smtp_password, smtp_secure FROM empresas").all();
  
  console.log('\n📧 Configurações SMTP encontradas:');
  rows.forEach((row, index) => {
    console.log(`\n🏢 Empresa ${index + 1}:`);
    console.log(`  ID: ${row.id}`);
    console.log(`  Nome: ${row.nome}`);
    console.log(`  SMTP Host: ${row.smtp_host || 'NÃO CONFIGURADO'}`);
    console.log(`  SMTP Port: ${row.smtp_port || 'NÃO CONFIGURADO'}`);
    console.log(`  SMTP User: ${row.smtp_user || 'NÃO CONFIGURADO'}`);
    console.log(`  SMTP Password: ${row.smtp_password ? '***CONFIGURADO***' : 'NÃO CONFIGURADO'}`);
    console.log(`  SMTP Secure: ${row.smtp_secure || 'NÃO CONFIGURADO'}`);
  });
  
  // Verificar se existe tabela system_config
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='system_config'").all();
  
  if (tables.length > 0) {
    console.log('\n🔧 Verificando tabela system_config...');
    const configs = db.prepare("SELECT * FROM system_config WHERE key LIKE '%smtp%'").all();
    console.log('📋 Configurações SMTP no system_config:');
    configs.forEach(config => {
      console.log(`  ${config.key}: ${config.value}`);
    });
  } else {
    console.log('\n📝 Tabela system_config não encontrada.');
  }
  
  db.close();
  
} catch (err) {
  console.error('❌ Erro ao conectar com o banco:', err.message);
}