# Despliegue de CorpIA en Oracle Cloud Infrastructure (OCI)

Esta guía asume una instancia Compute nueva (funciona tanto con el *Always
Free Tier* — VM.Standard.E2.1.Micro o Ampere A1 — como con una instancia de
pago mayor).

## 1. Crear la instancia Compute

1. En la consola de OCI: **Compute → Instances → Create Instance**.
2. Imagen: **Ubuntu 22.04** (o 24.04).
3. Forma (*shape*):
   - Gratis: `VM.Standard.E2.1.Micro` (x86) o `VM.Standard.A1.Flex` (ARM,
     hasta 4 OCPU / 24 GB en el free tier — recomendada, más holgada para
     ChromaDB).
   - Producción real: `VM.Standard.E4.Flex` con 2+ OCPU / 8+ GB RAM.
4. En **Networking**, asegúrate de asignar una **IP pública**.
5. Descarga el par de llaves SSH (o usa una propia) y crea la instancia.

## 2. Abrir los puertos en el Security List / NSG

Ve a **Networking → Virtual Cloud Networks → (tu VCN) → Security Lists** y
agrega reglas de *Ingress* para el subnet público:

| Puerto | Protocolo | Origen | Uso |
|---|---|---|---|
| 22 | TCP | Tu IP (idealmente, no 0.0.0.0/0) | SSH |
| 80 | TCP | 0.0.0.0/0 | Frontend (HTTP) |
| 443 | TCP | 0.0.0.0/0 | Frontend (HTTPS, si configuras certificado) |

> El backend (puerto 8000) **no** necesita regla de ingreso pública: el
> frontend le habla internamente vía la red de Docker (`nginx.conf` hace de
> proxy de `/api`). Solo ábrelo si quieres pegarle directo desde fuera para
> depurar.

## 3. Conectarte e instalar Docker

```bash
ssh -i tu-llave.pem ubuntu@<IP_PUBLICA>

# Firewall interno de Ubuntu (además del Security List de OCI)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Instalar Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

## 4. Subir el proyecto

Opción A — con git (recomendado si ya lo subiste a un repositorio):
```bash
git clone <URL_DE_TU_REPOSITORIO> corpia
cd corpia
```

Opción B — copiar el ZIP directamente desde tu máquina:
```bash
# Desde tu computadora local:
scp -i tu-llave.pem CorpIA-Fase4-Deploy.zip ubuntu@<IP_PUBLICA>:~
# Ya en la instancia:
unzip CorpIA-Fase4-Deploy.zip -d corpia && cd corpia
```

## 5. Configurar variables de entorno de producción

```bash
cd backend
# Genera un secreto nuevo, NO reutilices el que trae el .env de ejemplo
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
nano .env
```

Edita `backend/.env` con:
- `SECRET_KEY` → el que acabas de generar.
- `CORS_ORIGINS` → `["http://<IP_PUBLICA>"]` (o tu dominio si tienes uno,
  ej. `["https://corpia.tuempresa.com"]`).
- `ENVIRONMENT=production`.

## 6. Levantar los contenedores

Desde la raíz del proyecto (donde está `docker-compose.yml`):
```bash
docker compose up -d --build
```

Verifica que ambos servicios estén saludables:
```bash
docker compose ps
docker compose logs -f backend    # Ctrl+C para salir
```

Abre `http://<IP_PUBLICA>` en el navegador — deberías ver el login de
CorpIA. La documentación interactiva de la API queda en
`http://<IP_PUBLICA>/docs` (proxied por Nginx).

## 7. (Opcional pero recomendado) Dominio propio + HTTPS

Si apuntas un dominio a la IP pública de la instancia:

```bash
sudo apt-get update && sudo apt-get install -y certbot python3-certbot-nginx
```

La forma más simple con esta arquitectura (Nginx corriendo *dentro* de un
contenedor) es poner un Nginx adicional en el host como reverse proxy hacia
el contenedor `frontend` (puerto 80), y usar Certbot sobre ese Nginx del
host para gestionar el certificado. Alternativa más avanzada: usar
[Caddy](https://caddyserver.com/) o [Traefik](https://traefik.io/) como
contenedor adicional en `docker-compose.yml` con TLS automático — recomendado
si vas a mantener esto en producción a largo plazo.

## 8. Persistencia y backups

Todos los datos (usuarios, conversaciones, documentos, base vectorial)
viven en el volumen Docker `corpia_data`, montado en `/app/data` dentro del
contenedor del backend. Para respaldarlo:

```bash
docker run --rm -v corpia_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/corpia-backup-$(date +%F).tar.gz -C /data .
```

Para restaurar, extrae ese `.tar.gz` dentro del volumen antes de levantar
los contenedores de nuevo.

## 9. Actualizar a una nueva versión

```bash
git pull                     # o vuelve a subir el ZIP actualizado
docker compose up -d --build
```

Los datos del volumen `corpia_data` no se pierden entre reconstrucciones de
imagen — solo se recrean los contenedores, no el volumen.

## 10. Migrar de SQLite a PostgreSQL (cuando el equipo crezca)

1. Descomenta el servicio `postgres` en `docker-compose.yml`.
2. Cambia `DATABASE_URL` en `backend/.env` a:
   `postgresql+psycopg2://corpia:TU_PASSWORD@postgres:5432/corpia`
3. `docker compose up -d --build` — SQLAlchemy usa el mismo código sin
   cambios, solo cambia el motor de base de datos.
4. Migra los datos existentes de SQLite a PostgreSQL con una herramienta
   como [`pgloader`](https://pgloader.io/) si necesitas conservar el
   histórico.
