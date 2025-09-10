const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Lista de todos os bancos de dados encontrados
const databases = [
  'C:\\Users\\skile\\OneDrive\\Área de Trabalho\\gestao vendas\\banco-de-dados\\erp.sqlite',
  'C:\\Users\\skile\\OneDrive\\Área de Trabalho\\gestao vendas\\sistema\\banco-de-dados\\erp.sqlite',
  'C:\\Users\\skile\\OneDrive\\Área de Trabalho\\gestao vendas\\sistema\\data\\erp.sqlite'
];

console.log('🔍 Verificando todos os bancos de dados encontrados...\n');

databases.forEach((dbPath, index) => {
  console.log(`📊 Banco ${index + 1}: ${dbPath}`);
  
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Arquivo não existe\n');
    return;
  }
  
  try {
    const db = new Database(dbPath, { readonly: true });
    
    // Verificar se a tabela empresas existe
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='empresas'
    `).get();
    
    if (!tableExists) {
      console.log('❌ Tabela empresas não existe\n');
      db.close();
      return;
    }
    
    // Contar empresas
    const count = db.prepare('SELECT COUNT(*) as count FROM empresas').get();
    console.log(`✅ Empresas encontradas: ${count.count}`);
    
    if (count.count > 0) {
      // Listar empresas
      const empresas = db.prepare(`
        SELECT id, nome, created_at, updated_at 
        FROM empresas 
        ORDER BY created_at ASC
      `).all();
      
      empresas.forEach((empresa, idx) => {
        console.log(`   ${idx + 1}. ${empresa.nome} (ID: ${empresa.id})`);
        console.log(`      Criado: ${empresa.created_at}`);
        console.log(`      Atualizado: ${empresa.updated_at}`);
      });
    }
    
    db.close();
    console.log('');
    
  } catch (error) {
    console.log(`❌ Erro ao acessar banco: ${error.message}\n`);
  }
});

// Verificar qual banco o servidor está configurado para usar
console.log('🔧 Configuração do servidor:');
const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'erp.sqlite');
console.log(`DB_PATH configurado: ${dbPath}`);
console.log(`Arquivo existe: ${fs.existsSync(dbPath)}`);

// Verificar se há variável de ambiente DB_PATH definida
if (process.env.DB_PATH) {
  console.log(`✅ Variável DB_PATH definida: ${process.env.DB_PATH}`);
} else {
  console.log('⚠️  Variável DB_PATH não definida, usando padrão');
}