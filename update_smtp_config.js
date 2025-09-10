const Database = require('better-sqlite3')
const path = require('path')

// Conectar ao banco de dados
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite')
console.log('📂 Caminho do banco:', dbPath)

try {
  const db = new Database(dbPath)
  
  console.log('🔧 Atualizando configurações SMTP...')
  
  // Configurações SMTP fornecidas pelo usuário
  const smtpConfig = {
    smtp_host: 'smtp.gmail.com',
    smtp_port: 587,
    smtp_secure: 0, // false para STARTTLS
    smtp_user: 'skilevolution@gmail.com',
    smtp_password: 'mkdxjwjstnqmluvl', // Senha de app fornecida
    smtp_from_name: 'Sistema ERP - LP IND',
    smtp_from_email: 'skilevolution@gmail.com'
  }
  
  // Atualizar configurações SMTP na tabela empresas
  const updateStmt = db.prepare(`
    UPDATE empresas SET 
      smtp_host = ?,
      smtp_port = ?,
      smtp_secure = ?,
      smtp_user = ?,
      smtp_password = ?,
      smtp_from_name = ?,
      smtp_from_email = ?
    WHERE rowid = 1
  `)
  
  const result = updateStmt.run(
    smtpConfig.smtp_host,
    smtpConfig.smtp_port,
    smtpConfig.smtp_secure,
    smtpConfig.smtp_user,
    smtpConfig.smtp_password,
    smtpConfig.smtp_from_name,
    smtpConfig.smtp_from_email
  )
  
  console.log('✅ Configurações SMTP atualizadas com sucesso!')
  console.log('📊 Registros afetados:', result.changes)
  
  // Verificar as configurações atualizadas
  const config = db.prepare("SELECT * FROM empresas WHERE rowid = 1").get()
  console.log('\n📋 Configurações atuais:')
  console.log(`   Host: ${config.smtp_host}`)
  console.log(`   Porta: ${config.smtp_port}`)
  console.log(`   Usuário: ${config.smtp_user}`)
  console.log(`   Senha: ${config.smtp_password ? '***CONFIGURADO***' : 'NÃO CONFIGURADO'}`)
  console.log(`   Nome Remetente: ${config.smtp_from_name}`)
  console.log(`   Email Remetente: ${config.smtp_from_email}`)
  console.log(`   Secure: ${config.smtp_secure ? 'SIM' : 'NÃO (STARTTLS)'}`)
  
  db.close()
  console.log('\n🎉 Configuração SMTP concluída! Pronto para testar envio de emails.')
  
} catch (error) {
  console.error('❌ Erro ao configurar SMTP:', error.message)
  process.exit(1)
}