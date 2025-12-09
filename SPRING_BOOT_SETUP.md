
# Inventarios JAMP - Documentación Spring Boot

## Configuración del Proyecto Spring Boot

### 1. Estructura del Proyecto Backend

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
│       │               │   ├── AlmacenesController.java
│       │               │   ├── TransaccionesController.java
│       │               │   ├── KardexController.java
│       │               │   ├── CatalogoProductosController.java
│       │               │   └── LineaProductoController.java
│       │               ├── model/
│       │               │   ├── Almacen.java
│       │               │   ├── Transaccion.java
│       │               │   ├── Producto.java
│       │               │   ├── LineaProducto.java
│       │               │   └── FamiliaProducto.java
│       │               └── service/
│       │                   ├── AlmacenService.java
│       │                   ├── TransaccionService.java
│       │                   ├── ProductoService.java
│       │                   └── LineaProductoService.java
│       └── resources/
│           ├── templates/
│           │   ├── index.html
│           │   ├── almacenes.html
│           │   ├── transacciones.html
│           │   ├── kardex.html
│           │   ├── catalogo-productos.html
│           │   └── linea-producto.html
│           ├── static/
│           │   ├── css/
│           │   ├── js/
│           │   └── images/
│           └── application.properties
├── pom.xml
└── README.md
```

### 2. Dependencias Maven (pom.xml)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
        <relativePath/>
    </parent>
    
    <groupId>com.hospital</groupId>
    <artifactId>inventarios-jamp-backend</artifactId>
    <version>1.0.0</version>
    <name>Inventarios JAMP Backend</name>
    <description>Backend del Inventarios JAMP con Spring Boot</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starter Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Spring Boot Starter Thymeleaf -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        
        <!-- Spring Boot Starter Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- H2 Database (para desarrollo) -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Spring Boot DevTools -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        
        <!-- Spring Boot Starter Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 3. Configuración de la Aplicación (application.properties)

```properties
# Configuración del servidor
server.port=8080
server.servlet.context-path=/

# Configuración de Thymeleaf
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.thymeleaf.mode=HTML
spring.thymeleaf.encoding=UTF-8
spring.thymeleaf.cache=false

# Configuración de la base de datos H2
spring.datasource.url=jdbc:h2:mem:inventario
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# Configuración de JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Configuración de la consola H2
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# Configuración de logging
logging.level.com.hospital.inventario=DEBUG
logging.level.org.springframework.web=DEBUG
```

### 4. Clase Principal de la Aplicación

```java
package com.hospital.inventario;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class InventarioBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventarioBackendApplication.class, args);
    }
}
```

### 5. Controladores Spring MVC

#### HomeController.java
```java
package com.hospital.inventario.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
    
    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("pageTitle", "Inventarios JAMP");
        model.addAttribute("userName", "María González");
        model.addAttribute("userRole", "Administrador de Inventario");
        return "index";
    }
}
```

#### AlmacenesController.java
```java
package com.hospital.inventario.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/almacenes")
public class AlmacenesController {
    
    @GetMapping
    public String almacenes(Model model) {
        model.addAttribute("pageTitle", "Gestión de Almacenes");
        return "almacenes";
    }
}
```

### 6. Modelos de Datos

#### Almacen.java
```java
package com.hospital.inventario.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "almacenes")
public class Almacen {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String codigo;
    
    @Column(nullable = false)
    private String nombre;
    
    private String ubicacion;
    private String responsable;
    private String capacidad;
    private String ocupacion;
    private Integer porcentajeOcupacion;
    
    @Enumerated(EnumType.STRING)
    private EstadoAlmacen estado;
    
    private Integer productos;
    private LocalDateTime ultimaActualizacion;
    
    // Constructores, getters y setters
    public Almacen() {}
    
    public Almacen(String codigo, String nombre, String ubicacion, String responsable) {
        this.codigo = codigo;
        this.nombre = nombre;
        this.ubicacion = ubicacion;
        this.responsable = responsable;
        this.estado = EstadoAlmacen.ACTIVO;
        this.ultimaActualizacion = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    // ... resto de getters y setters
    
    public enum EstadoAlmacen {
        ACTIVO, INACTIVO, MANTENIMIENTO
    }
}
```

### 7. Servicios

#### AlmacenService.java
```java
package com.hospital.inventario.service;

import com.hospital.inventario.model.Almacen;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.ArrayList;

@Service
public class AlmacenService {
    
    private List<Almacen> almacenes = new ArrayList<>();
    
    public AlmacenService() {
        // Datos de prueba
        almacenes.add(new Almacen("ALM-001", "Almacén Central", 
            "Edificio Principal - Piso 1", "Carlos Mendoza"));
        almacenes.add(new Almacen("ALM-002", "Almacén de Medicamentos", 
            "Edificio Farmacia - Piso 2", "Ana García"));
    }
    
    public List<Almacen> findAll() {
        return almacenes;
    }
    
    public Almacen findById(Long id) {
        return almacenes.stream()
            .filter(a -> a.getId().equals(id))
            .findFirst()
            .orElse(null);
    }
    
    public Almacen save(Almacen almacen) {
        if (almacen.getId() == null) {
            almacen.setId((long) (almacenes.size() + 1));
        }
        almacenes.add(almacen);
        return almacen;
    }
}
```

### 8. Plantillas Thymeleaf

#### templates/index.html
```html
<!DOCTYPE html>
<html lang="es" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title th:text="${pageTitle}">Inventarios JAMP</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
</head>
<body class="min-h-screen bg-gray-50">
    <!-- Header Navigation -->
    <header class="bg-slate-700 shadow-sm">
        <div class="px-4 lg:px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4 lg:space-x-6">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i class="ri-archive-line text-white text-lg"></i>
                        </div>
                        <h1 class="text-lg lg:text-xl font-bold text-white" th:text="${pageTitle}">Inventarios JAMP</h1>
                    </div>
                </div>
                
                <div class="hidden lg:flex items-center space-x-3">
                    <div class="text-sm">
                        <p class="font-medium text-white" th:text="${userName}">María González</p>
                        <p class="text-blue-200" th:text="${userRole}">Administrador de Inventario</p>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <div class="px-4 lg:px-6 py-6 lg:py-8">
        <!-- Welcome Section -->
        <div class="mb-6 lg:mb-8">
            <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Bienvenido, <span th:text="${userName}">María González</span>
            </h2>
            <p class="text-gray-600">Gestiona tu inventario de manera eficiente desde el panel de control</p>
        </div>

        <!-- Main Modules -->
        <div class="mb-6 lg:mb-8">
            <h3 class="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Módulos del Sistema</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                
                <!-- Almacenes Module -->
                <a href="/almacenes" class="bg-green-50 hover:bg-green-100 rounded-xl p-4 lg:p-6 border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md">
                    <div class="flex items-start space-x-3 lg:space-x-4">
                        <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white flex items-center justify-center text-green-600">
                            <i class="ri-building-2-line text-lg lg:text-xl"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-900 mb-1 lg:mb-2 text-sm lg:text-base">Almacenes</h4>
                            <p class="text-xs lg:text-sm text-gray-600">Control de almacenes y ubicaciones</p>
                        </div>
                        <i class="ri-arrow-right-s-line text-gray-400 text-lg"></i>
                    </div>
                </a>

                <!-- Transacciones Module -->
                <a href="/transacciones" class="bg-purple-50 hover:bg-purple-100 rounded-xl p-4 lg:p-6 border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md">
                    <div class="flex items-start space-x-3 lg:space-x-4">
                        <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white flex items-center justify-center text-purple-600">
                            <i class="ri-exchange-line text-lg lg:text-xl"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-900 mb-1 lg:mb-2 text-sm lg:text-base">Transacciones</h4>
                            <p class="text-xs lg:text-sm text-gray-600">Registro de movimientos y transacciones</p>
                        </div>
                        <i class="ri-arrow-right-s-line text-gray-400 text-lg"></i>
                    </div>
                </a>

                <!-- Kardex Module -->
                <a href="/kardex" class="bg-orange-50 hover:bg-orange-100 rounded-xl p-4 lg:p-6 border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md">
                    <div class="flex items-start space-x-3 lg:space-x-4">
                        <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white flex items-center justify-center text-orange-600">
                            <i class="ri-bar-chart-box-line text-lg lg:text-xl"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-900 mb-1 lg:mb-2 text-sm lg:text-base">Kardex</h4>
                            <p class="text-xs lg:text-sm text-gray-600">Historial detallado de movimientos</p>
                        </div>
                        <i class="ri-arrow-right-s-line text-gray-400 text-lg"></i>
                    </div>
                </a>

                <!-- Catálogo de Productos Module -->
                <a href="/catalogo-productos" class="bg-yellow-50 hover:bg-yellow-100 rounded-xl p-4 lg:p-6 border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md">
                    <div class="flex items-start space-x-3 lg:space-x-4">
                        <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white flex items-center justify-center text-yellow-600">
                            <i class="ri-book-open-line text-lg lg:text-xl"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-900 mb-1 lg:mb-2 text-sm lg:text-base">Catálogo de productos</h4>
                            <p class="text-xs lg:text-sm text-gray-600">Gestión del catálogo de productos</p>
                        </div>
                        <i class="ri-arrow-right-s-line text-gray-400 text-lg"></i>
                    </div>
                </a>

                <!-- Línea y Familia del Producto Module -->
                <a href="/linea-producto" class="bg-pink-50 hover:bg-pink-100 rounded-xl p-4 lg:p-6 border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md">
                    <div class="flex items-start space-x-3 lg:space-x-4">
                        <div class="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-white flex items-center justify-center text-pink-600">
                            <i class="ri-node-tree text-lg lg:text-xl"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="font-semibold text-gray-900 mb-1 lg:mb-2 text-sm lg:text-base">Categorías</h4>
                            <p class="text-xs lg:text-sm text-gray-600">Organización por líneas y familias</p>
                        </div>
                        <i class="ri-arrow-right-s-line text-gray-400 text-lg"></i>
                    </div>
                </a>

            </div>
        </div>
    </div>
</body>
</html>
```

### 9. Instrucciones de Ejecución

#### Para ejecutar en IntelliJ IDEA:

1. **Abrir el proyecto:**
   - File → Open
   - Seleccionar la carpeta `backend`
   - Abrir como proyecto Maven

2. **Configurar JDK:**
   - File → Project Structure
   - Project SDK: Java 17 o superior

3. **Ejecutar la aplicación:**
   - Buscar `InventarioBackendApplication.java`
   - Click derecho → Run
   - O usar Maven: `mvn spring-boot:run`

4. **Acceder a la aplicación:**
   - URL: http://localhost:8080
   - Base de datos H2: http://localhost:8080/h2-console

### 10. Estructura de URLs

- `/` - Página principal del sistema
- `/almacenes` - Gestión de almacenes
- `/transacciones` - Registro de transacciones
- `/kardex` - Consulta de kardex
- `/catalogo-productos` - Catálogo de productos
- `/linea-producto` - Líneas y familias de productos

### 11. Características Implementadas

- ✅ Configuración completa de Spring Boot
- ✅ Integración con Thymeleaf
- ✅ Controladores MVC para todas las páginas
- ✅ Modelos de datos con JPA
- ✅ Servicios de negocio
- ✅ Base de datos H2 en memoria
- ✅ Plantillas HTML responsivas
- ✅ Navegación funcional entre módulos
- ✅ Diseño mantenido del frontend original

Este proyecto está listo para desarrollo y puede ser extendido con más funcionalidades según los requerimientos del curso.
