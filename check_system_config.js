const Database = require('better-sqlite3');
const path = require('path');

// Conectar ao banco de dados
const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

console.log('Verificando tabela system_config...');

try {
  // Verificar se a tabela existe
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='system_config'
  `).get();
  
  if (!tableExists) {
    console.log('❌ Tabela system_config não existe');
    process.exit(0);
  }
  
  console.log('✅ Tabela system_config existe');
  
  // Buscar configurações SMTP
  const config = db.prepare(`
    SELECT smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, smtp_from_name, smtp_from_email 
    FROM system_config WHERE id = 1
  `).get();
  
  if (!config) {
    console.log('❌ Nenhuma configuração encontrada na system_config');
  } else {
    console.log('\nConfigurações SMTP na system_config:');
    console.log('- smtp_host:', config.smtp_host || 'NÃO CONFIGURADO');
    console.log('- smtp_port:', config.smtp_port || 'NÃO CONFIGURADO');
    console.log('- smtp_secure:', config.smtp_secure || 'NÃO CONFIGURADO');
    console.log('- smtp_user:', config.smtp_user || 'NÃO CONFIGURADO');
    console.log('- smtp_password:', config.smtp_password || 'NÃO CONFIGURADO');
    console.log('- smtp_from_name:', config.smtp_from_name || 'NÃO CONFIGURADO');
    console.log('- smtp_from_email:', config.smtp_from_email || 'NÃO CONFIGURADO');
  }
  
} catch (error) {
  console.error('Erro ao verificar system_config:', error.message);
} finally {
  db.close();
}