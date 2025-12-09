# 🚀 INSTRUCCIONES COMPLETAS PARA EJECUTAR EL PROYECTO

## 📋 **REQUISITOS PREVIOS**

### **1. Verificar PostgreSQL**
- PostgreSQL instalado y ejecutándose en puerto 5432
- Usuario: `postgres`
- Contraseña: `Admin1234`
- Base de datos: `inventario_hospital` creada

### **2. Verificar Java y Node.js**
- Java 17 o superior
- Node.js 16 o superior
- Maven instalado

## 🗄️ **CONFIGURACIÓN DE BASE DE DATOS**

### **1. Conectarse a PostgreSQL**
```bash
psql -U postgres -h localhost -p 5432
# Introducir contraseña: Admin1234
```

### **2. Crear Base de Datos (si no existe)**
```sql
CREATE DATABASE inventario_hospital;
\q
```

### **3. Conectarse a la Base de Datos**
```bash
psql -U postgres -h localhost -p 5432 -d inventario_hospital
```

### **4. Ejecutar Scripts SQL (EN ESTE ORDEN)**
```sql
-- Paso 1: Crear todas las tablas
\i backend/TABLAS_ADICIONALES.sql

-- Paso 2: Cargar todos los datos
\i backend/DATOS_PRUEBA.sql

-- Paso 3: Verificar datos
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM productos;
SELECT COUNT(*) FROM almacenes;
\q
```

## 🔧 **EJECUTAR EL PROYECTO**

### **OPCIÓN A: Ejecutar Backend y Frontend por Separado**

#### **1. Ejecutar Backend (Terminal 1)**
```bash
# Ir a la carpeta backend
cd backend

# Limpiar y compilar
mvn clean install

# Ejecutar Spring Boot
mvn spring-boot:run
```

**✅ Verificar Backend:**
- URL: http://localhost:8080
- API Test: http://localhost:8080/almacenes/api
- Deberías ver: JSON con datos de almacenes

#### **2. Ejecutar Frontend (Terminal 2)**
```bash
# Ir a la carpeta raíz del proyecto
# (donde está package.json)

# Instalar dependencias
npm install

# Ejecutar React
npm run dev
```

**✅ Verificar Frontend:**
- URL: http://localhost:5173
- Deberías ver: Página de login del sistema

### **OPCIÓN B: Usar Script Automático**

#### **1. Crear Script de Inicio (Windows)**
```batch
@echo off
echo Iniciando Inventarios JAMP...

echo.
echo [1/3] Iniciando Backend...
start cmd /k "cd backend && mvn spring-boot:run"

timeout /t 10 /nobreak

echo.
echo [2/3] Iniciando Frontend...
start cmd /k "npm run dev"

echo.
echo [3/3] Sistema iniciado correctamente!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
pause
```

#### **2. Crear Script de Inicio (Linux/Mac)**
```bash
#!/bin/bash
echo "Iniciando Inventarios JAMP..."

echo ""
echo "[1/3] Iniciando Backend..."
cd backend
gnome-terminal -- bash -c "mvn spring-boot:run; exec bash"
cd ..

sleep 10

echo ""
echo "[2/3] Iniciando Frontend..."
gnome-terminal -- bash -c "npm run dev; exec bash"

echo ""
echo "[3/3] Sistema iniciado correctamente!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
```

## 🔐 **CREDENCIALES DE ACCESO**

### **Usuarios de Prueba:**
```
ADMINISTRADOR:
- Email: carlos.mendoza@hospital.com
- Password: password123

OPERADOR:
- Email: laura.sanchez@hospital.com  
- Password: password123
```

## 📊 **VERIFICAR FUNCIONAMIENTO**

### **1. Verificar Backend**
```bash
# Test API Almacenes
curl http://localhost:8080/almacenes/api

# Test API Productos
curl http://localhost:8080/productos/api

# Test API Usuarios
curl http://localhost:8080/usuarios/api
```

### **2. Verificar Frontend**
1. Abrir: http://localhost:5173
2. Hacer login con credenciales
3. Navegar por las páginas del sistema
4. Verificar que los datos se cargan correctamente

## 🚨 **SOLUCIÓN DE PROBLEMAS**

### **Error de Conexión PostgreSQL**
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # Mac
services.msc  # Windows (buscar PostgreSQL)

# Reiniciar PostgreSQL si es necesario
sudo systemctl restart postgresql  # Linux
brew services restart postgresql  # Mac
```

### **Error Puerto 8080 Ocupado**
```bash
# Encontrar proceso que usa puerto 8080
netstat -ano | findstr :8080  # Windows
lsof -i :8080  # Linux/Mac

# Matar proceso (cambiar PID por el número real)
taskkill /PID <PID> /F  # Windows
kill -9 <PID>  # Linux/Mac
```

### **Error Puerto 5173 Ocupado**
```bash
# Cambiar puerto del frontend
npm run dev -- --port 3000
```

### **Error de Dependencias**
```bash
# Limpiar caché de Maven
mvn clean install -U

# Limpiar caché de npm
npm cache clean --force
rm -rf node_modules
npm install
```

### **Error CORS**
- Verificar que CorsConfig.java esté configurado
- Asegurar que el frontend esté en puerto 5173 o 3000

## 📁 **ESTRUCTURA COMPLETA DEL PROYECTO**

```
proyecto/
├── backend/                     # Spring Boot Backend
│   ├── src/main/java/...       # Código Java
│   ├── src/main/resources/     # application.properties
│   ├── pom.xml                 # Dependencias Maven
│   ├── TABLAS_ADICIONALES.sql  # Script de tablas
│   └── DATOS_PRUEBA.sql        # Script de datos
├── src/                        # React Frontend
│   ├── pages/                  # Páginas del sistema
│   ├── components/             # Componentes React
│   └── router/                 # Configuración de rutas
├── package.json                # Dependencias npm
└── INSTRUCCIONES_COMPLETAS.md  # Este archivo
```

## 🎯 **FLUJO DE TRABAJO COMPLETO**

1. **Base de datos**: PostgreSQL con datos cargados ✅
2. **Backend**: Spring Boot API REST funcionando ✅  
3. **Frontend**: React SPA con autenticación ✅
4. **Integración**: Frontend consume APIs del backend ✅

## 📱 **FUNCIONALIDADES DISPONIBLES**

- ✅ **Autenticación**: Login/logout con usuarios reales
- ✅ **Dashboard**: Métricas y estadísticas  
- ✅ **Productos**: CRUD completo de productos médicos
- ✅ **Almacenes**: Gestión de ubicaciones y stock
- ✅ **Inventario**: Control de existencias
- ✅ **Transacciones**: Registro de movimientos
- ✅ **Reportes**: Análisis y exportación
- ✅ **Usuarios**: Gestión de roles y permisos

¡Tu sistema de inventario hospitalario está completamente funcional! 🏥💊