const Database = require('better-sqlite3');
const path = require('path');

try {
    const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
    const db = new Database(dbPath);
    
    console.log('🔍 Verificando estruturas das tabelas...');
    
    // Verificar estrutura da tabela clientes
    console.log('\n👥 TABELA CLIENTES:');
    const clientesInfo = db.prepare('PRAGMA table_info(clientes)').all();
    clientesInfo.forEach(col => {
        console.log(`- ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Verificar estrutura da tabela modalidades
    console.log('\n💳 TABELA MODALIDADES:');
    const modalidadesInfo = db.prepare('PRAGMA table_info(modalidades)').all();
    modalidadesInfo.forEach(col => {
        console.log(`- ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Verificar estrutura da tabela taxas
    console.log('\n💰 TABELA TAXAS:');
    const taxasInfo = db.prepare('PRAGMA table_info(taxas)').all();
    taxasInfo.forEach(col => {
        console.log(`- ${col.name} (${col.type}) ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // Mostrar alguns dados de exemplo
    console.log('\n📋 DADOS DE EXEMPLO:');
    
    console.log('\n👥 Clientes (primeiros 3):');
    const clientes = db.prepare('SELECT * FROM clientes LIMIT 3').all();
    clientes.forEach((cliente, index) => {
        console.log(`${index + 1}. ID: ${cliente.id}, Nome: ${cliente.nome}`);
    });
    
    console.log('\n💳 Modalidades (primeiras 3):');
    const modalidades = db.prepare('SELECT * FROM modalidades LIMIT 3').all();
    modalidades.forEach((modalidade, index) => {
        console.log(`${index + 1}. ID: ${modalidade.id}, Nome: ${modalidade.nome}, Ativo: ${modalidade.ativo}`);
    });
    
    console.log('\n💰 Taxas (primeiras 3):');
    const taxas = db.prepare('SELECT * FROM taxas LIMIT 3').all();
    taxas.forEach((taxa, index) => {
        console.log(`${index + 1}. ID: ${taxa.id}, Nome: ${taxa.nome}, Percentual: ${taxa.percentual}%, Tipo: ${taxa.tipo}`);
    });
    
    db.close();
    
} catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
}