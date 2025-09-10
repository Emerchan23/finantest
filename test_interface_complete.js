const http = require('http');
const https = require('https');
const { URL } = require('url');

// Função para fazer requisições HTTP
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Função principal de teste
async function testCompleteInterface() {
  try {
    console.log('🚀 === TESTE COMPLETO DA INTERFACE ===\n');
    
    const baseUrl = 'http://localhost:3145';
    
    // Testar páginas principais
    console.log('🧭 === TESTE DE NAVEGAÇÃO E PÁGINAS ===');
    
    const pages = [
      { name: 'Dashboard', path: '/' },
      { name: 'Clientes', path: '/clientes' },
      { name: 'Produtos', path: '/produtos' },
      { name: 'Orçamentos', path: '/orcamentos' },
      { name: 'Vendas', path: '/vendas' },
      { name: 'Configurações', path: '/configuracoes' }
    ];
    
    const results = {
      working: [],
      errors: [],
      performance: []
    };
    
    for (const page of pages) {
      try {
        console.log(`🔗 Testando página: ${page.name} (${page.path})`);
        
        const startTime = Date.now();
        const response = await makeRequest(`${baseUrl}${page.path}`);
        const loadTime = Date.now() - startTime;
        
        if (response.statusCode === 200) {
          console.log(`   ✅ Status: ${response.statusCode} - OK`);
          console.log(`   ⚡ Tempo de resposta: ${loadTime}ms`);
          
          // Verificar se é uma página HTML válida
          if (response.body.includes('<html') || response.body.includes('<!DOCTYPE')) {
            console.log(`   📄 Conteúdo HTML válido`);
            results.working.push(page.name);
          } else {
            console.log(`   ⚠️ Conteúdo não parece ser HTML`);
          }
          
          // Verificar se não há erros óbvios
          if (response.body.includes('404') || response.body.includes('Not Found')) {
            console.log(`   ❌ Página contém erro 404`);
            results.errors.push(`${page.name}: 404 Error`);
          } else if (response.body.includes('500') || response.body.includes('Internal Server Error')) {
            console.log(`   ❌ Página contém erro 500`);
            results.errors.push(`${page.name}: 500 Error`);
          }
          
          results.performance.push({ page: page.name, time: loadTime });
          
        } else {
          console.log(`   ❌ Status: ${response.statusCode} - Erro`);
          results.errors.push(`${page.name}: HTTP ${response.statusCode}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erro ao acessar ${page.name}: ${error.message}`);
        results.errors.push(`${page.name}: ${error.message}`);
      }
      
      console.log(''); // Linha em branco
    }
    
    // Testar APIs específicas
    console.log('🔌 === TESTE DE APIs ===');
    
    const apiEndpoints = [
      { name: 'API Clientes', path: '/api/clientes' },
      { name: 'API Produtos', path: '/api/produtos' },
      { name: 'API Orçamentos', path: '/api/orcamentos' },
      { name: 'API Configurações', path: '/api/configuracoes' }
    ];
    
    for (const api of apiEndpoints) {
      try {
        console.log(`🔌 Testando API: ${api.name}`);
        
        const response = await makeRequest(`${baseUrl}${api.path}`);
        
        if (response.statusCode === 200) {
          console.log(`   ✅ API funcionando - Status: ${response.statusCode}`);
          
          // Verificar se retorna JSON
          try {
            JSON.parse(response.body);
            console.log(`   📊 Resposta JSON válida`);
          } catch {
            console.log(`   ⚠️ Resposta não é JSON válido`);
          }
          
        } else if (response.statusCode === 404) {
          console.log(`   ⚠️ API não encontrada - Status: ${response.statusCode}`);
        } else {
          console.log(`   ❌ Erro na API - Status: ${response.statusCode}`);
        }
        
      } catch (error) {
        console.log(`   ⚠️ API não disponível: ${error.message}`);
      }
      
      console.log(''); // Linha em branco
    }
    
    // Testar recursos estáticos
    console.log('📁 === TESTE DE RECURSOS ESTÁTICOS ===');
    
    const staticResources = [
      { name: 'Favicon', path: '/favicon.ico' },
      { name: 'Manifest', path: '/manifest.json' },
      { name: 'Next.js Static', path: '/_next/static/css' }
    ];
    
    for (const resource of staticResources) {
      try {
        console.log(`📄 Testando recurso: ${resource.name}`);
        
        const response = await makeRequest(`${baseUrl}${resource.path}`);
        
        if (response.statusCode === 200) {
          console.log(`   ✅ Recurso disponível - Status: ${response.statusCode}`);
        } else {
          console.log(`   ⚠️ Recurso não encontrado - Status: ${response.statusCode}`);
        }
        
      } catch (error) {
        console.log(`   ⚠️ Erro ao acessar recurso: ${error.message}`);
      }
    }
    
    // Resumo final
    console.log('\n🎉 === RESUMO DO TESTE ===');
    console.log(`✅ Páginas funcionando: ${results.working.length}/${pages.length}`);
    
    if (results.working.length > 0) {
      console.log('   Páginas OK:', results.working.join(', '));
    }
    
    if (results.errors.length > 0) {
      console.log(`❌ Erros encontrados: ${results.errors.length}`);
      results.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    // Performance
    console.log('\n⚡ === ANÁLISE DE PERFORMANCE ===');
    const avgTime = results.performance.reduce((sum, p) => sum + p.time, 0) / results.performance.length;
    console.log(`📊 Tempo médio de resposta: ${Math.round(avgTime)}ms`);
    
    results.performance.forEach(p => {
      const status = p.time < 1000 ? '🟢' : p.time < 3000 ? '🟡' : '🔴';
      console.log(`   ${status} ${p.page}: ${p.time}ms`);
    });
    
    // Avaliação geral
    console.log('\n📋 === AVALIAÇÃO GERAL ===');
    
    const workingPercentage = (results.working.length / pages.length) * 100;
    
    if (workingPercentage >= 90) {
      console.log('🟢 Sistema funcionando EXCELENTE (≥90% das páginas OK)');
    } else if (workingPercentage >= 70) {
      console.log('🟡 Sistema funcionando BEM (70-89% das páginas OK)');
    } else if (workingPercentage >= 50) {
      console.log('🟠 Sistema funcionando PARCIALMENTE (50-69% das páginas OK)');
    } else {
      console.log('🔴 Sistema com PROBLEMAS SÉRIOS (<50% das páginas OK)');
    }
    
    if (avgTime < 1000) {
      console.log('⚡ Performance EXCELENTE (<1s)');
    } else if (avgTime < 3000) {
      console.log('⚡ Performance BOA (1-3s)');
    } else {
      console.log('⚡ Performance LENTA (>3s)');
    }
    
    console.log('\n✅ Teste de interface completo concluído!');
    
  } catch (error) {
    console.error('❌ Erro no teste de interface:', error.message);
    process.exit(1);
  }
}

// Executar teste
testCompleteInterface().catch(error => {
  console.error('❌ Erro fatal no teste:', error.message);
  process.exit(1);
});