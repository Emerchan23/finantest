const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
const db = new Database(dbPath);

const produtosReais = [
    {
        nome: 'Notebook Dell Inspiron 15',
        descricao: 'Notebook Dell Inspiron 15 3000, Intel Core i5, 8GB RAM, 256GB SSD, Tela 15.6"',
        marca: 'Dell',
        preco: 2899.99,
        custo: 2200.00,
        taxa_imposto: 18.5,
        modalidade_venda: 'À vista',
        estoque: 15,
        categoria: 'Informática'
    },
    {
        nome: 'Mouse Gamer Logitech G502',
        descricao: 'Mouse Gamer Logitech G502 HERO, RGB, 25600 DPI, 11 Botões Programáveis',
        marca: 'Logitech',
        preco: 299.90,
        custo: 180.00,
        taxa_imposto: 12.0,
        modalidade_venda: 'Parcelado',
        estoque: 50,
        categoria: 'Periféricos'
    },
    {
        nome: 'Smartphone Samsung Galaxy A54',
        descricao: 'Samsung Galaxy A54 5G, 128GB, 6GB RAM, Câmera Tripla 50MP, Tela 6.4"',
        marca: 'Samsung',
        preco: 1599.00,
        custo: 1200.00,
        taxa_imposto: 15.0,
        modalidade_venda: 'À vista',
        estoque: 25,
        categoria: 'Celulares'
    },
    {
        nome: 'Cadeira Gamer DT3 Sports Elise',
        descricao: 'Cadeira Gamer DT3 Sports Elise, Tecido, Apoio de Braço 2D, Preta e Rosa',
        marca: 'DT3 Sports',
        preco: 899.99,
        custo: 650.00,
        taxa_imposto: 10.0,
        modalidade_venda: 'Parcelado',
        estoque: 8,
        categoria: 'Móveis'
    },
    {
        nome: 'Fone de Ouvido Sony WH-1000XM4',
        descricao: 'Fone de Ouvido Sony WH-1000XM4, Bluetooth, Cancelamento de Ruído, 30h Bateria',
        marca: 'Sony',
        preco: 1299.00,
        custo: 950.00,
        taxa_imposto: 14.0,
        modalidade_venda: 'À vista',
        estoque: 12,
        categoria: 'Áudio'
    }
];

try {
    console.log('🛍️ Inserindo produtos de teste...');
    
    const insertStmt = db.prepare(`
        INSERT INTO produtos (
            id, nome, descricao, marca, preco, custo, taxa_imposto, 
            modalidade_venda, estoque, categoria, created_at, updated_at
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')
        )
    `);
    
    produtosReais.forEach((produto, index) => {
        const id = uuidv4();
        insertStmt.run(
            id,
            produto.nome,
            produto.descricao,
            produto.marca,
            produto.preco,
            produto.custo,
            produto.taxa_imposto,
            produto.modalidade_venda,
            produto.estoque,
            produto.categoria
        );
        console.log(`✅ ${index + 1}. ${produto.nome} - R$ ${produto.preco}`);
    });
    
    console.log('\n📊 Verificando produtos inseridos:');
    const total = db.prepare('SELECT COUNT(*) as total FROM produtos').get();
    console.log(`Total de produtos no banco: ${total.total}`);
    
    console.log('\n🎯 Produtos por categoria:');
    const categorias = db.prepare(`
        SELECT categoria, COUNT(*) as quantidade, 
               AVG(preco) as preco_medio,
               SUM(estoque) as estoque_total
        FROM produtos 
        WHERE categoria IS NOT NULL
        GROUP BY categoria
        ORDER BY quantidade DESC
    `).all();
    
    categorias.forEach(cat => {
        console.log(`   ${cat.categoria}: ${cat.quantidade} produtos, Preço médio: R$ ${cat.preco_medio.toFixed(2)}, Estoque: ${cat.estoque_total}`);
    });
    
} catch (error) {
    console.error('❌ Erro ao inserir produtos:', error.message);
} finally {
    db.close();
    console.log('\n✅ Produtos de teste inseridos com sucesso!');
}