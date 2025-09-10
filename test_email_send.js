const Database = require('better-sqlite3')
const nodemailer = require('nodemailer')
const path = require('path')

// Função async principal
async function testEmailSend() {
  // Conectar ao banco de dados
  const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite')
  console.log('📂 Caminho do banco:', dbPath)

  try {
    const db = new Database(dbPath)
    
    // Buscar configurações SMTP da tabela empresas
    const config = db.prepare("SELECT * FROM empresas LIMIT 1").get()
    
    console.log('📊 Configurações carregadas:')
    console.log(`   Host: ${config.smtp_host}`)
    console.log(`   Porta: ${config.smtp_port}`)
    console.log(`   Usuário: ${config.smtp_user}`)
    console.log(`   Senha: ${config.smtp_password ? '***CONFIGURADO***' : 'NÃO CONFIGURADO'}`)
    console.log(`   Secure: ${config.smtp_secure ? 'SSL' : 'STARTTLS'}`)
    
    if (!config.smtp_host || !config.smtp_user || !config.smtp_password) {
      throw new Error('Configurações SMTP incompletas')
    }
    
    console.log('\n🔧 Criando transporter...')
    
    // Configurar transporter do nodemailer
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: config.smtp_secure === 1, // true para SSL, false para STARTTLS
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password
      },
      tls: {
        rejectUnauthorized: false // Para desenvolvimento
      }
    })
    
    console.log('✅ Transporter criado')
    
    // Verificar conexão
    console.log('\n🔍 Verificando conexão SMTP...')
    await transporter.verify()
    console.log('✅ Conexão SMTP verificada com sucesso!')
    
    // Configurar email de teste
    const mailOptions = {
      from: `"${config.smtp_from_name}" <${config.smtp_from_email}>`,
      to: 'skilevolution@gmail.com',
      subject: '✅ Teste de Email - Sistema ERP LP IND',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb; text-align: center;">🎉 Sistema ERP - Teste de Email</h2>
          <p>Olá!</p>
          <p>Este é um <strong>email de teste</strong> enviado pelo sistema ERP da <strong>LP IND</strong> para verificar a funcionalidade de envio de emails.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #059669; margin-top: 0;">✅ Configurações Testadas:</h3>
            <ul>
              <li><strong>Servidor SMTP:</strong> ${config.smtp_host}</li>
              <li><strong>Porta:</strong> ${config.smtp_port}</li>
              <li><strong>Usuário:</strong> ${config.smtp_user}</li>
              <li><strong>Segurança:</strong> ${config.smtp_secure ? 'SSL' : 'STARTTLS'}</li>
            </ul>
          </div>
          
          <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>📧 Se você recebeu este email, significa que:</strong></p>
            <ul style="color: #1e40af; margin: 10px 0;">
              <li>As configurações SMTP estão corretas</li>
              <li>O sistema pode enviar emails automaticamente</li>
              <li>A funcionalidade de email está operacional</li>
            </ul>
          </div>
          
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
            Enviado em: ${new Date().toLocaleString('pt-BR')}<br>
            Sistema ERP - LP IND
          </p>
        </div>
      `
    }
    
    console.log('\n📧 Enviando email de teste...')
    const info = await transporter.sendMail(mailOptions)
    
    console.log('\n🎉 EMAIL ENVIADO COM SUCESSO!')
    console.log('📧 Message ID:', info.messageId)
    console.log('📬 Para:', mailOptions.to)
    console.log('📝 Assunto:', mailOptions.subject)
    console.log('\n✅ Teste de funcionalidade de email concluído!')
    
    db.close()
    
  } catch (error) {
    console.error('\n❌ Erro no teste de email:', error.message)
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 DICAS PARA RESOLVER ERRO DE AUTENTICAÇÃO:')
      console.log('1. 🔑 Verifique se está usando uma "Senha de app" do Gmail (não a senha normal)')
      console.log('2. 📱 Certifique-se de que a verificação em 2 etapas está ativada')
      console.log('3. 🔄 Tente gerar uma nova senha de app')
      console.log('4. 🌐 Acesse: https://myaccount.google.com/apppasswords')
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 DICAS PARA RESOLVER ERRO DE CONEXÃO:')
      console.log('1. 🌐 Verifique sua conexão com a internet')
      console.log('2. 🔥 Verifique se não há firewall bloqueando a porta 587')
      console.log('3. 📡 Teste com outra rede se possível')
    }
    
    process.exit(1)
  }
}

// Executar teste
testEmailSend()