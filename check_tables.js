const Database = require('better-sqlite3');
const path = require('path');

try {
    const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
    const db = new Database(dbPath);
    
    console.log('📋 Verificando tabelas do banco de dados...');
    
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    console.log('\n🗂️ Tabelas disponíveis:');
    tables.forEach(table => {
        console.log(`- ${table.name}`);
    });
    
    console.log('\n📊 Contagem de registros por tabela:');
    tables.forEach(table => {
        try {
            const count = db.prepare(`SELECT COUNT(*) as total FROM ${table.name}`).get();
            console.log(`- ${table.name}: ${count.total} registros`);
        } catch (error) {
            console.log(`- ${table.name}: erro ao contar (${error.message})`);
        }
    });
    
    db.close();
    
} catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
}