const Database = require('better-sqlite3');
const path = require('path');

try {
    console.log('🧪 Testando CRUD de Clientes, Modalidades e Taxas...');
    
    const dbPath = path.join(__dirname, '..', 'banco-de-dados', 'erp.sqlite');
    const db = new Database(dbPath);
    
    // ========== TESTE CLIENTES ==========
    console.log('\n👥 TESTANDO CLIENTES:');
    
    // 1. Criar cliente
    console.log('\n1️⃣ Criando novo cliente...');
    const novoCliente = {
        nome: 'Empresa Teste CRUD Ltda',
        cpf_cnpj: '11.222.333/0001-44',
        telefone: '(11) 98765-4321',
        email: 'teste@empresacrud.com.br',
        endereco: 'Rua dos Testes, 123'
    };
    
    const insertCliente = db.prepare(`
        INSERT INTO clientes (nome, cpf_cnpj, telefone, email, endereco)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    const resultCliente = insertCliente.run(
        novoCliente.nome, novoCliente.cpf_cnpj, novoCliente.telefone, 
        novoCliente.email, novoCliente.endereco
    );
    
    console.log(`✅ Cliente criado com ID: ${resultCliente.lastInsertRowid}`);
    const clienteId = resultCliente.lastInsertRowid;
    
    // Verificar se o cliente foi criado
    const clienteCriado = db.prepare('SELECT * FROM clientes WHERE rowid = ?').get(clienteId);
    console.log(`📋 Cliente criado: ${clienteCriado.nome} - ${clienteCriado.cpf_cnpj}`);
    
    // 2. Editar cliente
    console.log('\n2️⃣ Editando cliente...');
    const updateCliente = db.prepare(`
        UPDATE clientes SET telefone = ?, email = ? WHERE rowid = ?
    `);
    
    updateCliente.run('(11) 99999-8888', 'novoemail@empresacrud.com.br', clienteId);
    
    const clienteEditado = db.prepare('SELECT * FROM clientes WHERE rowid = ?').get(clienteId);
    console.log(`✅ Cliente editado: ${clienteEditado.nome} - ${clienteEditado.telefone}`);
    
    // 3. Validar campos obrigatórios
    console.log('\n3️⃣ Testando validações...');
    try {
        insertCliente.run('', '', '', '', ''); // Campos vazios
        console.log('❌ ERRO: Deveria ter rejeitado campos vazios');
    } catch (error) {
        console.log('✅ Validação OK: Campos obrigatórios funcionando');
    }
    
    // ========== TESTE MODALIDADES ==========
    console.log('\n💳 TESTANDO MODALIDADES:');
    
    // 1. Criar modalidade
    console.log('\n1️⃣ Criando nova modalidade...');
    const timestamp = Date.now();
    const novaModalidade = {
        nome: `Cartão de Crédito - Teste ${timestamp}`,
        ativo: 1
    };
    
    const insertModalidade = db.prepare(`
        INSERT INTO modalidades (nome, ativo) VALUES (?, ?)
    `);
    
    const resultModalidade = insertModalidade.run(novaModalidade.nome, novaModalidade.ativo);
    console.log(`✅ Modalidade criada com ID: ${resultModalidade.lastInsertRowid}`);
    const modalidadeId = resultModalidade.lastInsertRowid;
    
    // Verificar se a modalidade foi criada
    const modalidadeCriada = db.prepare('SELECT * FROM modalidades WHERE rowid = ?').get(modalidadeId);
    console.log(`📋 Modalidade criada: ${modalidadeCriada.nome} - Ativo: ${modalidadeCriada.ativo}`);
    
    // 2. Desativar modalidade
    console.log('\n2️⃣ Desativando modalidade...');
    const updateModalidade = db.prepare(`
        UPDATE modalidades SET ativo = 0 WHERE rowid = ?
    `);
    
    updateModalidade.run(modalidadeId);
    
    const modalidadeEditada = db.prepare('SELECT * FROM modalidades WHERE rowid = ?').get(modalidadeId);
    console.log(`✅ Modalidade ${modalidadeEditada.ativo ? 'ATIVA' : 'INATIVA'}: ${modalidadeEditada.nome}`);
    
    // ========== TESTE TAXAS ==========
    console.log('\n💰 TESTANDO TAXAS:');
    
    // 1. Criar taxa
    console.log('\n1️⃣ Criando nova taxa...');
    const timestampTaxa = Date.now();
    const novaTaxa = {
        nome: `Taxa de Juros - Teste ${timestampTaxa}`,
        percentual: 2.5,
        tipo: 'juros',
        ativo: 1
    };
    
    const insertTaxa = db.prepare(`
        INSERT INTO taxas (nome, percentual, tipo, ativo) VALUES (?, ?, ?, ?)
    `);
    
    const resultTaxa = insertTaxa.run(novaTaxa.nome, novaTaxa.percentual, novaTaxa.tipo, novaTaxa.ativo);
    console.log(`✅ Taxa criada com ID: ${resultTaxa.lastInsertRowid}`);
    const taxaId = resultTaxa.lastInsertRowid;
    
    // Verificar se a taxa foi criada
    const taxaCriada = db.prepare('SELECT * FROM taxas WHERE rowid = ?').get(taxaId);
    console.log(`📋 Taxa criada: ${taxaCriada.nome} - ${taxaCriada.percentual}% - Tipo: ${taxaCriada.tipo}`);
    
    // 2. Editar taxa
    console.log('\n2️⃣ Editando taxa...');
    const updateTaxa = db.prepare(`
        UPDATE taxas SET percentual = 15.0 WHERE rowid = ?
    `);
    
    updateTaxa.run(taxaId);
    
    const taxaEditada = db.prepare('SELECT * FROM taxas WHERE rowid = ?').get(taxaId);
    console.log(`✅ Taxa editada: ${taxaEditada.nome} - ${taxaEditada.percentual}%`);
    
    // ========== TESTE EXCLUSÕES ==========
    console.log('\n🗑️ TESTANDO EXCLUSÕES:');
    
    // Excluir registros de teste
    const deleteCliente = db.prepare('DELETE FROM clientes WHERE rowid = ?');
    const deleteModalidade = db.prepare('DELETE FROM modalidades WHERE rowid = ?');
    const deleteTaxa = db.prepare('DELETE FROM taxas WHERE rowid = ?');
    
    deleteCliente.run(clienteId);
    deleteModalidade.run(modalidadeId);
    deleteTaxa.run(taxaId);
    
    console.log('✅ Registros de teste excluídos com sucesso');
    
    // ========== RESUMO FINAL ==========
    console.log('\n📊 RESUMO FINAL:');
    
    const totalClientes = db.prepare('SELECT COUNT(*) as total FROM clientes').get().total;
    const totalModalidades = db.prepare('SELECT COUNT(*) as total FROM modalidades').get().total;
    const totalTaxas = db.prepare('SELECT COUNT(*) as total FROM taxas').get().total;
    
    const modalidadesAtivas = db.prepare('SELECT COUNT(*) as total FROM modalidades WHERE ativo = 1').get().total;
    const taxasAtivas = db.prepare('SELECT COUNT(*) as total FROM taxas WHERE ativo = 1').get().total;
    
    console.log(`   👥 Total de clientes: ${totalClientes}`);
    console.log(`   💳 Total de modalidades: ${totalModalidades} (${modalidadesAtivas} ativas)`);
    console.log(`   💰 Total de taxas: ${totalTaxas} (${taxasAtivas} ativas)`);
    
    // Taxas por tipo
    const taxasPorTipo = db.prepare(`
        SELECT tipo, COUNT(*) as quantidade, AVG(percentual) as media
        FROM taxas 
        WHERE ativo = 1
        GROUP BY tipo
    `).all();
    
    console.log('\n💰 Taxas ativas por tipo:');
    taxasPorTipo.forEach(tipo => {
        console.log(`   ${tipo.tipo}: ${tipo.quantidade} taxas (média: ${tipo.media.toFixed(2)}%)`);
    });
    
    console.log('\n✅ Todos os testes CRUD executados com sucesso!');
    
    db.close();
    
} catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
    process.exit(1);
}