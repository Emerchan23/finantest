# Instruções para usar a imagem Docker

## Imagem criada
- **Nome da imagem**: `emerchan2025/erp-br:latest`
- **Tamanho**: 286MB
- **Status**: Disponível no Docker Hub

## Como usar

### 1. Executar com Docker Run
```bash
docker run -d \
  --name erp-br-app \
  -p 3145:3145 \
  -v ./data:/data \
  -e NODE_ENV=development \
  -e NEXT_PUBLIC_API_URL=http://localhost:3145/api \
  emerchan2025/erp-br:latest
```

### 2. Executar com Docker Compose
```bash
docker-compose up -d
```

### 3. Baixar a imagem
```bash
docker pull emerchan2025/erp-br:latest
```

## Configurações

### Portas
- **Aplicação**: 3145
- **Mapeamento**: Host:3145 -> Container:3145

### Volumes
- **Banco de dados**: `../banco-de-dados:/data`
- **Arquivo SQLite**: `/data/erp.sqlite`

### Variáveis de ambiente
- `NODE_ENV=development`
- `PORT=3145`
- `HOSTNAME=0.0.0.0`
- `DB_PATH=/data/erp.sqlite`
- `NEXT_PUBLIC_API_URL=http://localhost:3145/api`

## Acesso
Após executar o container, acesse:
- **URL**: http://localhost:3145

## Logs
```bash
# Ver logs do container
docker logs erp-br-app

# Seguir logs em tempo real
docker logs -f erp-br-app
```

## Parar e remover
```bash
# Parar o container
docker stop erp-br-app

# Remover o container
docker rm erp-br-app

# Parar com docker-compose
docker-compose down
```

## Estrutura da imagem
- **Base**: Node.js 18 Alpine
- **Usuário**: nextjs (UID: 1001)
- **Diretório de trabalho**: /app
- **Comando**: node server.js

## Recursos incluídos
- Aplicação Next.js otimizada para produção
- Banco de dados SQLite
- Sistema de gestão de vendas completo
- APIs integradas
- Interface web responsiva