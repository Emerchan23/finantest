const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'erp.sqlite');
console.log('Verificando banco de dados:', dbPath);

const db = new Database(dbPath);

try {
  // Verificar empresas
  const empresas = db.prepare('SELECT * FROM empresas').all();
  console.log('\n=== EMPRESAS ===');
  console.log(empresas);
  
  // Verificar preferências do usuário
  const userPrefs = db.prepare('SELECT * FROM user_prefs').all();
  console.log('\n=== USER PREFERENCES ===');
  console.log(userPrefs);
  
  // Verificar clientes
  const clientes = db.prepare('SELECT id, nome, empresa_id FROM clientes').all();
  console.log('\n=== CLIENTES ===');
  console.log(clientes);
  
  // Verificar produtos
  const produtos = db.prepare('SELECT id, nome, empresa_id FROM produtos').all();
  console.log('\n=== PRODUTOS ===');
  console.log(produtos);
  
  // Verificar orçamentos
  const orcamentos = db.prepare('SELECT id, numero, status FROM orcamentos').all();
  console.log('\n=== ORÇAMENTOS ===');
  console.log(orcamentos);
  
  // Verificar linhas de venda
  const linhasVenda = db.prepare('SELECT id, companyId, cliente, produto, valorVenda, paymentStatus FROM linhas_venda').all();
  console.log('\n=== LINHAS DE VENDA ===');
  console.log(linhasVenda);
  
  console.log('\n✅ Verificação concluída');
  
} catch (error) {
  console.error('❌ Erro:', error);
} finally {
  db.close();
}