const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
const db = new Database(dbPath);

try {
    console.log('📋 Estrutura da tabela produtos:');
    const tableInfo = db.prepare('PRAGMA table_info(produtos)').all();
    
    tableInfo.forEach(col => {
        const nullable = col.notnull ? '(NOT NULL)' : '(NULLABLE)';
        const pk = col.pk ? '(PRIMARY KEY)' : '';
        console.log(`   ${col.name}: ${col.type} ${nullable} ${pk}`);
    });
    
    console.log('\n📊 Produtos existentes:');
    const produtos = db.prepare('SELECT * FROM produtos LIMIT 5').all();
    console.log(`Total de produtos: ${produtos.length}`);
    
    if (produtos.length > 0) {
        console.log('Primeiros produtos:');
        produtos.forEach(produto => {
            console.log(`   ID: ${produto.id} - ${produto.nome} - R$ ${produto.preco}`);
        });
    }
    
} catch (error) {
    console.error('Erro:', error.message);
} finally {
    db.close();
}