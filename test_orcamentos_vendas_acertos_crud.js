const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
console.log('📂 Caminho do banco:', dbPath);

try {
    const db = new Database(dbPath);
    
    console.log('\n🧪 === TESTE CRUD - ORÇAMENTOS, VENDAS E ACERTOS ===\n');
    
    // ========== TESTE ORÇAMENTOS ==========
    console.log('💰 TESTANDO ORÇAMENTOS...');
    
    // Buscar um cliente existente
    const cliente = db.prepare('SELECT * FROM clientes LIMIT 1').get();
    if (!cliente) {
        console.log('❌ Nenhum cliente encontrado. Criando um cliente de teste...');
        const clienteId = uuidv4();
        const insertCliente = db.prepare(`
            INSERT INTO clientes (id, nome, cpf_cnpj, telefone, email, endereco, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        insertCliente.run(clienteId, 'Cliente Teste Orçamento', '12345678901', '11999999999', 'teste@teste.com', 'Rua Teste, 123', 1);
        console.log('✅ Cliente de teste criado');
    }
    
    // Criar orçamento
    const orcamentoId = uuidv4();
    const timestamp = Date.now();
    const novoOrcamento = {
        id: orcamentoId,
        numero: `ORC-TEST-${timestamp}`,
        cliente_id: cliente ? cliente.id : clienteId,
        data_orcamento: new Date().toISOString(),
        data_validade: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        valor_total: 1500.00,
        descricao: 'Orçamento de teste automatizado',
        status: 'pendente',
        observacoes: 'Teste CRUD orçamentos',
        modalidade: 'normal'
    };
    
    const insertOrcamento = db.prepare(`
        INSERT INTO orcamentos (id, numero, cliente_id, data_orcamento, data_validade, valor_total, descricao, status, observacoes, modalidade)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertOrcamento.run(
        novoOrcamento.id,
        novoOrcamento.numero,
        novoOrcamento.cliente_id,
        novoOrcamento.data_orcamento,
        novoOrcamento.data_validade,
        novoOrcamento.valor_total,
        novoOrcamento.descricao,
        novoOrcamento.status,
        novoOrcamento.observacoes,
        novoOrcamento.modalidade
    );
    
    console.log('✅ Orçamento criado:', novoOrcamento.numero);
    
    // Verificar se foi criado
    const orcamentoCriado = db.prepare('SELECT * FROM orcamentos WHERE id = ?').get(orcamentoId);
    if (orcamentoCriado) {
        console.log('✅ Orçamento verificado no banco');
    }
    
    // Editar orçamento
    const updateOrcamento = db.prepare(`
        UPDATE orcamentos 
        SET valor_total = ?, status = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    
    updateOrcamento.run(2000.00, 'aprovado', 'Orçamento editado via teste', orcamentoId);
    
    const orcamentoEditado = db.prepare('SELECT * FROM orcamentos WHERE id = ?').get(orcamentoId);
    if (orcamentoEditado && orcamentoEditado.valor_total === 2000 && orcamentoEditado.status === 'aprovado') {
        console.log('✅ Orçamento editado com sucesso');
    }
    
    // ========== TESTE VENDAS ==========
    console.log('\n🛒 TESTANDO VENDAS...');
    
    // Buscar um produto existente
    const produto = db.prepare('SELECT * FROM produtos LIMIT 1').get();
    if (!produto) {
        console.log('❌ Nenhum produto encontrado. Criando um produto de teste...');
        const produtoId = uuidv4();
        const insertProduto = db.prepare(`
            INSERT INTO produtos (id, nome, descricao, preco, categoria, ativo)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertProduto.run(produtoId, 'Produto Teste Venda', 'Produto para teste de venda', 100.00, 'Teste', 1);
        console.log('✅ Produto de teste criado');
    }
    
    // Criar venda
    const vendaId = uuidv4();
    const novaVenda = {
        id: vendaId,
        cliente_id: cliente ? cliente.id : clienteId,
        produto_id: produto ? produto.id : produtoId,
        quantidade: 5,
        preco_unitario: 100.00,
        total: 500.00,
        data_venda: new Date().toISOString()
    };
    
    const insertVenda = db.prepare(`
        INSERT INTO vendas (id, cliente_id, produto_id, quantidade, preco_unitario, total, data_venda)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertVenda.run(
        novaVenda.id,
        novaVenda.cliente_id,
        novaVenda.produto_id,
        novaVenda.quantidade,
        novaVenda.preco_unitario,
        novaVenda.total,
        novaVenda.data_venda
    );
    
    console.log('✅ Venda criada: R$', novaVenda.total);
    
    // Verificar se foi criada
    const vendaCriada = db.prepare('SELECT * FROM vendas WHERE id = ?').get(vendaId);
    if (vendaCriada) {
        console.log('✅ Venda verificada no banco');
    }
    
    // Editar venda
    const updateVenda = db.prepare(`
        UPDATE vendas 
        SET quantidade = ?, total = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    
    updateVenda.run(10, 1000.00, vendaId);
    
    const vendaEditada = db.prepare('SELECT * FROM vendas WHERE id = ?').get(vendaId);
    if (vendaEditada && vendaEditada.quantidade === 10 && vendaEditada.total === 1000) {
        console.log('✅ Venda editada com sucesso');
    }
    
    // ========== TESTE ACERTOS ==========
    console.log('\n📊 TESTANDO ACERTOS...');
    
    // Criar acerto
    const acertoId = uuidv4();
    const novoAcerto = {
        id: acertoId,
        data: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        titulo: `Acerto Teste ${timestamp}`,
        observacoes: 'Acerto criado via teste automatizado',
        totalLucro: 500.00,
        totalDespesasRateio: 100.00,
        totalDespesasIndividuais: 50.00,
        totalLiquidoDistribuivel: 350.00,
        status: 'aberto'
    };
    
    const insertAcerto = db.prepare(`
        INSERT INTO acertos (id, data, titulo, observacoes, totalLucro, totalDespesasRateio, totalDespesasIndividuais, totalLiquidoDistribuivel, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertAcerto.run(
        novoAcerto.id,
        novoAcerto.data,
        novoAcerto.titulo,
        novoAcerto.observacoes,
        novoAcerto.totalLucro,
        novoAcerto.totalDespesasRateio,
        novoAcerto.totalDespesasIndividuais,
        novoAcerto.totalLiquidoDistribuivel,
        novoAcerto.status
    );
    
    console.log('✅ Acerto criado:', novoAcerto.titulo);
    
    // Verificar se foi criado
    const acertoCriado = db.prepare('SELECT * FROM acertos WHERE id = ?').get(acertoId);
    if (acertoCriado) {
        console.log('✅ Acerto verificado no banco');
    }
    
    // Editar acerto
    const updateAcerto = db.prepare(`
        UPDATE acertos 
        SET status = ?, totalLucro = ?, observacoes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    
    updateAcerto.run('fechado', 600.00, 'Acerto editado e fechado via teste', acertoId);
    
    const acertoEditado = db.prepare('SELECT * FROM acertos WHERE id = ?').get(acertoId);
    if (acertoEditado && acertoEditado.status === 'fechado' && acertoEditado.totalLucro === 600) {
        console.log('✅ Acerto editado com sucesso');
    }
    
    // ========== TESTE DE EXCLUSÃO ==========
    console.log('\n🗑️ TESTANDO EXCLUSÕES...');
    
    // Excluir venda
    const deleteVenda = db.prepare('DELETE FROM vendas WHERE id = ?');
    deleteVenda.run(vendaId);
    
    const vendaExcluida = db.prepare('SELECT * FROM vendas WHERE id = ?').get(vendaId);
    if (!vendaExcluida) {
        console.log('✅ Venda excluída com sucesso');
    }
    
    // Excluir orçamento
    const deleteOrcamento = db.prepare('DELETE FROM orcamentos WHERE id = ?');
    deleteOrcamento.run(orcamentoId);
    
    const orcamentoExcluido = db.prepare('SELECT * FROM orcamentos WHERE id = ?').get(orcamentoId);
    if (!orcamentoExcluido) {
        console.log('✅ Orçamento excluído com sucesso');
    }
    
    // Excluir acerto
    const deleteAcerto = db.prepare('DELETE FROM acertos WHERE id = ?');
    deleteAcerto.run(acertoId);
    
    const acertoExcluido = db.prepare('SELECT * FROM acertos WHERE id = ?').get(acertoId);
    if (!acertoExcluido) {
        console.log('✅ Acerto excluído com sucesso');
    }
    
    // ========== ESTATÍSTICAS FINAIS ==========
    console.log('\n📈 ESTATÍSTICAS FINAIS:');
    
    const statsOrcamentos = db.prepare('SELECT COUNT(*) as total, SUM(valor_total) as soma FROM orcamentos').get();
    console.log(`📋 Orçamentos: ${statsOrcamentos.total} registros, Total: R$ ${statsOrcamentos.soma || 0}`);
    
    const statsVendas = db.prepare('SELECT COUNT(*) as total, SUM(total) as soma FROM vendas').get();
    console.log(`🛒 Vendas: ${statsVendas.total} registros, Total: R$ ${statsVendas.soma || 0}`);
    
    const statsAcertos = db.prepare('SELECT COUNT(*) as total, SUM(totalLucro) as soma FROM acertos').get();
    console.log(`📊 Acertos: ${statsAcertos.total} registros, Total Lucro: R$ ${statsAcertos.soma || 0}`);
    
    db.close();
    console.log('\n✅ Teste CRUD concluído com sucesso!');
    
} catch (error) {
    console.error('❌ Erro no teste CRUD:', error.message);
    process.exit(1);
}