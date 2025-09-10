const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
const db = new Database(dbPath);

try {
    console.log('🗑️ Testando exclusão de produtos...');
    
    // Primeiro, criar um produto temporário para deletar
    const produtoTemp = {
        id: uuidv4(),
        nome: 'Produto Temporário para Teste',
        descricao: 'Este produto será deletado durante o teste',
        marca: 'Teste',
        preco: 99.99,
        custo: 50.00,
        taxa_imposto: 10.0,
        modalidade_venda: 'À vista',
        estoque: 1,
        categoria: 'Teste'
    };
    
    // Inserir produto temporário
    const insertStmt = db.prepare(`
        INSERT INTO produtos (
            id, nome, descricao, marca, preco, custo, taxa_imposto, 
            modalidade_venda, estoque, categoria, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
        )
    `);
    
    insertStmt.run(
        produtoTemp.id,
        produtoTemp.nome,
        produtoTemp.descricao,
        produtoTemp.marca,
        produtoTemp.preco,
        produtoTemp.custo,
        produtoTemp.taxa_imposto,
        produtoTemp.modalidade_venda,
        produtoTemp.estoque,
        produtoTemp.categoria
    );
    
    console.log(`✅ Produto temporário criado: ${produtoTemp.nome}`);
    
    // Verificar se existe
    let produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(produtoTemp.id);
    console.log(`📋 Produto existe antes da exclusão: ${produto ? 'SIM' : 'NÃO'}`);
    
    // Deletar o produto
    const deleteStmt = db.prepare('DELETE FROM produtos WHERE id = ?');
    const result = deleteStmt.run(produtoTemp.id);
    
    console.log(`🗑️ Produto deletado - Linhas afetadas: ${result.changes}`);
    
    // Verificar se foi deletado
    produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(produtoTemp.id);
    console.log(`📋 Produto existe após exclusão: ${produto ? 'SIM' : 'NÃO'}`);
    
    console.log('\n🔍 Testando validações de campos...');
    
    // Teste 1: Produto sem nome (deve falhar)
    try {
        const produtoSemNome = {
            id: uuidv4(),
            nome: null, // Nome obrigatório
            preco: 100.00
        };
        
        insertStmt.run(
            produtoSemNome.id,
            produtoSemNome.nome,
            'Descrição teste',
            'Marca teste',
            produtoSemNome.preco,
            50.00,
            10.0,
            'À vista',
            1,
            'Teste'
        );
        console.log('❌ ERRO: Produto sem nome foi inserido (não deveria)');
    } catch (error) {
        console.log('✅ Validação OK: Produto sem nome foi rejeitado');
    }
    
    // Teste 2: Produto sem preço (deve falhar)
    try {
        const produtoSemPreco = {
            id: uuidv4(),
            nome: 'Produto Teste',
            preco: null // Preço obrigatório
        };
        
        insertStmt.run(
            produtoSemPreco.id,
            produtoSemPreco.nome,
            'Descrição teste',
            'Marca teste',
            produtoSemPreco.preco,
            50.00,
            10.0,
            'À vista',
            1,
            'Teste'
        );
        console.log('❌ ERRO: Produto sem preço foi inserido (não deveria)');
    } catch (error) {
        console.log('✅ Validação OK: Produto sem preço foi rejeitado');
    }
    
    // Verificar produtos por categoria
    console.log('\n📊 Resumo por categoria:');
    const categorias = db.prepare(`
        SELECT categoria, COUNT(*) as quantidade, 
               MIN(preco) as menor_preco,
               MAX(preco) as maior_preco,
               AVG(preco) as preco_medio
        FROM produtos 
        WHERE categoria IS NOT NULL
        GROUP BY categoria
        ORDER BY quantidade DESC
    `).all();
    
    categorias.forEach(cat => {
        console.log(`   ${cat.categoria}: ${cat.quantidade} produtos`);
        console.log(`      Preço: R$ ${cat.menor_preco.toFixed(2)} - R$ ${cat.maior_preco.toFixed(2)} (média: R$ ${cat.preco_medio.toFixed(2)})`);
    });
    
    // Total final
    const totalFinal = db.prepare('SELECT COUNT(*) as total FROM produtos').get();
    console.log(`\n📊 Total final de produtos: ${totalFinal.total}`);
    
} catch (error) {
    console.error('❌ Erro no teste:', error.message);
} finally {
    db.close();
    console.log('\n✅ Teste de exclusão e validação concluído!');
}