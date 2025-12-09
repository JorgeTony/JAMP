# 🚀 Instrucciones para Conectar PostgreSQL

## 📋 **Pasos para Configurar la Base de Datos**

### **1. Instalar PostgreSQL**
- Descargar desde: https://www.postgresql.org/download/
- Instalar con usuario `postgres` y contraseña `postgres`
- Puerto por defecto: `5432`

### **2. Crear la Base de Datos**
```sql
-- Conectarse a PostgreSQL como usuario postgres
CREATE DATABASE inventario_hospital;
```

### **3. Ejecutar Scripts de Tablas**
```sql
-- Conectarse a la base de datos inventario_hospital
\c inventario_hospital;

-- Crear tabla almacenes
CREATE TABLE almacenes (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255),
    responsable VARCHAR(255),
    capacidad VARCHAR(100),
    ocupacion VARCHAR(100),
    porcentaje_ocupacion INTEGER,
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    productos INTEGER DEFAULT 0,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla productos
CREATE TABLE productos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    unidad_medida VARCHAR(50),
    precio DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 0,
    ubicacion VARCHAR(255),
    proveedor VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'ACTIVO',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla transacciones
CREATE TABLE transacciones (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    producto_id BIGINT REFERENCES productos(id),
    almacen_id BIGINT REFERENCES almacenes(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2),
    total DECIMAL(10,2),
    responsable VARCHAR(255),
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'COMPLETADA'
);

-- Crear tabla linea_producto
CREATE TABLE linea_producto (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'ACTIVA',
    productos_asociados INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **4. Insertar Datos de Prueba**
```sql
-- Insertar almacenes
INSERT INTO almacenes (codigo, nombre, ubicacion, responsable, capacidad, ocupacion, porcentaje_ocupacion, productos) VALUES
('ALM001', 'Almacén Central', 'Planta Baja - Sector A', 'Dr. Carlos Mendoza', '1000 m²', '750 m²', 75, 245),
('ALM002', 'Farmacia Principal', 'Primer Piso - Ala Norte', 'Dra. Ana López', '500 m²', '380 m²', 76, 189),
('ALM003', 'Quirófano Storage', 'Segundo Piso - Zona Estéril', 'Enf. María García', '300 m²', '210 m²', 70, 156),
('ALM004', 'Emergencias', 'Planta Baja - Urgencias', 'Dr. Luis Rodríguez', '200 m²', '160 m²', 80, 98),
('ALM005', 'UCI Storage', 'Tercer Piso - Cuidados Intensivos', 'Dra. Carmen Silva', '150 m²', '120 m²', 80, 87);

-- Insertar productos
INSERT INTO productos (codigo, nombre, descripcion, categoria, unidad_medida, precio, stock, stock_minimo, ubicacion, proveedor) VALUES
('MED001', 'Paracetamol 500mg', 'Analgésico y antipirético', 'Medicamentos', 'Tabletas', 0.25, 5000, 1000, 'ALM002-A1', 'Laboratorios Bayer'),
('MED002', 'Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', 'Medicamentos', 'Cápsulas', 0.35, 3200, 800, 'ALM002-A2', 'Pfizer'),
('MED003', 'Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'Antibióticos', 'Cápsulas', 1.20, 2500, 500, 'ALM002-B1', 'GlaxoSmithKline'),
('SUP001', 'Jeringas 10ml', 'Jeringas desechables estériles', 'Suministros', 'Unidades', 0.15, 10000, 2000, 'ALM001-C1', 'BD Medical'),
('SUP002', 'Guantes Nitrilo Talla M', 'Guantes de examinación sin polvo', 'Suministros', 'Cajas', 12.50, 500, 100, 'ALM001-C2', 'Ansell'),
('EQU001', 'Tensiómetro Digital', 'Monitor de presión arterial automático', 'Equipos', 'Unidades', 85.00, 25, 5, 'ALM003-D1', 'Omron Healthcare'),
('EQU002', 'Termómetro Infrarrojo', 'Termómetro sin contacto', 'Equipos', 'Unidades', 45.00, 40, 10, 'ALM004-E1', 'Braun'),
('MED004', 'Insulina Glargina', 'Insulina de acción prolongada', 'Medicamentos', 'Viales', 25.00, 150, 30, 'ALM002-F1', 'Sanofi'),
('SUP003', 'Gasas Estériles 10x10cm', 'Gasas para curaciones', 'Suministros', 'Paquetes', 2.50, 800, 150, 'ALM001-G1', 'Johnson & Johnson'),
('MED005', 'Morfina 10mg/ml', 'Analgésico opioide', 'Medicamentos Controlados', 'Ampollas', 8.50, 200, 50, 'ALM002-H1', 'Mundipharma');
```

### **5. Configurar Aplicación Spring Boot**
- ✅ **application.properties** ya configurado
- ✅ **Dependencia PostgreSQL** agregada al pom.xml
- ✅ **Repositorios JPA** creados
- ✅ **Servicios** actualizados
- ✅ **Controladores REST** implementados
- ✅ **CORS** configurado para React

### **6. Ejecutar la Aplicación**
```bash
# En la carpeta backend
mvn clean install
mvn spring-boot:run
```

### **7. URLs de la Aplicación**
- **Backend Spring Boot**: http://localhost:8080
- **API REST Almacenes**: http://localhost:8080/almacenes/api
- **Frontend React**: http://localhost:5173

## 🔧 **Configuración de Conexión**

### **application.properties**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/inventario_hospital
spring.datasource.username=postgres
spring.datasource.password=postgres
```

### **Cambiar Contraseña (si es necesario)**
Si tu PostgreSQL tiene una contraseña diferente, modifica el archivo:
`backend/src/main/resources/application.properties`

## ✅ **Verificar Conexión**
1. Ejecutar Spring Boot
2. Ver logs: "HikariPool-1 - Start completed"
3. Probar API: http://localhost:8080/almacenes/api
4. Verificar datos en PostgreSQL

## 🚨 **Solución de Problemas**

### **Error de Conexión**
- Verificar que PostgreSQL esté ejecutándose
- Confirmar puerto 5432
- Verificar usuario y contraseña
- Crear la base de datos si no existe

### **Error de Dependencias**
```bash
mvn clean install -U
```

### **Error CORS**
- Verificar que CorsConfig.java esté configurado
- Confirmar puertos del frontend (5173 o 3000)

¡Ahora tu sistema está completamente conectado a PostgreSQL y cada cambio se guardará automáticamente en la base de datos!