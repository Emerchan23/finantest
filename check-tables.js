const Database = require('better-sqlite3');

try {
  const db = new Database('./banco-de-dados/erp.sqlite');
  
  const tables = ['clientes', 'produtos', 'orcamentos', 'modalidades', 'linhas_venda'];
  
  tables.forEach(tableName => {
    console.log(`\n=== ${tableName} ===`);
    try {
      const info = db.pragma(`table_info(${tableName})`);
      info.forEach(col => {
        console.log(`  ${col.name}: ${col.type}${col.pk ? ' (PK)' : ''}${col.notnull ? ' NOT NULL' : ''}`);
      });
    } catch(e) {
      console.log(`Erro: ${e.message}`);
    }
  });
  
  db.close();
} catch(error) {
  console.error('Erro:', error.message);
}