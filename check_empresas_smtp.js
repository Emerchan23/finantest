const Database = require('better-sqlite3');
const { join } = require('path');
const fs = require('fs');

// Usar o mesmo caminho que o servidor usa
const dbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'erp.sqlite');

console.log('Caminho do banco:', dbPath);
console.log('Arquivo existe:', fs.existsSync(dbPath));

// Verificar se o diretório existe
const dir = require('path').dirname(dbPath);
console.log('Diretório do banco:', dir);
console.log('Diretório existe:', fs.existsSync(dir));

// Se não existir, criar
if (!fs.existsSync(dir)) {
  console.log('Criando diretório...');
  fs.mkdirSync(dir, { recursive: true });
}

try {
  const db = new Database(dbPath);
  console.log('Conexão estabelecida com sucesso!');
  
  // Verificar se a tabela empresas existe
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='empresas'").all();
  console.log('Tabela empresas existe:', tables.length > 0);
  
  if (tables.length > 0) {
    // Verificar estrutura da tabela
    const columns = db.prepare("PRAGMA table_info(empresas)").all();
    console.log('\nColunas da tabela empresas:');
    columns.forEach(col => {
      console.log(`- ${col.name}: ${col.type}`);
    });
    
    // Verificar dados
     const empresas = db.prepare('SELECT * FROM empresas ORDER BY created_at DESC').all();
     console.log(`\nTotal de empresas: ${empresas.length}`);
     
     empresas.forEach((empresa, index) => {
       console.log(`\n--- Empresa ${index + 1} ---`);
       console.log('ID:', empresa.id);
       console.log('Nome:', empresa.nome);
       console.log('Created At:', empresa.created_at);
       console.log('Updated At:', empresa.updated_at);
       console.log('SMTP Host:', empresa.smtp_host || 'NÃO CONFIGURADO');
       console.log('SMTP Port:', empresa.smtp_port || 'NÃO CONFIGURADO');
       console.log('SMTP User:', empresa.smtp_user || 'NÃO CONFIGURADO');
       console.log('SMTP Password:', empresa.smtp_password ? '***' : 'NÃO CONFIGURADO');
       console.log('SMTP Secure:', empresa.smtp_secure || 'NÃO CONFIGURADO');
       console.log('SMTP From Name:', empresa.smtp_from_name || 'NÃO CONFIGURADO');
       console.log('SMTP From Email:', empresa.smtp_from_email || 'NÃO CONFIGURADO');
     });
     
     // Verificar qual empresa é retornada por LIMIT 1
     const empresaPadrao = db.prepare('SELECT * FROM empresas LIMIT 1').get();
     console.log('\n=== Empresa retornada por LIMIT 1 ===');
     console.log('ID:', empresaPadrao.id);
     console.log('Nome:', empresaPadrao.nome);
     console.log('SMTP Host:', empresaPadrao.smtp_host);
  } else {
    console.log('Tabela empresas não existe!');
  }
  
  db.close();
} catch (error) {
  console.error('Erro:', error.message);
}