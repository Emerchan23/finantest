const Database = require('better-sqlite3');
const path = require('path');

// Caminho do banco de dados que o servidor está usando
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');

console.log('=== SIMPLIFICAÇÃO PARA EMPRESA ÚNICA ===');
console.log('Banco de dados:', dbPath);

try {
    const db = new Database(dbPath);
    
    // Desabilitar foreign keys temporariamente
    db.pragma('foreign_keys = OFF');
    console.log('🔧 Foreign keys desabilitadas temporariamente');
    
    console.log('\n1. Removendo colunas empresa_id das tabelas...');
    
    // Produtos - remover empresa_id
    console.log('\n📦 Atualizando tabela produtos...');
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
    
    // Vendas - remover empresa_id
    console.log('\n💰 Atualizando tabela vendas...');
    db.exec(`
        CREATE TABLE vendas_new (
            id TEXT PRIMARY KEY,
            cliente_id TEXT,
            produto_id TEXT,
            quantidade INTEGER NOT NULL,
            preco_unitario REAL NOT NULL,
            total REAL NOT NULL,
            data_venda DATETIME,
            created_at DATETIME,
            updated_at DATETIME
        );
        
        INSERT INTO vendas_new (id, cliente_id, produto_id, quantidade, preco_unitario, total, data_venda, created_at, updated_at)
        SELECT id, cliente_id, produto_id, quantidade, preco_unitario, total, data_venda, created_at, updated_at
        FROM vendas;
        
        DROP TABLE vendas;
        ALTER TABLE vendas_new RENAME TO vendas;
    `);
    console.log('✅ Tabela vendas atualizada');
    
    // Orcamentos - remover empresa_id
    console.log('\n📋 Atualizando tabela orcamentos...');
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
    
    // Clientes - remover empresa_id
    console.log('\n👥 Atualizando tabela clientes...');
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
    } else {
        console.log('⚠️ Nenhuma preferência de usuário encontrada');
    }
    
    console.log('\n🎉 Simplificação para empresa única concluída com sucesso!');
    console.log('\n📊 Verificando estrutura final...');
    
    // Verificar estrutura final
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tabelas restantes:', tables.map(t => t.name));
    
    // Verificar se ainda existem colunas empresa_id
    console.log('\n🔍 Verificando se ainda existem colunas empresa_id...');
    tables.forEach(table => {
        try {
            const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
            const empresaColumns = columns.filter(col => col.name.includes('empresa') || col.name.includes('company'));
            if (empresaColumns.length > 0) {
                console.log(`⚠️ Tabela ${table.name} ainda tem colunas relacionadas a empresa:`, empresaColumns.map(c => c.name));
            }
        } catch (err) {
            // Ignorar erros de tabelas do sistema
        }
    });
    
    db.close();
    console.log('\n✅ Verificação concluída. Sistema agora configurado para empresa única!');
    
} catch (error) {
    console.error('❌ Erro durante a simplificação:', error.message);
}