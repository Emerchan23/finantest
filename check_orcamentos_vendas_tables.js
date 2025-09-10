const Database = require('better-sqlite3');
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
console.log('📂 Caminho do banco:', dbPath);

try {
    const db = new Database(dbPath);
    
    // Tabelas para verificar
    const tables = ['orcamentos', 'vendas', 'recebimentos', 'acertos'];
    
    tables.forEach(tableName => {
        console.log(`\n🔍 === ESTRUTURA DA TABELA ${tableName.toUpperCase()} ===`);
        
        try {
            // Verificar estrutura da tabela
            const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
            
            if (tableInfo.length === 0) {
                console.log(`❌ Tabela ${tableName} não existe`);
                return;
            }
            
            console.log('📋 Colunas:');
            tableInfo.forEach(col => {
                console.log(`   - ${col.name} (${col.type}) ${col.pk ? '[PK]' : ''} ${col.notnull ? '[NOT NULL]' : ''} ${col.dflt_value ? `[DEFAULT: ${col.dflt_value}]` : ''}`);
            });
            
            // Contar registros
            const count = db.prepare(`SELECT COUNT(*) as total FROM ${tableName}`).get();
            console.log(`📊 Total de registros: ${count.total}`);
            
            // Mostrar alguns registros de exemplo (máximo 3)
            if (count.total > 0) {
                const samples = db.prepare(`SELECT * FROM ${tableName} LIMIT 3`).all();
                console.log('📄 Exemplos de registros:');
                samples.forEach((record, index) => {
                    console.log(`   ${index + 1}:`, JSON.stringify(record, null, 2));
                });
            }
            
        } catch (error) {
            console.log(`❌ Erro ao verificar tabela ${tableName}:`, error.message);
        }
    });
    
    db.close();
    console.log('\n✅ Verificação concluída!');
    
} catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error.message);
    process.exit(1);
}