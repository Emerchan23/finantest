const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
const db = new Database(dbPath);

try {
    console.log('👥 Inserindo clientes de teste...');
    
    const clientesReais = [
        {
            nome: 'João Silva Santos',
            cpf_cnpj: '123.456.789-01',
            endereco: 'Rua das Flores, 123 - Centro - São Paulo/SP',
            telefone: '(11) 99999-1234',
            email: 'joao.silva@email.com'
        },
        {
            nome: 'Maria Oliveira Ltda',
            cpf_cnpj: '12.345.678/0001-90',
            endereco: 'Av. Paulista, 1000 - Bela Vista - São Paulo/SP',
            telefone: '(11) 3333-5678',
            email: 'contato@mariaoliveira.com.br'
        },
        {
            nome: 'Pedro Costa',
            cpf_cnpj: '987.654.321-09',
            endereco: 'Rua Augusta, 456 - Consolação - São Paulo/SP',
            telefone: '(11) 88888-9999',
            email: 'pedro.costa@gmail.com'
        },
        {
            nome: 'TechSolutions Informática LTDA',
            cpf_cnpj: '98.765.432/0001-10',
            endereco: 'Rua da Tecnologia, 789 - Vila Olímpia - São Paulo/SP',
            telefone: '(11) 4444-7777',
            email: 'vendas@techsolutions.com.br'
        }
    ];
    
    const insertClienteStmt = db.prepare(`
        INSERT INTO clientes (id, nome, cpf_cnpj, endereco, telefone, email, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    clientesReais.forEach((cliente, index) => {
        const id = uuidv4();
        insertClienteStmt.run(
            id,
            cliente.nome,
            cliente.cpf_cnpj,
            cliente.endereco,
            cliente.telefone,
            cliente.email
        );
        console.log(`✅ ${index + 1}. ${cliente.nome} - ${cliente.cpf_cnpj}`);
    });
    
    console.log('\n💳 Inserindo modalidades de pagamento...');
    
    const modalidadesReais = [
        { nome: 'À Vista - Dinheiro', ativo: 1 },
        { nome: 'À Vista - PIX', ativo: 1 },
        { nome: 'À Vista - Cartão Débito', ativo: 1 },
        { nome: 'Parcelado - Cartão Crédito 2x', ativo: 1 },
        { nome: 'Parcelado - Cartão Crédito 3x', ativo: 1 },
        { nome: 'Parcelado - Cartão Crédito 6x', ativo: 1 },
        { nome: 'Parcelado - Cartão Crédito 12x', ativo: 1 },
        { nome: 'Boleto Bancário', ativo: 1 },
        { nome: 'Transferência Bancária', ativo: 1 },
        { nome: 'Crediário Próprio', ativo: 0 }
    ];
    
    const insertModalidadeStmt = db.prepare(`
        INSERT INTO modalidades (id, nome, ativo, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    modalidadesReais.forEach((modalidade, index) => {
        const id = uuidv4();
        insertModalidadeStmt.run(id, modalidade.nome, modalidade.ativo);
        const status = modalidade.ativo ? '✅ ATIVA' : '❌ INATIVA';
        console.log(`${status} ${index + 1}. ${modalidade.nome}`);
    });
    
    console.log('\n💰 Inserindo taxas...');
    
    const taxasReais = [
        { nome: 'Taxa Cartão Débito', percentual: 1.5, tipo: 'pagamento', ativo: 1 },
        { nome: 'Taxa Cartão Crédito', percentual: 3.2, tipo: 'pagamento', ativo: 1 },
        { nome: 'Taxa PIX', percentual: 0.5, tipo: 'pagamento', ativo: 1 },
        { nome: 'Taxa Boleto', percentual: 2.0, tipo: 'pagamento', ativo: 1 },
        { nome: 'ICMS', percentual: 18.0, tipo: 'imposto', ativo: 1 },
        { nome: 'PIS/COFINS', percentual: 9.25, tipo: 'imposto', ativo: 1 },
        { nome: 'Desconto Atacado', percentual: 5.0, tipo: 'desconto', ativo: 1 },
        { nome: 'Desconto Cliente VIP', percentual: 10.0, tipo: 'desconto', ativo: 1 },
        { nome: 'Taxa Entrega Express', percentual: 15.0, tipo: 'servico', ativo: 0 }
    ];
    
    const insertTaxaStmt = db.prepare(`
        INSERT INTO taxas (id, nome, percentual, tipo, ativo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);
    
    taxasReais.forEach((taxa, index) => {
        const id = uuidv4();
        insertTaxaStmt.run(id, taxa.nome, taxa.percentual, taxa.tipo, taxa.ativo);
        const status = taxa.ativo ? '✅' : '❌';
        console.log(`${status} ${index + 1}. ${taxa.nome} - ${taxa.percentual}% (${taxa.tipo})`);
    });
    
    // Verificar totais
    console.log('\n📊 Resumo final:');
    const totalClientes = db.prepare('SELECT COUNT(*) as total FROM clientes').get();
    const totalModalidades = db.prepare('SELECT COUNT(*) as total FROM modalidades').get();
    const totalTaxas = db.prepare('SELECT COUNT(*) as total FROM taxas').get();
    
    console.log(`   👥 Total de clientes: ${totalClientes.total}`);
    console.log(`   💳 Total de modalidades: ${totalModalidades.total}`);
    console.log(`   💰 Total de taxas: ${totalTaxas.total}`);
    
    // Mostrar modalidades ativas
    const modalidadesAtivas = db.prepare('SELECT COUNT(*) as total FROM modalidades WHERE ativo = 1').get();
    console.log(`   💳 Modalidades ativas: ${modalidadesAtivas.total}`);
    
    // Mostrar taxas por tipo
    const taxasPorTipo = db.prepare(`
        SELECT tipo, COUNT(*) as quantidade, AVG(percentual) as media
        FROM taxas 
        WHERE ativo = 1
        GROUP BY tipo
        ORDER BY quantidade DESC
    `).all();
    
    console.log('\n💰 Taxas ativas por tipo:');
    taxasPorTipo.forEach(tipo => {
        console.log(`   ${tipo.tipo}: ${tipo.quantidade} taxas (média: ${tipo.media.toFixed(2)}%)`);
    });
    
} catch (error) {
    console.error('❌ Erro ao inserir dados:', error.message);
} finally {
    db.close();
    console.log('\n✅ Dados de teste inseridos com sucesso!');
}