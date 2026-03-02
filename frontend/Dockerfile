FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (con legacy-peer-deps por si acaso)
RUN npm install --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Arrancar en modo host para que Docker pueda mapear el puerto
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
