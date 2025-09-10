const Database = require('better-sqlite3');

try {
  const db = new Database('./banco-de-dados/erp.sqlite');
  
  // Listar todas as tabelas
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tabelas encontradas:', tables.map(t => t.name));
  
  // Examinar estrutura de cada tabela
  tables.forEach(table => {
    try {
      const info = db.pragma(`table_info(${table.name})`);
      console.log(`\n=== ${table.name} ===`);
      info.forEach(col => {
        console.log(`  ${col.name}: ${col.type}${col.pk ? ' (PRIMARY KEY)' : ''}${col.notnull ? ' NOT NULL' : ''}`);
      });
      
      // Verificar se tem referências a empresa
      const hasEmpresa = info.some(col => 
        col.name.toLowerCase().includes('empresa') || 
        col.name.toLowerCase().includes('company')
      );
      if (hasEmpresa) {
        console.log('  *** TABELA COM REFERÊNCIA A EMPRESA ***');
      }
    } catch(e) {
      console.log(`Erro ao examinar ${table.name}:`, e.message);
    }
  });
  
  db.close();
  console.log('\nExame do banco concluído.');
} catch(error) {
  console.error('Erro ao conectar ao banco:', error.message);
}