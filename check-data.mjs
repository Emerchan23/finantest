import { db } from './lib/db.js';

try {
  console.log('=== Verificando dados do banco ===');
  
  const clientes = db.prepare('SELECT COUNT(*) as count FROM clientes').get();
  console.log('Clientes:', clientes.count);
  
  const produtos = db.prepare('SELECT COUNT(*) as count FROM produtos').get();
  console.log('Produtos:', produtos.count);
  
  const vendas = db.prepare('SELECT COUNT(*) as count FROM vendas').get();
  console.log('Vendas:', vendas.count);
  
  const linhasVenda = db.prepare('SELECT COUNT(*) as count FROM linhas_venda').get();
  console.log('Linhas de venda:', linhasVenda.count);
  
  const vendasPendentes = db.prepare('SELECT COUNT(*) as count FROM linhas_venda WHERE paymentStatus = ?').get('pendente');
  console.log('Vendas pendentes:', vendasPendentes.count);
  
  const orcamentos = db.prepare('SELECT COUNT(*) as count FROM orcamentos').get();
  console.log('Orçamentos:', orcamentos.count);
  
  console.log('\n=== Dados recentes ===');
  const recentVendas = db.prepare('SELECT * FROM vendas ORDER BY created_at DESC LIMIT 3').all();
  console.log('Vendas recentes:', recentVendas.length);
  
  // Verificar se há dados para gerar alertas
  const vendasSemLucro = db.prepare('SELECT COUNT(*) as count FROM linhas_venda WHERE lucroPerc <= 0').get();
  console.log('Vendas sem lucro:', vendasSemLucro.count);
  
} catch (error) {
  console.error('Erro ao verificar dados:', error.message);
}