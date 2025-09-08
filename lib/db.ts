import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import fs from 'fs'

// Configurar caminho do banco para fora do container
const dbPath = process.env.DB_PATH || join(process.cwd(), 'data', 'erp.sqlite')

// Função para validar acesso ao banco de dados
function validateDatabaseAccess(path: string): boolean {
  try {
    const dir = dirname(path)
    
    // Verificar se diretório existe ou pode ser criado
    if (!fs.existsSync(dir)) {
      console.log(`📁 Criando diretório do banco: ${dir}`)
      fs.mkdirSync(dir, { recursive: true })
    }
    
    // Testar permissões de escrita
    const testFile = join(dir, '.write-test')
    fs.writeFileSync(testFile, 'test')
    fs.unlinkSync(testFile)
    
    console.log(`✅ Banco de dados validado: ${path}`)
    return true
  } catch (error) {
    console.error(`❌ Erro de acesso ao banco de dados: ${path}`)
    console.error(`❌ Detalhes do erro:`, error)
    return false
  }
}

// Validar acesso antes de criar conexão
if (!validateDatabaseAccess(dbPath)) {
  throw new Error(`❌ Sem permissão para acessar banco de dados: ${dbPath}. Verifique as permissões do diretório.`)
}

// Criar conexão com o banco
let db: Database.Database
try {
  db = new Database(dbPath)
  console.log(`✅ Conexão com banco estabelecida: ${dbPath}`)
} catch (error) {
  console.error(`❌ Erro ao conectar com banco:`, error)
  throw new Error(`❌ Falha na conexão com banco de dados: ${dbPath}`)
}

export { db }

// Configurar WAL mode para melhor performance
db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
db.pragma('cache_size = 1000000')
db.pragma('foreign_keys = ON')
db.pragma('temp_store = MEMORY')

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS empresas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    razao_social TEXT,
    cnpj TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    logo_url TEXT,
    nome_do_sistema TEXT DEFAULT 'LP IND',
    imposto_padrao REAL,
    capital_padrao REAL,
    layout_orcamento TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf_cnpj TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    empresa_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    categoria TEXT,
    empresa_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS vendas (
    id TEXT PRIMARY KEY,
    cliente_id TEXT,
    produto_id TEXT,
    quantidade INTEGER NOT NULL,
    preco_unitario REAL NOT NULL,
    total REAL NOT NULL,
    data_venda DATETIME DEFAULT CURRENT_TIMESTAMP,
    empresa_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS orcamentos (
    id TEXT PRIMARY KEY,
    numero TEXT NOT NULL UNIQUE,
    cliente_id TEXT NOT NULL,
    data_orcamento TEXT NOT NULL,
    data_validade TEXT,
    valor_total REAL NOT NULL DEFAULT 0,
    descricao TEXT,
    status TEXT DEFAULT 'pendente',
    observacoes TEXT,
    condicoes_pagamento TEXT,
    prazo_entrega TEXT,
    vendedor_id TEXT,
    desconto REAL DEFAULT 0,
    empresa_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
  );

  CREATE TABLE IF NOT EXISTS orcamento_itens (
    id TEXT PRIMARY KEY,
    orcamento_id TEXT NOT NULL,
    produto_id TEXT,
    descricao TEXT NOT NULL,
    marca TEXT,
    quantidade REAL NOT NULL,
    valor_unitario REAL NOT NULL,
    valor_total REAL NOT NULL,
    observacoes TEXT,
    link_ref TEXT,
    custo_ref REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orcamento_id) REFERENCES orcamentos (id)
  );

  CREATE TABLE IF NOT EXISTS user_prefs (
    userId TEXT PRIMARY KEY,
    json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Ignorar erros se as colunas já existirem
try {
  db.exec(`
    ALTER TABLE empresas ADD COLUMN imposto_padrao REAL;
    ALTER TABLE empresas ADD COLUMN capital_padrao REAL;
  `);
} catch (error) {
  // Colunas já existem, ignorar erro
}

// Tentar adicionar colunas que podem não existir em bancos antigos
try {
  db.exec(`ALTER TABLE orcamentos ADD COLUMN vendedor_id TEXT;`)
} catch (error) {
  // Coluna já existe ou outro erro - ignorar
}

try {
  db.exec(`ALTER TABLE empresas ADD COLUMN layout_orcamento TEXT;`)
} catch (error) {
  // Coluna já existe ou outro erro - ignorar
}

// Adicionar colunas SMTP
try {
  db.exec(`ALTER TABLE empresas ADD COLUMN smtp_host TEXT`)
} catch (error) {
  // Coluna já existe
}

try {
  db.exec(`ALTER TABLE empresas ADD COLUMN smtp_port INTEGER DEFAULT 587`)
} catch (error) {
  // Coluna já existe
}

try {
  db.exec(`ALTER TABLE empresas ADD COLUMN smtp_secure BOOLEAN DEFAULT 0`)
} catch (error) {
  // Coluna já existe
}

try {
  db.exec(`ALTER TABLE empresas ADD COLUMN smtp_user TEXT`)
} catch (error) {
  // Coluna já existe
}

try {
  db.exec(`ALTER TABLE empresas ADD COLUMN smtp_password TEXT`)
} catch (error) {
  // Coluna já existe
}

try {
  db.exec(`ALTER TABLE empresas ADD COLUMN smtp_from_name TEXT`)
} catch (error) {
  // Coluna já existe
}

try {
  db.exec(`ALTER TABLE empresas ADD COLUMN smtp_from_email TEXT`)
} catch (error) {
  // Coluna já existe
}

export default db