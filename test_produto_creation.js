const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
const db = new Database(dbPath);

try {
    console.log('🧪 Testando criação de produto via API...');
    
    // Simular dados que seriam enviados pelo formulário
    const novoProduto = {
        id: uuidv4(),
        nome: 'Teclado Mecânico Keychron K2',
        descricao: 'Teclado Mecânico Keychron K2, Switch Blue, RGB, Wireless, Layout ABNT2',
        marca: 'Keychron',
        preco: 599.99,
        custo: 420.00,
        taxa_imposto: 12.5,
        modalidade_venda: 'Parcelado',
        estoque: 20,
        categoria: 'Periféricos'
    };
    
    // Inserir produto
    const insertStmt = db.prepare(`
        INSERT INTO produtos (
            id, nome, descricao, marca, preco, custo, taxa_imposto, 
            modalidade_venda, estoque, categoria, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
        )
    `);
    
    insertStmt.run(
        novoProduto.id,
        novoProduto.nome,
        novoProduto.descricao,
        novoProduto.marca,
        novoProduto.preco,
        novoProduto.custo,
        novoProduto.taxa_imposto,
        novoProduto.modalidade_venda,
        novoProduto.estoque,
        novoProduto.categoria
    );
    
    console.log(`✅ Produto criado: ${novoProduto.nome} - ID: ${novoProduto.id}`);
    
    // Verificar se foi inserido corretamente
    const produtoInserido = db.prepare('SELECT * FROM produtos WHERE id = ?').get(novoProduto.id);
    
    if (produtoInserido) {
        console.log('\n📋 Dados do produto inserido:');
        console.log(`   Nome: ${produtoInserido.nome}`);
        console.log(`   Marca: ${produtoInserido.marca}`);
        console.log(`   Preço: R$ ${produtoInserido.preco}`);
        console.log(`   Custo: R$ ${produtoInserido.custo}`);
        console.log(`   Taxa Imposto: ${produtoInserido.taxa_imposto}%`);
        console.log(`   Estoque: ${produtoInserido.estoque} unidades`);
        console.log(`   Categoria: ${produtoInserido.categoria}`);
        console.log(`   Criado em: ${produtoInserido.created_at}`);
    }
    
    // Testar edição do produto
    console.log('\n🔄 Testando edição do produto...');
    const novoPreco = 649.99;
    const novoEstoque = 15;
    
    const updateStmt = db.prepare(`
        UPDATE produtos 
        SET preco = ?, estoque = ?, updated_at = datetime('now')
        WHERE id = ?
    `);
    
    updateStmt.run(novoPreco, novoEstoque, novoProduto.id);
    
    const produtoEditado = db.prepare('SELECT * FROM produtos WHERE id = ?').get(novoProduto.id);
    console.log(`✅ Produto editado - Novo preço: R$ ${produtoEditado.preco}, Novo estoque: ${produtoEditado.estoque}`);
    
    // Verificar total de produtos
    const total = db.prepare('SELECT COUNT(*) as total FROM produtos').get();
    console.log(`\n📊 Total de produtos no sistema: ${total.total}`);
    
} catch (error) {
    console.error('❌ Erro no teste:', error.message);
} finally {
    db.close();
    console.log('\n✅ Teste de produto concluído!');
}