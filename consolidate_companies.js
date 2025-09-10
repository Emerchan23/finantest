const Database = require('better-sqlite3');
const path = require('path');

// Caminho do banco de dados que o servidor está usando
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');

console.log('=== CONSOLIDAÇÃO DE EMPRESAS ===');
console.log('Banco de dados:', dbPath);

let db;
try {
    db = new Database(dbPath);
    console.log('Conectado ao banco de dados.');
} catch (err) {
    console.error('Erro ao conectar com o banco:', err.message);
    process.exit(1);
}

// Função para listar todas as empresas
function listCompanies() {
    try {
        const stmt = db.prepare('SELECT * FROM empresas ORDER BY id');
        return stmt.all();
    } catch (err) {
        throw err;
    }
}

// Função para manter apenas a primeira empresa
function keepOnlyFirstCompany(companies) {
    if (companies.length <= 1) {
        console.log('Apenas uma empresa encontrada. Nenhuma ação necessária.');
        return;
    }

    const firstCompany = companies[0];
    console.log(`\nMantendo empresa principal:`);
    console.log(`ID: ${firstCompany.id}`);
    console.log(`Nome: ${firstCompany.nome}`);

    // IDs das empresas a serem removidas
    const idsToRemove = companies.slice(1).map(c => c.id);
    console.log(`\nRemovendo ${idsToRemove.length} empresa(s):`);
    companies.slice(1).forEach(c => {
        console.log(`- ${c.nome} (ID: ${c.id})`);
    });

    try {
        // Criar placeholders para a query
        const placeholders = idsToRemove.map(() => '?').join(',');
        const deleteQuery = `DELETE FROM empresas WHERE id IN (${placeholders})`;
        const stmt = db.prepare(deleteQuery);
        const result = stmt.run(...idsToRemove);
        console.log(`\n✅ ${result.changes} empresa(s) removida(s) com sucesso.`);
    } catch (err) {
        throw err;
    }
}

// Função principal
function main() {
    try {
        console.log('\n1. Listando empresas existentes...');
        const companies = listCompanies();
        
        console.log(`\nEmpresas encontradas: ${companies.length}`);
        companies.forEach((company, index) => {
            console.log(`${index + 1}. ${company.nome} (ID: ${company.id})`);
        });

        console.log('\n2. Consolidando empresas...');
        keepOnlyFirstCompany(companies);

        console.log('\n3. Verificando resultado final...');
        const finalCompanies = listCompanies();
        console.log(`\nEmpresas restantes: ${finalCompanies.length}`);
        finalCompanies.forEach((company, index) => {
            console.log(`${index + 1}. ${company.nome} (ID: ${company.id})`);
        });

        console.log('\n✅ Consolidação concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante a consolidação:', error.message);
    } finally {
        if (db) {
            db.close();
            console.log('\nConexão com o banco fechada.');
        }
    }
}

main();