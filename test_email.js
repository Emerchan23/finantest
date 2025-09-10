const http = require('http');

// Dados do email de teste
const emailData = {
  to: 'test@example.com',
  subject: 'Teste de Email - Sistema ERP',
  html: '<h1>Teste de Email</h1><p>Este é um email de teste do sistema ERP.</p>'
};

const postData = JSON.stringify(emailData);

const options = {
  hostname: 'localhost',
  port: 3145,
  path: '/api/email/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  console.log('Status Code:', res.statusCode);
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Resposta da API:');
      console.log(JSON.stringify(response, null, 2));
    } catch (error) {
      console.error('Erro ao parsear resposta:', error.message);
      console.log('Resposta bruta:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Erro na requisição:', error.message);
});

req.write(postData);
req.end();

console.log('Enviando email de teste...');
console.log('Dados:', emailData);