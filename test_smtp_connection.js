const Database = require('better-sqlite3')
const nodemailer = require('nodemailer')
const path = require('path')

// Conectar ao banco de dados
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite')
console.log('📂 Caminho do banco:', dbPath)

try {
  const db = new Database(dbPath)
  
  // Buscar configurações SMTP da tabela empresas
  const config = db.prepare("SELECT * FROM empresas LIMIT 1").get()
  
  console.log('📊 Configurações carregadas:', {
    host: config?.smtp_host,
    port: config?.smtp_port,
    user: config?.smtp_user ? '***' + config.smtp_user.slice(-10) : 'não definido',
    password: config?.smtp_password ? '***definida' : 'não definida'
  })
  
  if (!config) {
    console.log('❌ Empresa não encontrada')
    process.exit(1)
  }
  
  // Validar configurações obrigatórias
  const missingFields = []
  if (!config.smtp_host || config.smtp_host === 'NÃO CONFIGURADO') missingFields.push('Host SMTP')
  if (!config.smtp_port || config.smtp_port === 0) missingFields.push('Porta SMTP')
  if (!config.smtp_user || config.smtp_user === 'NÃO CONFIGURADO') missingFields.push('Usuário SMTP')
  if (!config.smtp_password || config.smtp_password === 'NÃO CONFIGURADO') missingFields.push('Senha SMTP')
  
  if (missingFields.length > 0) {
    console.log('❌ Campos não configurados:', missingFields)
    console.log('💡 Configure os campos SMTP na tabela empresas do banco de dados')
    process.exit(1)
  }
  
  // Validações adicionais
  const validationErrors = []
  
  // Validar formato do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(config.smtp_user)) {
    validationErrors.push('O usuário SMTP deve ser um email válido')
  }
  
  // Validar porta
  if (config.smtp_port < 1 || config.smtp_port > 65535) {
    validationErrors.push('A porta SMTP deve estar entre 1 e 65535')
  }
  
  // Verificar se é Gmail e alertar sobre senha de app
  const isGmail = config.smtp_host?.includes('gmail.com')
  if (isGmail && config.smtp_password && !config.smtp_password.match(/^[a-z]{16}$/)) {
    validationErrors.push('Para Gmail, use uma senha de app de 16 caracteres (apenas letras minúsculas)')
  }
  
  if (validationErrors.length > 0) {
    console.log('❌ Erros de validação:', validationErrors)
    process.exit(1)
  }
  
  // Criar transporter
  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.smtp_secure || config.smtp_port === 465,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_password
    },
    debug: true,
    logger: true
  })
  
  console.log('🔍 Testando conexão SMTP...')
  
  // Testar conexão
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Erro no teste SMTP:', error)
      
      let errorMessage = 'Erro desconhecido'
      let troubleshootingTips = []
      
      // Detectar provedor baseado no host
      const isOutlook = config.smtp_host?.includes('outlook') || config.smtp_host?.includes('hotmail')
      const isYahoo = config.smtp_host?.includes('yahoo.com')
      
      if (error.code === 'EAUTH' || error.responseCode === 535) {
        errorMessage = 'Falha na autenticação'
        
        if (isGmail) {
          troubleshootingTips = [
            '🔑 Para Gmail, você DEVE usar uma "Senha de app" (não a senha normal)',
            '1. Acesse https://myaccount.google.com/security',
            '2. Ative a verificação em 2 etapas',
            '3. Gere uma "Senha de app" específica para este sistema',
            '4. Use essa senha de 16 caracteres no campo senha'
          ]
        } else if (isOutlook) {
          troubleshootingTips = [
            '🔑 Para Outlook/Hotmail, verifique:',
            '1. Se a conta tem verificação em 2 etapas ativada',
            '2. Use uma senha de app se necessário',
            '3. Verifique se SMTP está habilitado na conta'
          ]
        } else {
          troubleshootingTips = [
            'Verifique se o usuário (email) está correto',
            'Confirme se a senha está correta',
            'Verifique se a autenticação está habilitada no servidor'
          ]
        }
      }
      
      console.log('\n📧 Teste de Conexão SMTP - FALHA')
      console.log('❌ Erro:', errorMessage)
      console.log('📝 Detalhes:', error.response || 'As credenciais fornecidas são inválidas')
      console.log('🔧 Dicas para solução:')
      troubleshootingTips.forEach((tip, index) => {
        console.log(`${index + 1}. ${tip}`)
      })
      console.log('⏰ Testado em:', new Date().toLocaleString('pt-BR'))
      
    } else {
      console.log('\n📧 Teste de Conexão SMTP - SUCESSO ✅')
      console.log('🎉 Conexão estabelecida com sucesso!')
      console.log('📊 Configurações válidas:')
      console.log(`   Host: ${config.smtp_host}`)
      console.log(`   Porta: ${config.smtp_port}`)
      console.log(`   Usuário: ${config.smtp_user}`)
      console.log(`   Seguro: ${config.smtp_secure || config.smtp_port === 465 ? 'Sim' : 'Não'}`)
      console.log('⏰ Testado em:', new Date().toLocaleString('pt-BR'))
    }
    
    db.close()
  })
  
} catch (error) {
  console.error('❌ Erro ao conectar com o banco:', error)
  process.exit(1)
}