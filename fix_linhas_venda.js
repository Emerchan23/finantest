const Database = require('better-sqlite3');
const path = require('path');

// Caminho do banco de dados que o servidor está usando
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');

console.log('=== CORRIGINDO TABELA LINHAS_VENDA ===');
console.log('Banco de dados:', dbPath);

try {
    const db = new Database(dbPath);
    
    // Desabilitar foreign keys temporariamente
    db.pragma('foreign_keys = OFF');
    console.log('🔧 Foreign keys desabilitadas temporariamente');
    
    // Limpar tabela temporária se existir
    console.log('\n🧹 Limpando tabela temporária...');
    db.exec('DROP TABLE IF EXISTS linhas_venda_new;');
    console.log('✅ Tabela temporária removida');
    
    // Verificar estrutura atual da tabela linhas_venda
    console.log('\n📋 Verificando estrutura atual da tabela linhas_venda...');
    const columns = db.prepare('PRAGMA table_info(linhas_venda)').all();
    console.log('Colunas atuais:', columns.map(c => `${c.name} (${c.type})`));
    
    // Contar registros
    const count = db.prepare('SELECT COUNT(*) as count FROM linhas_venda').get();
    console.log(`Registros na tabela: ${count.count}`);
    
    // Remover coluna companyId da tabela linhas_venda
    console.log('\n📝 Atualizando tabela linhas_venda...');
    
    // Criar nova tabela sem companyId, baseada na estrutura real
    db.exec(`
        CREATE TABLE linhas_venda_new (
            id TEXT PRIMARY KEY,
            dataPedido TEXT,
            numeroOF TEXT,
            numeroDispensa TEXT,
            cliente TEXT,
            produto TEXT,
            modalidade TEXT,
            valorVenda REAL,
            taxaCapitalPerc REAL,
            taxaCapitalVl REAL,
            taxaImpostoPerc REAL,
            taxaImpostoVl REAL,
            custoMercadoria REAL,
            somaCustoFinal REAL,
            lucroValor REAL,
            lucroPerc REAL,
            dataRecebimento TEXT,
            paymentStatus TEXT,
            settlementStatus TEXT,
            acertoId TEXT,
            cor TEXT,
            createdAt TEXT
        );
    `);
    
    // Copiar dados (excluindo companyId)
    db.exec(`
        INSERT INTO linhas_venda_new (
            id, dataPedido, numeroOF, numeroDispensa, cliente, produto, modalidade,
            valorVenda, taxaCapitalPerc, taxaCapitalVl, taxaImpostoPerc, taxaImpostoVl,
            custoMercadoria, somaCustoFinal, lucroValor, lucroPerc, dataRecebimento,
            paymentStatus, settlementStatus, acertoId, cor, createdAt
        )
        SELECT 
            id, dataPedido, numeroOF, numeroDispensa, cliente, produto, modalidade,
            valorVenda, taxaCapitalPerc, taxaCapitalVl, taxaImpostoPerc, taxaImpostoVl,
            custoMercadoria, somaCustoFinal, lucroValor, lucroPerc, dataRecebimento,
            paymentStatus, settlementStatus, acertoId, cor, createdAt
        FROM linhas_venda;
    `);
    
    // Substituir tabela
    db.exec(`
        DROP TABLE linhas_venda;
        ALTER TABLE linhas_venda_new RENAME TO linhas_venda;
    `);
    
    console.log('✅ Tabela linhas_venda atualizada');
    
    // Reabilitar foreign keys
    db.pragma('foreign_keys = ON');
    console.log('🔧 Foreign keys reabilitadas');
    
    // Verificação final
    console.log('\n🔍 Verificação final...');
    const finalColumns = db.prepare('PRAGMA table_info(linhas_venda)').all();
    console.log('Colunas finais:', finalColumns.map(c => `${c.name} (${c.type})`));
    
    const finalCount = db.prepare('SELECT COUNT(*) as count FROM linhas_venda').get();
    console.log(`Registros preservados: ${finalCount.count}`);
    
    // Verificar se ainda existem colunas relacionadas a empresa em todo o banco
    console.log('\n🔍 Verificação completa do banco...');
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    let foundEmpresaColumns = false;
    
    tables.forEach(table => {
        try {
            const tableColumns = db.prepare(`PRAGMA table_info(${table.name})`).all();
            const empresaColumns = tableColumns.filter(col => 
                col.name.includes('empresa') || 
                col.name.includes('company') || 
                col.name.includes('Company')
            );
            if (empresaColumns.length > 0) {
                console.log(`⚠️ Tabela ${table.name} ainda tem colunas relacionadas a empresa:`, empresaColumns.map(c => c.name));
                foundEmpresaColumns = true;
            }
        } catch (err) {
            // Ignorar erros de tabelas do sistema
        }
    });
    
    if (!foundEmpresaColumns) {
        console.log('✅ Nenhuma coluna relacionada a empresa encontrada em todo o banco!');
    }
    
    db.close();
    console.log('\n🎉 Correção concluída com sucesso!');
    
} catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
    console.error('Stack:', error.stack);
}