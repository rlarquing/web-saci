# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build usa las variables de entorno en tiempo de compilación
ARG API_URL=http://srv895496.hstgr.cloud:3003/api/
ARG NEXT_PUBLIC_API_URL=
ENV API_URL=$API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar artefactos compilados desde builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json

# Usuario no-root para seguridad
RUN addgroup -S sacp && adduser -S sacp -G sacp \
    && chown -R sacp:sacp /app

USER sacp

EXPOSE 4000

CMD ["npm", "run", "start"]
