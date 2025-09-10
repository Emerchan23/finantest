const Database = require('better-sqlite3')
const path = require('path')

// Conectar ao banco de dados
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite')
console.log('📂 Caminho do banco:', dbPath)

try {
  const db = new Database(dbPath)
  
  // Verificar se existe alguma empresa
  const empresas = db.prepare("SELECT rowid, * FROM empresas LIMIT 1").all()
  console.log('📊 Empresas encontradas:', empresas.length)
  
  if (empresas.length === 0) {
    console.log('❌ Nenhuma empresa encontrada na tabela')
    process.exit(1)
  }
  
  const empresa = empresas[0]
  console.log('🏢 Usando empresa:', empresa.nome || 'Sem nome', '(ROWID:', empresa.rowid, ')')
  
  // Configurar dados SMTP fornecidos pelo usuário
  console.log('\n🔧 Configurando credenciais SMTP fornecidas...')
  
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
  
  // Credenciais fornecidas pelo usuário
  const userConfig = {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_secure: 0, // false para STARTTLS
    smtp_user: 'skilevolution@gmail.com',
    smtp_password: 'mkdxjwjstnqmluvl', // Senha de app fornecida
    smtp_from_name: 'Sistema ERP',
    smtp_from_email: 'skilevolution@gmail.com'
  }
  
  const result = updateStmt.run(
    userConfig.smtp_host,
    userConfig.smtp_port,
    userConfig.smtp_secure,
    userConfig.smtp_user,
    userConfig.smtp_password,
    userConfig.smtp_from_name,
    userConfig.smtp_from_email,
    empresa.rowid
  )
  
  console.log('✅ Configurações SMTP atualizadas com sucesso!')
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
  
  console.log('\n✅ Pronto para testar envio de emails!')
  
  db.close()
  
} catch (error) {
  console.error('❌ Erro:', error)
  process.exit(1)
}