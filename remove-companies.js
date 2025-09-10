const Database = require('better-sqlite3');

try {
  const db = new Database('./banco-de-dados/erp.sqlite');
  
  console.log('🗑️ Iniciando remoção de múltiplas empresas...');
  
  // 1. Remover coluna empresa_id das tabelas
  console.log('\n📋 Removendo colunas empresa_id/companyId das tabelas...');
  
  // Clientes - remover empresa_id
  db.exec(`
    CREATE TABLE clientes_new (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      cpf_cnpj TEXT,
      endereco TEXT,
      telefone TEXT,
      email TEXT,
      created_at DATETIME,
      updated_at DATETIME
    );
    
    INSERT INTO clientes_new (id, nome, cpf_cnpj, endereco, telefone, email, created_at, updated_at)
    SELECT id, nome, cpf_cnpj, endereco, telefone, email, created_at, updated_at
    FROM clientes;
    
    DROP TABLE clientes;
    ALTER TABLE clientes_new RENAME TO clientes;
  `);
  console.log('✅ Tabela clientes atualizada');
  
  // Produtos - remover empresa_id
  db.exec(`
    CREATE TABLE produtos_new (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT,
      marca TEXT,
      preco REAL NOT NULL,
      custo REAL,
      taxa_imposto REAL,
      modalidade_venda TEXT,
      estoque INTEGER,
      link_ref TEXT,
      custo_ref REAL,
      categoria TEXT,
      created_at DATETIME,
      updated_at DATETIME
    );
    
    INSERT INTO produtos_new (id, nome, descricao, marca, preco, custo, taxa_imposto, modalidade_venda, estoque, link_ref, custo_ref, categoria, created_at, updated_at)
    SELECT id, nome, descricao, marca, preco, custo, taxa_imposto, modalidade_venda, estoque, link_ref, custo_ref, categoria, created_at, updated_at
    FROM produtos;
    
    DROP TABLE produtos;
    ALTER TABLE produtos_new RENAME TO produtos;
  `);
  console.log('✅ Tabela produtos atualizada');
  
  // Orcamentos - remover empresa_id
  db.exec(`
    CREATE TABLE orcamentos_new (
      id TEXT PRIMARY KEY,
      numero TEXT NOT NULL,
      cliente_id TEXT NOT NULL,
      data_orcamento TEXT NOT NULL,
      data_validade TEXT,
      valor_total REAL NOT NULL,
      descricao TEXT,
      status TEXT,
      observacoes TEXT,
      condicoes_pagamento TEXT,
      prazo_entrega TEXT,
      vendedor_id TEXT,
      desconto REAL,
      modalidade TEXT,
      numero_pregao TEXT,
      numero_dispensa TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    
    INSERT INTO orcamentos_new (id, numero, cliente_id, data_orcamento, data_validade, valor_total, descricao, status, observacoes, condicoes_pagamento, prazo_entrega, vendedor_id, desconto, modalidade, numero_pregao, numero_dispensa, created_at, updated_at)
    SELECT id, numero, cliente_id, data_orcamento, data_validade, valor_total, descricao, status, observacoes, condicoes_pagamento, prazo_entrega, vendedor_id, desconto, modalidade, numero_pregao, numero_dispensa, created_at, updated_at
    FROM orcamentos;
    
    DROP TABLE orcamentos;
    ALTER TABLE orcamentos_new RENAME TO orcamentos;
  `);
  console.log('✅ Tabela orcamentos atualizada');
  
  // Modalidades - verificar se existe
  const modalidadesExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='modalidades'").get();
  if (modalidadesExists) {
    db.exec(`
      CREATE TABLE modalidades_new (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL UNIQUE,
        taxa_capital REAL NOT NULL DEFAULT 0,
        taxa_imposto REAL NOT NULL DEFAULT 0,
        ativa BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      INSERT INTO modalidades_new (id, nome, taxa_capital, taxa_imposto, ativa, created_at, updated_at)
      SELECT id, nome, taxa_capital, taxa_imposto, ativa, created_at, updated_at
      FROM modalidades;
      
      DROP TABLE modalidades;
      ALTER TABLE modalidades_new RENAME TO modalidades;
    `);
    console.log('✅ Tabela modalidades atualizada');
  } else {
    console.log('⚠️ Tabela modalidades não existe, pulando...');
  }
  
  // Linhas_venda - remover companyId
  db.exec(`
    CREATE TABLE linhas_venda_new (
      id TEXT PRIMARY KEY,
      dataPedido TEXT NOT NULL,
      numeroOF TEXT,
      numeroDispensa TEXT,
      cliente TEXT,
      produto TEXT,
      modalidade TEXT,
      valorVenda REAL NOT NULL,
      taxaCapitalPerc REAL NOT NULL,
      taxaCapitalVl REAL NOT NULL,
      taxaImpostoPerc REAL NOT NULL,
      taxaImpostoVl REAL NOT NULL,
      custoMercadoria REAL NOT NULL,
      somaCustoFinal REAL NOT NULL,
      lucroValor REAL NOT NULL,
      lucroPerc REAL NOT NULL,
      dataRecebimento TEXT,
      paymentStatus TEXT NOT NULL,
      settlementStatus TEXT,
      acertoId TEXT,
      cor TEXT,
      createdAt TEXT NOT NULL
    );
    
    INSERT INTO linhas_venda_new (id, dataPedido, numeroOF, numeroDispensa, cliente, produto, modalidade, valorVenda, taxaCapitalPerc, taxaCapitalVl, taxaImpostoPerc, taxaImpostoVl, custoMercadoria, somaCustoFinal, lucroValor, lucroPerc, dataRecebimento, paymentStatus, settlementStatus, acertoId, cor, createdAt)
    SELECT id, dataPedido, numeroOF, numeroDispensa, cliente, produto, modalidade, valorVenda, taxaCapitalPerc, taxaCapitalVl, taxaImpostoPerc, taxaImpostoVl, custoMercadoria, somaCustoFinal, lucroValor, lucroPerc, dataRecebimento, paymentStatus, settlementStatus, acertoId, cor, createdAt
    FROM linhas_venda;
    
    DROP TABLE linhas_venda;
    ALTER TABLE linhas_venda_new RENAME TO linhas_venda;
  `);
  console.log('✅ Tabela linhas_venda atualizada');
  
  // 2. Remover tabela de empresas
  console.log('\n🏢 Removendo tabela de empresas...');
  db.exec('DROP TABLE IF EXISTS empresas;');
  console.log('✅ Tabela empresas removida');
  
  // 3. Limpar user_prefs removendo currentCompanyId
  console.log('\n👤 Limpando preferências de usuário...');
  const userPrefs = db.prepare('SELECT * FROM user_prefs WHERE userId = ?').get('default');
  if (userPrefs) {
    const prefs = JSON.parse(userPrefs.json);
    delete prefs.currentCompanyId;
    delete prefs.currentEmpresaId;
    
    db.prepare('UPDATE user_prefs SET json = ? WHERE userId = ?').run(
      JSON.stringify(prefs),
      'default'
    );
    console.log('✅ Preferências de usuário atualizadas');
  }
  
  console.log('\n🎉 Remoção de múltiplas empresas concluída com sucesso!');
  console.log('\n📊 Verificando estrutura final...');
  
  // Verificar estrutura final
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tabelas restantes:', tables.map(t => t.name));
  
  db.close();
} catch(error) {
  console.error('❌ Erro durante a remoção:', error.message);
}