# Sistema Gestor de Catálogo de Productos - IMSS

Este sistema es una solución web integral diseñada para la administración, consulta, filtrado dinámico y auditoría de los productos de la institución. La arquitectura está completamente desacoplada, utilizando un backend robusto en Spring Boot y un frontend reactivo en Angular.

## 🛠️ Tecnologías Utilizadas

### Backend
- **Java 17** / **Spring Boot 3.x**
- **Spring Security** (Autenticación basada en **JWT** y cifrado de contraseñas con **BCrypt**)
- **Spring Data JPA**
- **Apache POI 5.2.5** (Generación de reportes Excel en memoria RAM cifrados en Base64)
- **MariaDB** (Gestor de Base de Datos)
- **Maven** (Gestor de Dependencias)

### Frontend
- **Angular 17+**
- **Bootstrap 5** & **Bootstrap Icons** (Diseño e interfaz de usuario institucional)
- **TypeScript**

---

## 📋 Requisitos Previos

Antes de comenzar la instalación, asegúrate de tener instalado lo siguiente:
- [Java JDK 17](https://.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)
- [Node.js](https://nodejs.org/) (Versión LTS recomendada)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)
- [MariaDB Server](https://mariadb.org/download/)
- Un IDE como **IntelliJ IDEA** o **VS Code**

---

## 🚀 Pasos para la Instalación y Despliegue

### 1. Configuración de la Base de Datos (MariaDB)

1. Abre tu gestor de base de datos (DBeaver, HeidiSQL, etc.) o la consola de MariaDB.
2. Crea la base de datos para el proyecto:
   ```sql
   CREATE DATABASE db_gestor_productos;

3.-El sistema cuenta con una clase DataInitializer en Java que poblará automáticamente la tabla de usuarios con un administrador de prueba (crystian.dev) con contraseña cifrada la primera vez que arranques el servidor.

2. Configuración y Arranque del Backend (Spring Boot)
   Clona el repositorio o navega a la carpeta del backend.

Abre el archivo src/main/resources/application.properties (o .yml) y asegúrate de configurar correctamente tus credenciales de MariaDB:
Properties
spring.datasource.url=jdbc:mariadb://localhost:3306/db_gestor_productos
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_CONTRASEÑA
spring.jpa.hibernate.ddl-auto=update

3. Importa el proyecto en tu IDE (IntelliJ IDEA) como un proyecto Maven.

4. Sincroniza las dependencias de Maven (clic derecho en pom.xml -> Maven -> Reload Project).

5. Ejecuta la aplicación presionando Play en la clase principal GestorProductosApplication.java.

6. El backend levantará en el puerto estándar: http://localhost:8080

3. Configuración y Arranque del Frontend (Angular)

Navega a la carpeta raíz del proyecto frontend desde tu terminal:

Bash
cd gestor-productos-front

Instala todas las dependencias y módulos de Node necesarios mediante npm:
npm install

Verifica que la URL de la API apunte correctamente a tu backend local en el archivo de entornos (src/environments/environment.ts):

TypeScript
export const environment = {
production: false,
apiUrl: 'http://localhost:8080/api/v1'
};

4. Levanta el servidor de desarrollo local de Angular:
   ng serve

5. Abre tu navegador web e ingresa a la siguiente dirección: http://localhost:4200

Credenciales de Acceso de Prueba
Para realizar las pruebas iniciales de los flujos de seguridad, filtrado y exportación, utiliza la cuenta generada automáticamente por el inicializador del sistema:

Usuario: crystian.dev

Contraseña: Imss2026!

Rol asignado: ROLE_ADMIN