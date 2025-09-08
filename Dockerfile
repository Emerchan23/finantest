# Dockerfile para aplicação Next.js integrada com API
FROM node:18-alpine AS base

# Instalar dependências apenas quando necessário
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# Instalar dependências baseado no gerenciador de pacotes preferido
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild do código fonte apenas quando necessário
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js coleta dados de telemetria completamente anônimos sobre uso geral.
# Saiba mais aqui: https://nextjs.org/telemetry
# Descomente a linha seguinte caso queira desabilitar a telemetria durante o build.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Imagem de produção, copiar todos os arquivos e executar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Descomente a linha seguinte caso queira desabilitar a telemetria durante runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Definir as permissões corretas para prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar automaticamente arquivos de saída com base no trace de saída
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar arquivos da lib (banco de dados e utilitários)
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib

USER nextjs

EXPOSE 4523

ENV PORT=4523
ENV HOSTNAME="0.0.0.0"

# Configurar caminho do banco para volume externo
ENV DB_PATH="/data/erp.sqlite"

CMD ["node", "server.js"]
