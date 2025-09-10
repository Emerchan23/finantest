// Script para inserir dados de teste no banco
const Database = require('better-sqlite3');
const { join } = require('path');

const dbPath = join(process.cwd(), 'data', 'erp.sqlite');
const db = new Database(dbPath);

console.log('🌱 Inserindo dados de teste...');

try {
  // Inserir empresa padrão se não existir
  const empresa = db.prepare('SELECT id FROM empresas LIMIT 1').get();
  let empresaId = empresa?.id;
  
  if (!empresaId) {
    empresaId = 'empresa-1';
    db.prepare(`INSERT INTO empresas (id, nome, razao_social) VALUES (?, ?, ?)`)
      .run(empresaId, 'LP IND', 'LP Indústria LTDA');
    console.log('✅ Empresa criada');
  }

  // Inserir clientes de teste
  const clientesData = [
    { id: 'cliente-1', nome: 'João Silva', cpf_cnpj: '123.456.789-00' },
    { id: 'cliente-2', nome: 'Maria Santos', cpf_cnpj: '987.654.321-00' },
    { id: 'cliente-3', nome: 'Pedro Costa', cpf_cnpj: '456.789.123-00' }
  ];

  for (const cliente of clientesData) {
    try {
      db.prepare(`INSERT OR IGNORE INTO clientes (id, nome, cpf_cnpj, empresa_id) VALUES (?, ?, ?, ?)`)
        .run(cliente.id, cliente.nome, cliente.cpf_cnpj, empresaId);
    } catch (e) {}
  }
  console.log('✅ Clientes inseridos');

  // Inserir produtos de teste
  const produtosData = [
    { id: 'produto-1', nome: 'Produto A', preco: 100.00, custo: 60.00 },
    { id: 'produto-2', nome: 'Produto B', preco: 200.00, custo: 120.00 },
    { id: 'produto-3', nome: 'Produto C', preco: 150.00, custo: 90.00 }
  ];

  for (const produto of produtosData) {
    try {
      db.prepare(`INSERT OR IGNORE INTO produtos (id, nome, preco, custo, empresa_id) VALUES (?, ?, ?, ?, ?)`)
        .run(produto.id, produto.nome, produto.preco, produto.custo, empresaId);
    } catch (e) {}
  }
  console.log('✅ Produtos inseridos');

  // Inserir linhas de venda de teste com diferentes status e datas
  const linhasVendaData = [
    {
      id: 'lv-1',
      dataPedido: '2024-01-15',
      cliente: 'João Silva',
      produto: 'Produto A',
      valorVenda: 1000.00,
      custoMercadoria: 600.00,
      lucroValor: 400.00,
      lucroPerc: 40.0,
      paymentStatus: 'pendente'
    },
    {
      id: 'lv-2',
      dataPedido: '2024-02-10',
      cliente: 'Maria Santos',
      produto: 'Produto B',
      valorVenda: 2000.00,
      custoMercadoria: 1200.00,
      lucroValor: 800.00,
      lucroPerc: 40.0,
      paymentStatus: 'pago'
    },
    {
      id: 'lv-3',
      dataPedido: '2024-03-05',
      cliente: 'Pedro Costa',
      produto: 'Produto C',
      valorVenda: 1500.00,
      custoMercadoria: 1600.00, // Venda sem lucro
      lucroValor: -100.00,
      lucroPerc: -6.67,
      paymentStatus: 'pendente'
    }
  ];

  for (const linha of linhasVendaData) {
    try {
      db.prepare(`INSERT OR IGNORE INTO linhas_venda (
        id, companyId, dataPedido, cliente, produto, valorVenda, 
        custoMercadoria, lucroValor, lucroPerc, paymentStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(
          linha.id, empresaId, linha.dataPedido, linha.cliente, linha.produto,
          linha.valorVenda, linha.custoMercadoria, linha.lucroValor, linha.lucroPerc, linha.paymentStatus
        );
    } catch (e) {}
  }
  console.log('✅ Linhas de venda inseridas');

  // Verificar dados inseridos
  const counts = {
    clientes: db.prepare('SELECT COUNT(*) as count FROM clientes').get().count,
    produtos: db.prepare('SELECT COUNT(*) as count FROM produtos').get().count,
    linhasVenda: db.prepare('SELECT COUNT(*) as count FROM linhas_venda').get().count,
    vendasPendentes: db.prepare('SELECT COUNT(*) as count FROM linhas_venda WHERE paymentStatus = ?').get('pendente').count,
    vendasSemLucro: db.prepare('SELECT COUNT(*) as count FROM linhas_venda WHERE lucroPerc <= 0').get().count
  };

  console.log('\n📊 Dados no banco:');
  console.log('Clientes:', counts.clientes);
  console.log('Produtos:', counts.produtos);
  console.log('Linhas de venda:', counts.linhasVenda);
  console.log('Vendas pendentes:', counts.vendasPendentes);
  console.log('Vendas sem lucro:', counts.vendasSemLucro);

  console.log('\n🎉 Dados de teste inseridos com sucesso!');

} catch (error) {
  console.error('❌ Erro ao inserir dados:', error.message);
} finally {
  db.close();
}