const Database = require('better-sqlite3');

try {
  const db = new Database('./data/erp.sqlite');
  
  // Listar todas as tabelas
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tabelas encontradas:', tables.map(t => t.name));
  
  // Verificar especificamente a tabela system_config
  const systemConfigExists = tables.some(t => t.name === 'system_config');
  console.log('\nTabela system_config existe:', systemConfigExists);
  
  if (systemConfigExists) {
    // Buscar configuração
    const config = db.prepare('SELECT * FROM system_config WHERE id = 1').get();
    console.log('Configuração encontrada:', !!config);
    
    if (config) {
      console.log('\nConfiguração SMTP:');
      console.log('- SMTP Host:', config.smtp_host || 'NÃO CONFIGURADO');
      console.log('- SMTP Port:', config.smtp_port || 'NÃO CONFIGURADO');
      console.log('- SMTP User:', config.smtp_user || 'NÃO CONFIGURADO');
      console.log('- SMTP From Email:', config.smtp_from_email || 'NÃO CONFIGURADO');
      console.log('- SMTP From Name:', config.smtp_from_name || 'NÃO CONFIGURADO');
    }
  }
  
  db.close();
} catch (error) {
  console.error('Erro:', error.message);
}