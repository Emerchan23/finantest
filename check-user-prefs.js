const Database = require('better-sqlite3');

const db = new Database('./banco-de-dados/erp.sqlite');

console.log('Estrutura da tabela user_prefs:');
const info = db.pragma('table_info(user_prefs)');
info.forEach(col => {
  console.log(`- ${col.name}: ${col.type} (${col.notnull ? 'NOT NULL' : 'NULL'}) ${col.pk ? 'PRIMARY KEY' : ''}`);
});

console.log('\nDados atuais na tabela user_prefs:');
const prefs = db.prepare('SELECT * FROM user_prefs').all();
console.log(JSON.stringify(prefs, null, 2));

db.close();