# Build multi-stage del backend NestJS
FROM node:22-alpine AS build
# Prisma detecta la versión de OpenSSL al generar el cliente.
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Prisma necesita OpenSSL en Alpine.
RUN apk add --no-cache openssl
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
# Aplica migraciones pendientes y arranca (el build emite dist/src/main).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
