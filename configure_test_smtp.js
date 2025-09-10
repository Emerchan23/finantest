const Database = require('better-sqlite3')
const path = require('path')

// Conectar ao banco de dados
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite')
console.log('📂 Caminho do banco:', dbPath)

try {
  const db = new Database(dbPath)
  
  // Verificar estrutura da tabela empresas
  const tableInfo = db.prepare("PRAGMA table_info(empresas)").all()
  console.log('📋 Estrutura da tabela empresas:')
  tableInfo.forEach(col => {
    if (col.name.includes('smtp')) {
      console.log(`   ${col.name}: ${col.type}`)
    }
  })
  
  // Verificar se existe alguma empresa
  const empresas = db.prepare("SELECT rowid, * FROM empresas LIMIT 5").all()
  console.log('\n📊 Empresas encontradas:', empresas.length)
  
  if (empresas.length === 0) {
    console.log('❌ Nenhuma empresa encontrada na tabela')
    process.exit(1)
  }
  
  const empresa = empresas[0]
  console.log('🏢 Usando empresa:', empresa.nome || 'Sem nome', '(ROWID:', empresa.rowid, ')')
  
  // Configurar dados de teste SMTP (exemplo para Gmail)
  console.log('\n🔧 Configurando dados de teste SMTP...')
  
  const updateStmt = db.prepare(`
    UPDATE empresas 
    SET 
      smtp_host = ?,
      smtp_port = ?,
      smtp_secure = ?,
      smtp_user = ?,
      smtp_password = ?,
      smtp_from_name = ?,
      smtp_from_email = ?
    WHERE rowid = ?
  `)
  
  // Dados de exemplo (usuário deve substituir pelos dados reais)
  const testConfig = {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_secure: 0, // false para STARTTLS
    smtp_user: 'teste@gmail.com', // SUBSTITUA pelo seu email
    smtp_password: 'abcdefghijklmnop', // Senha de app válida de 16 caracteres
    smtp_from_name: 'Sistema ERP',
    smtp_from_email: 'teste@gmail.com' // SUBSTITUA pelo seu email
  }
  
  const result = updateStmt.run(
    testConfig.smtp_host,
    testConfig.smtp_port,
    testConfig.smtp_secure,
    testConfig.smtp_user,
    testConfig.smtp_password,
    testConfig.smtp_from_name,
    testConfig.smtp_from_email,
    empresa.rowid
  )
  
  console.log('✅ Configurações SMTP atualizadas!')
  console.log('📊 Registros afetados:', result.changes)
  
  // Verificar as configurações atualizadas
  const config = db.prepare("SELECT * FROM empresas WHERE rowid = ?").get(empresa.rowid)
  console.log('\n📋 Configurações atuais:')
  console.log(`   Host: ${config.smtp_host}`)
  console.log(`   Porta: ${config.smtp_port}`)
  console.log(`   Usuário: ${config.smtp_user}`)
  console.log(`   Senha: ${config.smtp_password ? '***definida' : 'não definida'}`)
  console.log(`   Nome do remetente: ${config.smtp_from_name}`)
  console.log(`   Email do remetente: ${config.smtp_from_email}`)
  
  console.log('\n⚠️  IMPORTANTE:')
  console.log('1. Substitua "seu-email@gmail.com" pelo seu email real')
  console.log('2. Substitua "sua-senha-de-app" pela senha de app do Gmail')
  console.log('3. Para Gmail, você DEVE usar uma senha de app, não a senha normal')
  console.log('4. Acesse https://myaccount.google.com/security para gerar a senha de app')
  
  db.close()
  
} catch (error) {
  console.error('❌ Erro:', error)
  process.exit(1)
}