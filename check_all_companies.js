const Database = require('better-sqlite3');
const { join } = require('path');
const fs = require('fs');

// Usar o mesmo caminho que o servidor usa
const dbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'erp.sqlite');

console.log('Caminho do banco:', dbPath);
console.log('Arquivo existe:', fs.existsSync(dbPath));

try {
  const db = new Database(dbPath);
  
  // Buscar todas as empresas
  const empresas = db.prepare(`
    SELECT id, nome, smtp_host, smtp_port, smtp_user, smtp_password, 
           smtp_secure, smtp_from_name, smtp_from_email, created_at, updated_at
    FROM empresas 
    ORDER BY created_at DESC
  `).all();
  
  console.log(`\n📊 Total de empresas encontradas: ${empresas.length}`);
  
  empresas.forEach((empresa, index) => {
    console.log(`\n🏢 Empresa ${index + 1}:`);
    console.log(`- ID: ${empresa.id}`);
    console.log(`- Nome: ${empresa.nome}`);
    console.log(`- SMTP Host: ${empresa.smtp_host || 'NÃO CONFIGURADO'}`);
    console.log(`- SMTP Port: ${empresa.smtp_port || 'NÃO CONFIGURADO'}`);
    console.log(`- SMTP User: ${empresa.smtp_user || 'NÃO CONFIGURADO'}`);
    console.log(`- SMTP Password: ${empresa.smtp_password ? '***' : 'NÃO CONFIGURADO'}`);
    console.log(`- SMTP Secure: ${empresa.smtp_secure || 'NÃO CONFIGURADO'}`);
    console.log(`- SMTP From Name: ${empresa.smtp_from_name || 'NÃO CONFIGURADO'}`);
    console.log(`- SMTP From Email: ${empresa.smtp_from_email || 'NÃO CONFIGURADO'}`);
    console.log(`- Criado em: ${empresa.created_at}`);
    console.log(`- Atualizado em: ${empresa.updated_at}`);
  });
  
  // Verificar qual empresa é retornada por LIMIT 1
  const primeiraEmpresa = db.prepare('SELECT id, nome FROM empresas LIMIT 1').get();
  console.log(`\n🎯 Empresa retornada por LIMIT 1:`);
  console.log(`- ID: ${primeiraEmpresa.id}`);
  console.log(`- Nome: ${primeiraEmpresa.nome}`);
  
  db.close();
  
} catch (error) {
  console.error('❌ Erro ao verificar empresas:', error.message);
}