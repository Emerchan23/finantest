const Database = require('better-sqlite3');

// Caminho correto do banco
const dbPath = 'C:\\Users\\skile\\OneDrive\\Área de Trabalho\\gestao vendas\\banco-de-dados\\erp.sqlite';

console.log('Criando banco em:', dbPath);

const db = new Database(dbPath);

// Configurar WAL mode
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000');
db.pragma('foreign_keys = ON');
db.pragma('temp_store = memory');

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS empresas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    razao_social TEXT,
    cnpj TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    logo_url TEXT,
    nome_do_sistema TEXT DEFAULT 'LP IND',
    imposto_padrao REAL,
    capital_padrao REAL,
    layout_orcamento TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf_cnpj TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    empresa_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT,
    marca TEXT,
    preco REAL NOT NULL,
    custo REAL DEFAULT 0,
    taxa_imposto REAL DEFAULT 0,
    modalidade_venda TEXT,
    estoque INTEGER DEFAULT 0,
    link_ref TEXT,
    custo_ref REAL,
    categoria TEXT,
    empresa_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS vendas (
    id TEXT PRIMARY KEY,
    cliente_id TEXT,
    produto_id TEXT,
    quantidade INTEGER NOT NULL,
    preco_unitario REAL NOT NULL,
    total REAL NOT NULL,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    empresa_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS orcamentos (
    id TEXT PRIMARY KEY,
    numero TEXT NOT NULL UNIQUE,
    cliente_id TEXT NOT NULL,
    data_orcamento TEXT NOT NULL,
    data_validade TEXT,
    valor_total REAL NOT NULL DEFAULT 0,
    descricao TEXT,
    status TEXT DEFAULT 'pendente',
    observacoes TEXT,
    condicoes_pagamento TEXT,
    prazo_entrega TEXT,
    vendedor_id TEXT,
    desconto REAL DEFAULT 0,
    modalidade TEXT DEFAULT 'compra_direta',
    numero_pregao TEXT,
    numero_dispensa TEXT,
    empresa_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS orcamento_itens (
    id TEXT PRIMARY KEY,
    orcamento_id TEXT NOT NULL,
    produto_id TEXT,
    descricao TEXT NOT NULL,
    marca TEXT,
    quantidade REAL NOT NULL,
    valor_unitario REAL NOT NULL,
    valor_total REAL NOT NULL,
    observacoes TEXT,
    link_ref TEXT,
    custo_ref REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orcamento_id) REFERENCES orcamentos (id)
  );

  CREATE TABLE IF NOT EXISTS user_prefs (
    userId TEXT PRIMARY KEY,
    json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS linhas_venda (
    id TEXT PRIMARY KEY,
    companyId TEXT,
    dataPedido TEXT NOT NULL,
    numeroOF TEXT,
    numeroDispensa TEXT,
    cliente TEXT,
    produto TEXT,
    modalidade TEXT,
    valorVenda REAL NOT NULL DEFAULT 0,
    taxaCapitalPerc REAL NOT NULL DEFAULT 0,
    taxaCapitalVl REAL NOT NULL DEFAULT 0,
    taxaImpostoPerc REAL NOT NULL DEFAULT 0,
    taxaImpostoVl REAL NOT NULL DEFAULT 0,
    custoMercadoria REAL NOT NULL DEFAULT 0,
    somaCustoFinal REAL NOT NULL DEFAULT 0,
    lucroValor REAL NOT NULL DEFAULT 0,
    lucroPerc REAL NOT NULL DEFAULT 0,
    dataRecebimento TEXT,
    paymentStatus TEXT NOT NULL DEFAULT 'pendente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Tabelas criadas');

// Inserir dados de teste
const empresaId = 'empresa-1';

// Inserir empresa
db.prepare('INSERT OR REPLACE INTO empresas (id, nome) VALUES (?, ?)').run(empresaId, 'Empresa Teste');

// Inserir preferência do usuário
db.prepare('INSERT OR REPLACE INTO user_prefs (userId, json) VALUES (?, ?)').run('default', JSON.stringify({currentCompanyId: empresaId}));

// Inserir clientes
for (let i = 1; i <= 3; i++) {
  db.prepare('INSERT OR REPLACE INTO clientes (id, nome, empresa_id) VALUES (?, ?, ?)').run(`cliente-${i}`, `Cliente ${i}`, empresaId);
}

// Inserir produtos
for (let i = 1; i <= 3; i++) {
  db.prepare('INSERT OR REPLACE INTO produtos (id, nome, preco, empresa_id) VALUES (?, ?, ?, ?)').run(`produto-${i}`, `Produto ${i}`, 100 * i, empresaId);
}

// Inserir linhas de venda com dados para alertas
const linhasVenda = [
  {
    id: 'venda-1',
    companyId: empresaId,
    dataPedido: '2025-01-15',
    cliente: 'Cliente 1',
    produto: 'Produto 1',
    valorVenda: 1000,
    lucroValor: 200,
    paymentStatus: 'PENDENTE'
  },
  {
    id: 'venda-2',
    companyId: empresaId,
    dataPedido: '2025-01-16',
    cliente: 'Cliente 2',
    produto: 'Produto 2',
    valorVenda: 1500,
    lucroValor: 0, // Sem lucro para gerar alerta
    paymentStatus: 'PENDENTE'
  },
  {
    id: 'venda-3',
    companyId: empresaId,
    dataPedido: '2025-01-17',
    cliente: 'Cliente 3',
    produto: 'Produto 3',
    valorVenda: 800,
    lucroValor: 150,
    paymentStatus: 'PAGO'
  }
];

for (const venda of linhasVenda) {
  db.prepare(`
    INSERT OR REPLACE INTO linhas_venda 
    (id, companyId, dataPedido, cliente, produto, valorVenda, lucroValor, paymentStatus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    venda.id,
    venda.companyId,
    venda.dataPedido,
    venda.cliente,
    venda.produto,
    venda.valorVenda,
    venda.lucroValor,
    venda.paymentStatus
  );
}

console.log('✅ Dados de teste inseridos');

// Verificar dados
const counts = {
  empresas: db.prepare('SELECT COUNT(*) as count FROM empresas').get().count,
  clientes: db.prepare('SELECT COUNT(*) as count FROM clientes').get().count,
  produtos: db.prepare('SELECT COUNT(*) as count FROM produtos').get().count,
  linhasVenda: db.prepare('SELECT COUNT(*) as count FROM linhas_venda').get().count,
  vendasPendentes: db.prepare('SELECT COUNT(*) as count FROM linhas_venda WHERE paymentStatus = ?').get('PENDENTE').count,
  vendasSemLucro: db.prepare('SELECT COUNT(*) as count FROM linhas_venda WHERE lucroValor = 0').get().count
};

console.log('📊 Contadores:', counts);

db.close();
console.log('✅ Banco inicializado com sucesso!');