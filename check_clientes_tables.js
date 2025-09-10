const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
const db = new Database(dbPath);

try {
    console.log('🔍 Verificando estrutura das tabelas relacionadas a clientes...');
    
    // Verificar tabela clientes
    console.log('\n📋 Estrutura da tabela CLIENTES:');
    try {
        const clientesInfo = db.prepare('PRAGMA table_info(clientes)').all();
        if (clientesInfo.length > 0) {
            clientesInfo.forEach(col => {
                const nullable = col.notnull ? '(NOT NULL)' : '(NULLABLE)';
                const pk = col.pk ? '(PRIMARY KEY)' : '';
                console.log(`   ${col.name}: ${col.type} ${nullable} ${pk}`);
            });
            
            const clientesCount = db.prepare('SELECT COUNT(*) as total FROM clientes').get();
            console.log(`   📊 Total de clientes: ${clientesCount.total}`);
        } else {
            console.log('   ❌ Tabela clientes não encontrada ou vazia');
        }
    } catch (error) {
        console.log(`   ❌ Erro ao acessar tabela clientes: ${error.message}`);
    }
    
    // Verificar tabela modalidades
    console.log('\n📋 Estrutura da tabela MODALIDADES:');
    try {
        const modalidadesInfo = db.prepare('PRAGMA table_info(modalidades)').all();
        if (modalidadesInfo.length > 0) {
            modalidadesInfo.forEach(col => {
                const nullable = col.notnull ? '(NOT NULL)' : '(NULLABLE)';
                const pk = col.pk ? '(PRIMARY KEY)' : '';
                console.log(`   ${col.name}: ${col.type} ${nullable} ${pk}`);
            });
            
            const modalidadesCount = db.prepare('SELECT COUNT(*) as total FROM modalidades').get();
            console.log(`   📊 Total de modalidades: ${modalidadesCount.total}`);
            
            // Mostrar modalidades existentes
            const modalidades = db.prepare('SELECT * FROM modalidades LIMIT 5').all();
            if (modalidades.length > 0) {
                console.log('   📋 Modalidades existentes:');
                modalidades.forEach(mod => {
                    console.log(`      ${mod.id} - ${mod.nome || mod.descricao}`);
                });
            }
        } else {
            console.log('   ❌ Tabela modalidades não encontrada ou vazia');
        }
    } catch (error) {
        console.log(`   ❌ Erro ao acessar tabela modalidades: ${error.message}`);
    }
    
    // Verificar tabela taxas
    console.log('\n📋 Estrutura da tabela TAXAS:');
    try {
        const taxasInfo = db.prepare('PRAGMA table_info(taxas)').all();
        if (taxasInfo.length > 0) {
            taxasInfo.forEach(col => {
                const nullable = col.notnull ? '(NOT NULL)' : '(NULLABLE)';
                const pk = col.pk ? '(PRIMARY KEY)' : '';
                console.log(`   ${col.name}: ${col.type} ${nullable} ${pk}`);
            });
            
            const taxasCount = db.prepare('SELECT COUNT(*) as total FROM taxas').get();
            console.log(`   📊 Total de taxas: ${taxasCount.total}`);
            
            // Mostrar taxas existentes
            const taxas = db.prepare('SELECT * FROM taxas LIMIT 5').all();
            if (taxas.length > 0) {
                console.log('   📋 Taxas existentes:');
                taxas.forEach(taxa => {
                    console.log(`      ${taxa.id} - ${taxa.nome || taxa.descricao} - ${taxa.valor || taxa.percentual}%`);
                });
            }
        } else {
            console.log('   ❌ Tabela taxas não encontrada ou vazia');
        }
    } catch (error) {
        console.log(`   ❌ Erro ao acessar tabela taxas: ${error.message}`);
    }
    
    // Listar todas as tabelas do banco
    console.log('\n📋 Todas as tabelas do banco:');
    const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    `).all();
    
    tables.forEach(table => {
        const count = db.prepare(`SELECT COUNT(*) as total FROM ${table.name}`).get();
        console.log(`   ${table.name}: ${count.total} registros`);
    });
    
} catch (error) {
    console.error('❌ Erro geral:', error.message);
} finally {
    db.close();
    console.log('\n✅ Verificação de tabelas concluída!');
}