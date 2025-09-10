const http = require('http');

async function testSmtpConfig() {
  console.log('🧪 Testando salvamento de configurações SMTP...');
  
  const testData = {
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: 'test@gmail.com',
    smtpPassword: 'testpassword123',
    smtpFromName: 'Empresa Demo Teste',
    smtpFromEmail: 'noreply@empresademo.com'
  };
  
  console.log('📤 Dados que serão enviados:', testData);
  
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 3145,
    path: '/api/config',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  try {
    console.log('📤 Enviando dados para API /api/config...');
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve({ ok: res.statusCode === 200, data: result, status: res.statusCode });
          } catch (error) {
            reject(error);
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });
    
    console.log('📊 Status da resposta:', response.status);
    
    if (response.ok) {
      console.log('✅ Configurações salvas com sucesso!');
      console.log('📋 Resposta completa:', JSON.stringify(response.data, null, 2));
      
      // Verificar especificamente os campos SMTP na resposta
      if (response.data.config) {
        console.log('\n🔍 Campos SMTP na resposta:');
        console.log('- smtp_host:', response.data.config.smtp_host);
        console.log('- smtp_port:', response.data.config.smtp_port);
        console.log('- smtp_secure:', response.data.config.smtp_secure);
        console.log('- smtp_user:', response.data.config.smtp_user);
        console.log('- smtp_password:', response.data.config.smtp_password);
        console.log('- smtp_from_name:', response.data.config.smtp_from_name);
        console.log('- smtp_from_email:', response.data.config.smtp_from_email);
      }
    } else {
      console.log('❌ Erro ao salvar configurações:', response.data);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testSmtpConfig();