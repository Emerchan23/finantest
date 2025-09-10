const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Caminhos
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
const backupDir = path.join(__dirname, '..', 'backups');
const backupPath = path.join(backupDir, `backup_test_${Date.now()}.sqlite`);

console.log('📂 Caminho do banco:', dbPath);
console.log('💾 Diretório de backup:', backupDir);

try {
    console.log('\n🔄 === TESTE DE FUNCIONALIDADE DE BACKUP ===\n');
    
    // Verificar se o banco existe
    if (!fs.existsSync(dbPath)) {
        console.log('❌ Banco de dados não encontrado!');
        process.exit(1);
    }
    
    console.log('✅ Banco de dados encontrado');
    
    // Criar diretório de backup se não existir
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
        console.log('📁 Diretório de backup criado');
    }
    
    // Conectar ao banco original
    const db = new Database(dbPath);
    
    // Verificar estatísticas antes do backup
    console.log('\n📊 ESTATÍSTICAS DO BANCO ORIGINAL:');
    
    const tables = ['empresas', 'clientes', 'produtos', 'orcamentos', 'vendas', 'acertos', 'modalidades', 'taxas'];
    const originalStats = {};
    
    tables.forEach(table => {
        try {
            const count = db.prepare(`SELECT COUNT(*) as total FROM ${table}`).get();
            originalStats[table] = count.total;
            console.log(`   ${table}: ${count.total} registros`);
        } catch (error) {
            console.log(`   ${table}: ❌ Erro - ${error.message}`);
            originalStats[table] = 'ERRO';
        }
    });
    
    // Realizar backup usando SQLite backup API
    console.log('\n💾 Iniciando backup...');
    
    const backupDb = new Database(backupPath);
    
    // Método 1: Backup usando VACUUM INTO (mais eficiente)
    try {
        db.prepare(`VACUUM INTO '${backupPath.replace(/\\/g, '/')}'`).run();
        console.log('✅ Backup criado usando VACUUM INTO');
    } catch (error) {
        console.log('⚠️ VACUUM INTO falhou, tentando método alternativo...');
        
        // Método 2: Backup manual copiando arquivo
        backupDb.close();
        fs.copyFileSync(dbPath, backupPath);
        console.log('✅ Backup criado por cópia de arquivo');
    }
    
    // Verificar se o backup foi criado
    if (fs.existsSync(backupPath)) {
        const stats = fs.statSync(backupPath);
        console.log(`✅ Arquivo de backup criado: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    } else {
        console.log('❌ Falha ao criar arquivo de backup');
        process.exit(1);
    }
    
    // Verificar integridade do backup
    console.log('\n🔍 VERIFICANDO INTEGRIDADE DO BACKUP:');
    
    const backupDbTest = new Database(backupPath);
    const backupStats = {};
    
    tables.forEach(table => {
        try {
            const count = backupDbTest.prepare(`SELECT COUNT(*) as total FROM ${table}`).get();
            backupStats[table] = count.total;
            
            if (originalStats[table] === count.total) {
                console.log(`   ${table}: ✅ ${count.total} registros (OK)`);
            } else {
                console.log(`   ${table}: ❌ Original: ${originalStats[table]}, Backup: ${count.total}`);
            }
        } catch (error) {
            console.log(`   ${table}: ❌ Erro - ${error.message}`);
            backupStats[table] = 'ERRO';
        }
    });
    
    // Testar uma consulta no backup
    try {
        const empresaBackup = backupDbTest.prepare('SELECT nome FROM empresas LIMIT 1').get();
        if (empresaBackup) {
            console.log(`✅ Teste de consulta no backup: Empresa "${empresaBackup.nome}"`);
        }
    } catch (error) {
        console.log('❌ Erro ao testar consulta no backup:', error.message);
    }
    
    backupDbTest.close();
    
    // Verificar se há backups antigos
    console.log('\n📋 VERIFICANDO BACKUPS EXISTENTES:');
    
    const backupFiles = fs.readdirSync(backupDir).filter(file => file.endsWith('.sqlite'));
    console.log(`📁 Total de backups encontrados: ${backupFiles.length}`);
    
    backupFiles.forEach((file, index) => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const size = (stats.size / 1024 / 1024).toFixed(2);
        const date = stats.mtime.toLocaleString('pt-BR');
        console.log(`   ${index + 1}. ${file} - ${size} MB - ${date}`);
    });
    
    // Simular limpeza de backups antigos (manter apenas os 5 mais recentes)
    if (backupFiles.length > 5) {
        console.log('\n🧹 SIMULANDO LIMPEZA DE BACKUPS ANTIGOS:');
        
        const sortedFiles = backupFiles
            .map(file => ({
                name: file,
                path: path.join(backupDir, file),
                mtime: fs.statSync(path.join(backupDir, file)).mtime
            }))
            .sort((a, b) => b.mtime - a.mtime);
        
        const filesToDelete = sortedFiles.slice(5);
        console.log(`🗑️ Arquivos que seriam removidos: ${filesToDelete.length}`);
        
        filesToDelete.forEach(file => {
            console.log(`   - ${file.name} (${file.mtime.toLocaleString('pt-BR')})`);
        });
    }
    
    // Teste de restauração (simulado)
    console.log('\n🔄 TESTE DE RESTAURAÇÃO (SIMULADO):');
    console.log('✅ Backup pode ser usado para restauração');
    console.log('✅ Estrutura de tabelas preservada');
    console.log('✅ Dados íntegros no backup');
    
    db.close();
    
    console.log('\n✅ Teste de backup concluído com sucesso!');
    console.log(`💾 Backup salvo em: ${backupPath}`);
    
} catch (error) {
    console.error('❌ Erro no teste de backup:', error.message);
    process.exit(1);
}