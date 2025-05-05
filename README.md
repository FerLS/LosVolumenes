# Los Volumenes

Los Volumenes es una aplicación de almacenamiento en la nube personal desarrollada con Next.js que te permite organizar y gestionar tus archivos de manera sencilla e intuitiva. Con una interfaz moderna y responsive, podrás acceder a tus archivos desde cualquier dispositivo.

## Configuración de tu propio almacenamiento en la nube

Sigue estos pasos para configurar tu propia instancia de Los Volumenes:

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/los-volumenes.git
cd los-volumenes
npm install
```

### 2. Configurar MongoDB

Necesitarás una base de datos MongoDB para almacenar los metadatos de los archivos y la información de usuario:

1. Crea una base de datos MongoDB localmente o utilizando un servicio en la nube como [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una nueva base de datos llamada `los_volumenes` (o elige tu propio nombre)
3. Obtén tu cadena de conexión de MongoDB, que se verá algo así:
   ```
   mongodb+srv://usuario:contraseña@cluster0.mongodb.net/los_volumenes
   ```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en el directorio raíz del proyecto con las siguientes variables:

```
MONGOURI=tu_cadena_de_conexion_mongodb
NEXT_PUBLIC_MAX_SIZE=30
DEMO=false
```

Donde:

- `MONGOURI` es tu cadena de conexión de MongoDB
- `NEXT_PUBLIC_MAX_SIZE` es el tamaño máximo de almacenamiento en GB (por defecto es 30GB)
- `DEMO` controla si la aplicación se ejecuta en modo demostración (establece `false` para habilitar todas las funcionalidades)

### 4. Almacenamiento de archivos

La aplicación utiliza el sistema de archivos del servidor para almacenar los archivos subidos. Por defecto, los archivos se guardan en el directorio `public/drive` del proyecto.

Asegúrate de que el directorio tenga los permisos de escritura adecuados:

```bash
mkdir -p public/drive
chmod 755 public/drive
```

### 5. Ajustar el tamaño máximo de carga

Para cambiar el tamaño máximo de archivo permitido para cargas individuales:

1. Abre tu archivo `.env.local`
2. Establece la variable `NEXT_PUBLIC_MAX_SIZE` al límite deseado en GB
   - Por ejemplo, `NEXT_PUBLIC_MAX_SIZE=5` para un límite de 5GB

### 6. Deshabilitar el modo demostración

Por defecto, la aplicación se ejecuta en modo demostración, lo que restringe la carga de archivos. Para habilitar todas las funcionalidades:

1. Asegúrate de que la variable de entorno `DEMO` esté establecida en `false` en tu archivo `.env.local`
2. Reinicia la aplicación para que los cambios surtan efecto

### 7. Iniciar la aplicación

```bash
npm run build
npm start
```

Tu almacenamiento personal en la nube estará disponible en [http://localhost:3000](http://localhost:3000).

## Desarrollo

Para ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) con tu navegador para ver el resultado.

## Tecnologías utilizadas

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)


