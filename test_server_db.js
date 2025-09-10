const http = require('http');

// Fazer uma requisição para a API de configuração
const options = {
  hostname: 'localhost',
  port: 3145,
  path: '/api/config',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const config = JSON.parse(data);
      console.log('Configuração do servidor:');
      console.log('ID:', config.id);
      console.log('Nome do Sistema:', config.nome_do_sistema);
      console.log('SMTP Host:', config.smtp_host || 'NÃO CONFIGURADO');
      console.log('SMTP Port:', config.smtp_port || 'NÃO CONFIGURADO');
      console.log('SMTP User:', config.smtp_user || 'NÃO CONFIGURADO');
      console.log('SMTP From Email:', config.smtp_from_email || 'NÃO CONFIGURADO');
    } catch (error) {
      console.error('Erro ao parsear resposta:', error.message);
      console.log('Resposta bruta:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Erro na requisição:', error.message);
});

req.end();