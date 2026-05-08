# Reportes Ciudadanos de Problemas Urbanos

Aplicación web para reportar y gestionar problemas urbanos.

## Tecnologías Utilizadas

*   **Frontend**: React, Vite, Leaflet, Axios, Lucide React
*   **Backend**: Node.js, Express, PostgreSQL, PostGIS, Cloudinary, JWT, bcrypt

## Requisitos Previos

1.  **Node.js**: Instalado en el sistema.
2.  **PostgreSQL con PostGIS**: Necesitas una base de datos PostgreSQL con la extensión PostGIS habilitada para soportar datos geoespaciales.
3.  **Cuenta de Cloudinary**: Para el almacenamiento de imágenes. (Opcional si no quieres subir imágenes, pero recomendado).

## Configuración del Backend

1.  Abre una terminal y navega a la carpeta `backend`:
    ```bash
    cd backend
    ```
2.  Copia el archivo `.env.example` (si existe) a `.env` y configura tus variables de entorno, o usa el `.env` que ya se ha creado:
    ```env
    PORT=5000
    DATABASE_URL=postgres://tu_usuario:tu_contraseña@localhost:5432/nombre_db
    JWT_SECRET=tu_secreto_jwt
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME=tu_cloud_name
    CLOUDINARY_API_KEY=tu_api_key
    CLOUDINARY_API_SECRET=tu_api_secret
    ```
3.  Asegúrate de haber creado la base de datos y ejecutado el script SQL en `models.sql` para crear las tablas.
4.  Inicia el servidor backend:
    ```bash
    npm run dev
    # (o node index.js)
    ```

## Configuración del Frontend

1.  Abre otra terminal y navega a la carpeta `frontend`:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias si no lo has hecho:
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

El frontend estará disponible en `http://localhost:5173`.
