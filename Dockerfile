# --- Etapa 1: Construcción (Builder) ---
FROM node:20-alpine AS builder

# Crear directorio de la app
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto del código y compilar (NestJS a JS)
COPY . .
RUN npm run build

# --- Etapa 2: Producción ---
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario de la Etapa 1
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Exponer el puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "dist/main.js"]