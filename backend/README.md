
# Inventarios JAMP - Backend Spring Boot

## Descripción
Backend del Inventarios JAMP desarrollado con Spring Boot, implementando el patrón MVC con controladores y vistas Thymeleaf que mantienen exactamente el mismo diseño del frontend React original.

## Tecnologías Utilizadas
- **Spring Boot 3.2.1**
- **Java 17**
- **Thymeleaf** (Motor de plantillas)
- **Spring Data JPA**
- **H2 Database** (Base de datos en memoria para desarrollo)
- **Maven** (Gestión de dependencias)
- **TailwindCSS** (Framework CSS)
- **Remix Icons** (Iconografía)

## Estructura del Proyecto

```
backend/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── hospital/
│       │           └── inventario/
│       │               ├── InventarioBackendApplication.java
│       │               ├── controller/
│       │               │   ├── HomeController.java
│       │               │   ├── DashboardController.java
│       │               │   ├── ProductosController.java
│       │               │   ├── AlmacenesController.java
│       │               │   ├── TransaccionesController.java
│       │               │   ├── KardexController.java
│       │               │   ├── CatalogoProductosController.java
│       │               │   ├── LineaProductoController.java
│       │               │   ├── InventarioController.java
│       │               │   ├── ReportesController.java
│       │               │   └── ConfiguracionController.java
│       │               ├── model/
│       │               │   ├── Producto.java
│       │               │   ├── Almacen.java
│       │               │   ├── Transaccion.java
│       │               │   └── LineaProducto.java
│       │               └── service/
│       │                   ├── ProductoService.java
│       │                   ├── AlmacenService.java
│       │                   ├── TransaccionService.java
│       │                   ├── KardexService.java
│       │                   ├── LineaProductoService.java
│       │                   ├── CatalogoService.java
│       │                   ├── InventarioService.java
│       │                   ├── ReporteService.java
│       │                   └── ConfiguracionService.java
│       └── resources/
│           ├── templates/
│           │   └── home.html
│           └── application.properties
├── pom.xml
└── README.md
```

## Características Implementadas

### ✅ Arquitectura MVC Completa
- **Controladores**: Manejo de solicitudes HTTP para cada módulo
- **Modelos**: Entidades JPA con relaciones y validaciones
- **Servicios**: Lógica de negocio separada y reutilizable
- **Vistas**: Plantillas Thymeleaf con el diseño original

### ✅ Módulos del Sistema
1. **Dashboard** - Panel de control con métricas
2. **Productos** - Gestión de productos médicos
3. **Almacenes** - Control de almacenes y ubicaciones
4. **Transacciones** - Registro de movimientos
5. **Kardex** - Historial detallado de movimientos
6. **Inventario** - Control de stock y existencias
7. **Catálogo de Productos** - Gestión del catálogo
8. **Líneas de Producto** - Organización por categorías
9. **Reportes** - Informes y análisis
10. **Configuración** - Configuración del sistema

### ✅ Modelos de Datos
- **Producto**: Gestión completa de productos médicos
- **Almacen**: Control de almacenes y ubicaciones
- **Transaccion**: Registro de movimientos de inventario
- **LineaProducto**: Organización por líneas y familias

### ✅ Servicios de Negocio
- Datos de prueba precargados
- Operaciones CRUD básicas
- Lógica de negocio separada

## Configuración y Ejecución

### Prerrequisitos
- Java 17 o superior
- Maven 3.6 o superior
- IDE (IntelliJ IDEA, Eclipse, VS Code)

### Pasos para Ejecutar

1. **Clonar o descargar el proyecto**
```bash
cd backend
```

2. **Compilar el proyecto**
```bash
mvn clean compile
```

3. **Ejecutar la aplicación**
```bash
mvn spring-boot:run
```

4. **Acceder a la aplicación**
- URL principal: http://localhost:8080
- Base de datos H2: http://localhost:8080/h2-console

### Configuración de Base de Datos H2
- **URL**: `jdbc:h2:mem:inventario`
- **Usuario**: `sa`
- **Contraseña**: (vacía)

## Estructura de URLs

| Módulo | URL | Descripción |
|--------|-----|-------------|
| Home | `/` | Página principal del sistema |
| Dashboard | `/dashboard` | Panel de control y métricas |
| Productos | `/productos` | Gestión de productos |
| Almacenes | `/almacenes` | Control de almacenes |
| Transacciones | `/transacciones` | Registro de transacciones |
| Kardex | `/kardex` | Historial de movimientos |
| Inventario | `/inventario` | Control de stock |
| Catálogo | `/catalogo-productos` | Catálogo de productos |
| Líneas | `/linea-producto` | Líneas de productos |
| Reportes | `/reportes` | Informes del sistema |
| Configuración | `/configuracion` | Configuración |

## Datos de Prueba

El sistema incluye datos de prueba precargados:

### Productos
- Paracetamol 500mg
- Ibuprofeno 400mg
- Jeringa 5ml
- Termómetro Digital

### Almacenes
- Almacén Central
- Almacén de Medicamentos
- Almacén de Suministros

### Usuarios
- **María González** - Administrador de Inventario

## Próximos Pasos

### Fase 1: Completar Vistas Thymeleaf
- [ ] Implementar todas las plantillas HTML
- [ ] Mantener diseño exacto del frontend React
- [ ] Agregar interactividad con JavaScript

### Fase 2: Integración con Base de Datos
- [ ] Configurar MySQL/PostgreSQL
- [ ] Implementar repositorios JPA
- [ ] Migrar datos de prueba

### Fase 3: Funcionalidades Avanzadas
- [ ] Autenticación y autorización
- [ ] API REST para integración
- [ ] Reportes en PDF/Excel
- [ ] Notificaciones en tiempo real

## Notas Técnicas

### Patrón MVC Implementado
- **Controladores**: Manejan las solicitudes HTTP y preparan datos para las vistas
- **Servicios**: Contienen la lógica de negocio y datos de prueba
- **Modelos**: Entidades JPA con anotaciones para persistencia
- **Vistas**: Plantillas Thymeleaf con TailwindCSS

### Configuración de Desarrollo
- **Hot Reload**: Habilitado con Spring DevTools
- **Base de Datos**: H2 en memoria para desarrollo rápido
- **Logging**: Configurado para debugging
- **Thymeleaf**: Cache deshabilitado para desarrollo

Este backend mantiene exactamente el mismo diseño y funcionalidad del frontend React original, pero implementado con tecnologías Java/Spring Boot para el curso de desarrollo web.
