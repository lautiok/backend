# Proyecto Backend: Sistema de Gestión ecommerce 🛒📦

Este proyecto es un sistema backend desarrollado en Node.js con Express y MongoDB para gestionar carritos de compras, productos y autenticación de usuarios. Además, proporciona una interfaz gráfica de usuario (GUI) para interactuar con las funcionalidades del sistema de forma más amigable. 🚀

#### Tecnologías y Herramientas Utilizadas

**Entorno de Ejecución y Frameworks**
- **Node.js:** Entorno de ejecución para JavaScript que permite ejecutar código del lado del servidor.
- **Express:** Framework para Node.js que facilita la creación de servidores web y APIs.

**Almacenamiento y Bases de Datos**
- **File System:** Utilizado para almacenar datos directamente en el sistema de archivos del servidor.
- **MongoDB:** Base de datos NoSQL orientada a documentos.
- **Mongoose:** Biblioteca de modelado de objetos para MongoDB en Node.js, utilizada para manejar los datos del ecommerce.

**Motor de Plantillas**
- **Handlebars:** Motor de plantillas que permite generar HTML dinámico desde templates, utilizado para renderizar vistas del lado del servidor.

**Comunicación en Tiempo Real**
- **Socket.IO:** Biblioteca para aplicaciones web en tiempo real, permitiendo la comunicación bidireccional entre clientes y servidores, utilizada en la función de chat.

**Gestión de Cookies y Sesiones**
- **Cookie Parser:** Librería para analizar y manejar cookies adjuntas a las solicitudes HTTP, facilitando la gestión de sesiones y autenticación de usuarios.
- **JSON Web Tokens (JWT):** Estándar para transmitir información de manera segura en formato JSON, utilizado para la autenticación y autorización de usuarios.
- **Passport.js:** Middleware de autenticación en Node.js, implementado con estrategias como Local, JWT y GitHub para gestionar la autenticación de usuarios.

**Configuración y Variables de Entorno**
- **Dotenv:** Librería para cargar variables de entorno desde un archivo `.env`, asegurando la configuración segura de datos sensibles.

**Comandos y Herramientas CLI**
- **Commander:** Librería para crear interfaces de línea de comandos (CLI) en Node.js, permitiendo al usuario seleccionar diferentes opciones de almacenamiento de datos.

**Identificadores Únicos**
- **UUID:** Herramienta para generar identificadores únicos, utilizada para los códigos de los tickets de compra, garantizando la unicidad de cada transacción.

**Envío de Correos Electrónicos**
- **Nodemailer:** Librería para enviar correos electrónicos desde una aplicación Node.js, usada para reestablecimiento de contraseñas y envío de tickets de compra.

**Seguridad y Control de Acceso**
- **CORS:** Mecanismo de seguridad que controla las solicitudes HTTP entre diferentes dominios, asegurando un intercambio de datos seguro.

**Compresión de Datos**
- **gzip y Brotli:** Algoritmos de compresión de datos que mejoran la eficiencia en la transferencia de archivos y el rendimiento del servidor.

**Registro y Monitoreo**
- **Winston:** Biblioteca para gestionar y registrar eventos y errores durante la ejecución del programa.

**Documentación de APIs**
- **Swagger:** Herramienta para documentar y diseñar APIs RESTful, utilizada para documentar las rutas `api/products` y `api/carts`.

**Pruebas y Validación**
- **Mocha, Chai y Supertest:** Conjunto de bibliotecas para pruebas de solicitudes HTTP y validación de respuestas del servidor, asegurando el correcto funcionamiento de las rutas y controladores.


## Cómo usar el proyecto 🚀

Requisitos previos 🔍

- Node.js instalado en tu sistema
- MongoDB instalado y en funcionamiento
- Conexión a internet para instalar dependencias

## Pasos para ejecutar el proyecto 🛠️

1 Clonar el repositorio:

```bash
git clone https://github.com/lautiok/backend
```

2 Instalar dependencias:

```bash
cd backend
npm install

```

3 Ejecutar la aplicación:

```bash
npm start
```

La aplicación se ejecutará en el puerto especificado (8080)

## Interfaz Gráfica de Usuario (GUI) 🖥️

Una vez que la aplicación esté en funcionamiento, puedes acceder a la interfaz gráfica de usuario (GUI) abriendo un navegador web y navegando a la dirección http://localhost:8080

La interfaz gráfica proporciona las siguientes funcionalidades:

- Crear un nuevo carrito
- Agregar un producto al carrito
- Ver el contenido del carrito

## Demostración 🎥

A continuación, puedes ver una demostración de la interfaz gráfica de usuario (GUI) en acción:

LOGIN (http://localhost:8080/login)

[![Demo](./src/public/img/Capture-login.PNG)](http://localhost:8080/login)

REGISTRO (http://localhost:8080/register)

[![Demo](./src/public/img/Capture-registro.PNG)](http://localhost:8080/register)

PRODUCTOS (http://localhost:8080/products)

[![Demo](./src/public/img/Capture-products.PNG)](http://localhost:8080/products)
