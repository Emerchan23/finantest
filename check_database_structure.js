const Database = require('better-sqlite3');
const path = require('path');

try {
    const dbPath = path.join(__dirname, 'banco-de-dados', 'erp.sqlite');
    console.log('📂 Caminho do banco:', dbPath);
    
    const db = new Database(dbPath);
    
    console.log('\n📊 === ESTRUTURA DO BANCO DE DADOS ===\n');
    
    // Listar todas as tabelas
    console.log('📋 TABELAS DISPONÍVEIS:');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    tables.forEach(table => {
        console.log(`- ${table.name}`);
    });
    
    // Verificar se existe alguma tabela com configurações
    console.log('\n🔍 PROCURANDO CONFIGURAÇÕES SMTP...');
    
    for (const table of tables) {
        try {
            const columns = db.prepare(`PRAGMA table_info(${table.name})`).all();
            const smtpColumns = columns.filter(col => 
                col.name.toLowerCase().includes('smtp') || 
                col.name.toLowerCase().includes('email') ||
                col.name.toLowerCase().includes('mail')
            );
            
            if (smtpColumns.length > 0) {
                console.log(`\n📧 Tabela '${table.name}' tem colunas relacionadas a email:`);
                smtpColumns.forEach(col => {
                    console.log(`  - ${col.name} (${col.type})`);
                });
                
                // Mostrar dados da tabela
                const data = db.prepare(`SELECT * FROM ${table.name} LIMIT 3`).all();
                if (data.length > 0) {
                    console.log(`\n📊 Dados atuais da tabela '${table.name}':`);
                    data.forEach((row, index) => {
                        console.log(`  Registro ${index + 1}:`, row);
                    });
                }
            }
        } catch (error) {
            console.log(`❌ Erro ao verificar tabela ${table.name}:`, error.message);
        }
    }
    
    db.close();
    console.log('\n✅ Verificação da estrutura concluída!');
    
} catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error.message);
    process.exit(1);
}