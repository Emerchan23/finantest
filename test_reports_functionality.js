const Database = require('better-sqlite3');
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
console.log('📂 Caminho do banco:', dbPath);

try {
    const db = new Database(dbPath);
    
    console.log('\n📊 === TESTE DE RELATÓRIOS E DASHBOARD ===\n');
    
    // ========== RELATÓRIO DE VENDAS ==========
    console.log('💰 RELATÓRIO DE VENDAS:');
    
    try {
        // Vendas por período
        const vendasMes = db.prepare(`
            SELECT 
                DATE(data_venda) as data,
                COUNT(*) as quantidade_vendas,
                SUM(total) as valor_total,
                AVG(total) as ticket_medio
            FROM vendas 
            WHERE data_venda >= date('now', '-30 days')
            GROUP BY DATE(data_venda)
            ORDER BY data DESC
            LIMIT 10
        `).all();
        
        if (vendasMes.length > 0) {
            console.log('📈 Vendas dos últimos 30 dias:');
            vendasMes.forEach(venda => {
                console.log(`   ${venda.data}: ${venda.quantidade_vendas} vendas - R$ ${venda.valor_total} (Ticket: R$ ${venda.ticket_medio?.toFixed(2) || 0})`);
            });
        } else {
            console.log('📊 Nenhuma venda encontrada nos últimos 30 dias');
        }
        
        // Total geral de vendas
        const totalVendas = db.prepare(`
            SELECT 
                COUNT(*) as total_vendas,
                COALESCE(SUM(total), 0) as valor_total,
                COALESCE(AVG(total), 0) as ticket_medio
            FROM vendas
        `).get();
        
        console.log(`📊 Total Geral: ${totalVendas.total_vendas} vendas - R$ ${totalVendas.valor_total} (Ticket Médio: R$ ${totalVendas.ticket_medio.toFixed(2)})`);
        
    } catch (error) {
        console.log('❌ Erro no relatório de vendas:', error.message);
    }
    
    // ========== RELATÓRIO DE ORÇAMENTOS ==========
    console.log('\n📋 RELATÓRIO DE ORÇAMENTOS:');
    
    try {
        // Orçamentos por status
        const orcamentosPorStatus = db.prepare(`
            SELECT 
                status,
                COUNT(*) as quantidade,
                SUM(valor_total) as valor_total
            FROM orcamentos
            GROUP BY status
            ORDER BY quantidade DESC
        `).all();
        
        console.log('📊 Orçamentos por Status:');
        orcamentosPorStatus.forEach(orc => {
            console.log(`   ${orc.status}: ${orc.quantidade} orçamentos - R$ ${orc.valor_total || 0}`);
        });
        
        // Orçamentos por modalidade
        const orcamentosPorModalidade = db.prepare(`
            SELECT 
                modalidade,
                COUNT(*) as quantidade,
                SUM(valor_total) as valor_total
            FROM orcamentos
            WHERE modalidade IS NOT NULL
            GROUP BY modalidade
            ORDER BY quantidade DESC
        `).all();
        
        if (orcamentosPorModalidade.length > 0) {
            console.log('📊 Orçamentos por Modalidade:');
            orcamentosPorModalidade.forEach(orc => {
                console.log(`   ${orc.modalidade}: ${orc.quantidade} orçamentos - R$ ${orc.valor_total || 0}`);
            });
        }
        
    } catch (error) {
        console.log('❌ Erro no relatório de orçamentos:', error.message);
    }
    
    // ========== RELATÓRIO DE CLIENTES ==========
    console.log('\n👥 RELATÓRIO DE CLIENTES:');
    
    try {
        // Clientes ativos vs inativos
        const clientesStatus = db.prepare(`
            SELECT 
                CASE WHEN ativo = 1 THEN 'Ativo' ELSE 'Inativo' END as status,
                COUNT(*) as quantidade
            FROM clientes
            GROUP BY ativo
        `).all();
        
        console.log('📊 Status dos Clientes:');
        clientesStatus.forEach(status => {
            console.log(`   ${status.status}: ${status.quantidade} clientes`);
        });
        
        // Clientes com mais orçamentos
        const topClientes = db.prepare(`
            SELECT 
                c.nome,
                c.cpf_cnpj,
                COUNT(o.id) as total_orcamentos,
                COALESCE(SUM(o.valor_total), 0) as valor_total
            FROM clientes c
            LEFT JOIN orcamentos o ON c.id = o.cliente_id
            GROUP BY c.id, c.nome, c.cpf_cnpj
            HAVING COUNT(o.id) > 0
            ORDER BY total_orcamentos DESC
            LIMIT 5
        `).all();
        
        if (topClientes.length > 0) {
            console.log('🏆 Top 5 Clientes (por orçamentos):');
            topClientes.forEach((cliente, index) => {
                console.log(`   ${index + 1}. ${cliente.nome} (${cliente.cpf_cnpj}): ${cliente.total_orcamentos} orçamentos - R$ ${cliente.valor_total}`);
            });
        }
        
    } catch (error) {
        console.log('❌ Erro no relatório de clientes:', error.message);
    }
    
    // ========== RELATÓRIO DE PRODUTOS ==========
    console.log('\n📦 RELATÓRIO DE PRODUTOS:');
    
    try {
        // Produtos por categoria
        const produtosPorCategoria = db.prepare(`
            SELECT 
                categoria,
                COUNT(*) as quantidade,
                AVG(preco) as preco_medio
            FROM produtos
            WHERE ativo = 1
            GROUP BY categoria
            ORDER BY quantidade DESC
        `).all();
        
        console.log('📊 Produtos por Categoria:');
        produtosPorCategoria.forEach(cat => {
            console.log(`   ${cat.categoria}: ${cat.quantidade} produtos (Preço médio: R$ ${cat.preco_medio?.toFixed(2) || 0})`);
        });
        
        // Produtos mais vendidos (se houver vendas)
        const produtosMaisVendidos = db.prepare(`
            SELECT 
                p.nome,
                p.categoria,
                SUM(v.quantidade) as total_vendido,
                SUM(v.total) as receita_total
            FROM produtos p
            INNER JOIN vendas v ON p.id = v.produto_id
            GROUP BY p.id, p.nome, p.categoria
            ORDER BY total_vendido DESC
            LIMIT 5
        `).all();
        
        if (produtosMaisVendidos.length > 0) {
            console.log('🏆 Top 5 Produtos Mais Vendidos:');
            produtosMaisVendidos.forEach((produto, index) => {
                console.log(`   ${index + 1}. ${produto.nome} (${produto.categoria}): ${produto.total_vendido} unidades - R$ ${produto.receita_total}`);
            });
        } else {
            console.log('📊 Nenhum produto vendido ainda');
        }
        
    } catch (error) {
        console.log('❌ Erro no relatório de produtos:', error.message);
    }
    
    // ========== RELATÓRIO FINANCEIRO ==========
    console.log('\n💵 RELATÓRIO FINANCEIRO:');
    
    try {
        // Resumo financeiro
        const resumoFinanceiro = db.prepare(`
            SELECT 
                'Orçamentos Pendentes' as tipo,
                COUNT(*) as quantidade,
                COALESCE(SUM(valor_total), 0) as valor
            FROM orcamentos 
            WHERE status = 'pendente'
            
            UNION ALL
            
            SELECT 
                'Orçamentos Aprovados' as tipo,
                COUNT(*) as quantidade,
                COALESCE(SUM(valor_total), 0) as valor
            FROM orcamentos 
            WHERE status = 'aprovado'
            
            UNION ALL
            
            SELECT 
                'Vendas Realizadas' as tipo,
                COUNT(*) as quantidade,
                COALESCE(SUM(total), 0) as valor
            FROM vendas
        `).all();
        
        console.log('📊 Resumo Financeiro:');
        resumoFinanceiro.forEach(item => {
            console.log(`   ${item.tipo}: ${item.quantidade} itens - R$ ${item.valor}`);
        });
        
        // Acertos (se houver)
        const resumoAcertos = db.prepare(`
            SELECT 
                COUNT(*) as total_acertos,
                COALESCE(SUM(totalLucro), 0) as lucro_total,
                COALESCE(SUM(totalDespesasRateio), 0) as despesas_rateio,
                COALESCE(SUM(totalLiquidoDistribuivel), 0) as liquido_distribuivel
            FROM acertos
        `).get();
        
        if (resumoAcertos.total_acertos > 0) {
            console.log('📊 Resumo de Acertos:');
            console.log(`   Total de Acertos: ${resumoAcertos.total_acertos}`);
            console.log(`   Lucro Total: R$ ${resumoAcertos.lucro_total}`);
            console.log(`   Despesas Rateio: R$ ${resumoAcertos.despesas_rateio}`);
            console.log(`   Líquido Distribuível: R$ ${resumoAcertos.liquido_distribuivel}`);
        }
        
    } catch (error) {
        console.log('❌ Erro no relatório financeiro:', error.message);
    }
    
    // ========== DASHBOARD - MÉTRICAS GERAIS ==========
    console.log('\n📈 DASHBOARD - MÉTRICAS GERAIS:');
    
    try {
        const metricas = {
            clientes_ativos: db.prepare('SELECT COUNT(*) as total FROM clientes WHERE ativo = 1').get().total,
            produtos_ativos: db.prepare('SELECT COUNT(*) as total FROM produtos WHERE ativo = 1').get().total,
            orcamentos_pendentes: db.prepare('SELECT COUNT(*) as total FROM orcamentos WHERE status = "pendente"').get().total,
            orcamentos_aprovados: db.prepare('SELECT COUNT(*) as total FROM orcamentos WHERE status = "aprovado"').get().total,
            vendas_total: db.prepare('SELECT COUNT(*) as total FROM vendas').get().total,
            valor_orcamentos_pendentes: db.prepare('SELECT COALESCE(SUM(valor_total), 0) as total FROM orcamentos WHERE status = "pendente"').get().total,
            valor_vendas_total: db.prepare('SELECT COALESCE(SUM(total), 0) as total FROM vendas').get().total
        };
        
        console.log('🎯 Métricas Principais:');
        console.log(`   👥 Clientes Ativos: ${metricas.clientes_ativos}`);
        console.log(`   📦 Produtos Ativos: ${metricas.produtos_ativos}`);
        console.log(`   📋 Orçamentos Pendentes: ${metricas.orcamentos_pendentes} (R$ ${metricas.valor_orcamentos_pendentes})`);
        console.log(`   ✅ Orçamentos Aprovados: ${metricas.orcamentos_aprovados}`);
        console.log(`   💰 Vendas Realizadas: ${metricas.vendas_total} (R$ ${metricas.valor_vendas_total})`);
        
        // Taxa de conversão (orçamentos aprovados / total de orçamentos)
        const totalOrcamentos = metricas.orcamentos_pendentes + metricas.orcamentos_aprovados;
        if (totalOrcamentos > 0) {
            const taxaConversao = (metricas.orcamentos_aprovados / totalOrcamentos * 100).toFixed(1);
            console.log(`   📊 Taxa de Conversão: ${taxaConversao}%`);
        }
        
    } catch (error) {
        console.log('❌ Erro nas métricas do dashboard:', error.message);
    }
    
    db.close();
    console.log('\n✅ Teste de relatórios concluído com sucesso!');
    
} catch (error) {
    console.error('❌ Erro no teste de relatórios:', error.message);
    process.exit(1);
}