# --- Etapa 1: build ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# En producción el frontend habla con el backend a través del mismo origen
# (Nginx hace de proxy inverso de /api -> backend:8000), así que la URL base
# de la API queda vacía/relativa. Ver nginx.conf.
ENV VITE_API_BASE_URL=""
RUN npm run build

# --- Etapa 2: servir ---
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
