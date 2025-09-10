const http = require('http');

function makeRequest() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3145,
      path: '/api/config',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: JSON.parse(data)
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testGetConfig() {
  try {
    console.log('🔍 Buscando configurações da API...');
    
    const response = await makeRequest();
    
    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Configuração atual:');
    console.log('- ID:', response.data.id);
    console.log('- Nome:', response.data.nome);
    console.log('- SMTP Host:', response.data.smtp_host || 'NÃO CONFIGURADO');
    console.log('- SMTP Port:', response.data.smtp_port || 'NÃO CONFIGURADO');
    console.log('- SMTP User:', response.data.smtp_user || 'NÃO CONFIGURADO');
    console.log('- SMTP Password:', response.data.smtp_password ? '***' : 'NÃO CONFIGURADO');
    console.log('- SMTP Secure:', response.data.smtp_secure || 'NÃO CONFIGURADO');
    console.log('- SMTP From Name:', response.data.smtp_from_name || 'NÃO CONFIGURADO');
    console.log('- SMTP From Email:', response.data.smtp_from_email || 'NÃO CONFIGURADO');
    console.log('- Updated At:', response.data.updated_at);
    
  } catch (error) {
    console.error('❌ Erro ao buscar configurações:', error.message);
  }
}

testGetConfig();