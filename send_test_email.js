const Database = require('better-sqlite3')
const nodemailer = require('nodemailer')
const path = require('path')

// Função async principal
async function sendTestEmail() {
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
      password: config?.smtp_password ? '***definida' : 'não definida',
      from_name: config?.smtp_from_name,
      from_email: config?.smtp_from_email
    })
    
    if (!config?.smtp_host || !config?.smtp_user || !config?.smtp_password) {
      console.log('❌ Configurações SMTP incompletas')
      process.exit(1)
    }
    
    // Criar transporter com as configurações do banco
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: parseInt(config.smtp_port) || 587,
      secure: config.smtp_secure === 1, // true para 465, false para outros
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password
      },
      tls: {
        rejectUnauthorized: false // Para desenvolvimento
      }
    })
    
    console.log('\n📧 Enviando email de teste...')
    
    // Configurar email de teste
    const mailOptions = {
      from: `"${config.smtp_from_name}" <${config.smtp_from_email}>`,
      to: 'skilevolution@gmail.com',
      subject: '✅ Teste de Funcionalidade - Sistema ERP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎉 Sistema ERP - Teste de Email</h2>
          <p>Olá!</p>
          <p>Este é um <strong>email de teste</strong> enviado pelo sistema ERP para verificar a funcionalidade de envio de emails.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">✅ Configurações Testadas:</h3>
            <ul>
              <li>📧 Servidor SMTP: ${config.smtp_host}</li>
              <li>🔌 Porta: ${config.smtp_port}</li>
              <li>👤 Usuário: ${config.smtp_user}</li>
              <li>🔐 Autenticação: Configurada</li>
            </ul>
          </div>
          
          <p>Se você recebeu este email, significa que:</p>
          <ul>
            <li>✅ As credenciais SMTP estão corretas</li>
            <li>✅ A conexão com o servidor está funcionando</li>
            <li>✅ O sistema pode enviar emails automaticamente</li>
          </ul>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Sistema ERP</strong><br>
            Teste realizado em: ${new Date().toLocaleString('pt-BR')}
          </p>
        </div>
      `
    }
    
    // Enviar email
    const info = await transporter.sendMail(mailOptions)
    
    console.log('✅ Email enviado com sucesso!')
    console.log('📧 Message ID:', info.messageId)
    console.log('📬 Destinatário:', mailOptions.to)
    console.log('📝 Assunto:', mailOptions.subject)
    console.log('\n🎉 Teste de funcionalidade de email CONCLUÍDO!')
    
    db.close()
    
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message)
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Dicas para resolver erro de autenticação:')
      console.log('1. Verifique se a senha de app está correta')
      console.log('2. Confirme se a verificação em 2 etapas está ativada no Gmail')
      console.log('3. Gere uma nova senha de app se necessário')
    }
    
    process.exit(1)
  }
}

// Executar a função
sendTestEmail()