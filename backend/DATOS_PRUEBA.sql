-- =====================================================
-- DATOS DE PRUEBA PARA SISTEMA DE INVENTARIO HOSPITALARIO
-- ALINEADOS CON LAS ENTIDADES Usuario.java y Producto.java
-- =====================================================

-- 1. INSERTAR USUARIOS (ALINEADO CON Usuario.java)
-- Password: password123 (encriptado con BCrypt)
INSERT INTO usuarios (email, password, nombre, apellidos, rol, departamento, telefono, estado) VALUES
-- ADMINISTRADORES
('carlos.mendoza@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'Carlos', 'Mendoza', 'ADMIN', 'Administración de Inventario', '987654321', 'ACTIVO'),
('maria.garcia@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'María', 'García', 'ADMIN', 'Administración General', '987654322', 'ACTIVO'),

-- SUPERVISORES
('jose.rodriguez@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'José', 'Rodríguez', 'SUPERVISOR', 'Supervisión de Almacén', '987654323', 'ACTIVO'),
('ana.lopez@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'Ana', 'López', 'SUPERVISOR', 'Supervisión de Farmacia', '987654324', 'ACTIVO'),
('pedro.martinez@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'Pedro', 'Martínez', 'SUPERVISOR', 'Supervisión de Compras', '987654325', 'ACTIVO'),

-- OPERADORES
('laura.sanchez@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'Laura', 'Sánchez', 'OPERADOR', 'Operaciones de Almacén', '987654326', 'ACTIVO'),
('roberto.torres@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'Roberto', 'Torres', 'OPERADOR', 'Operaciones de Farmacia', '987654327', 'ACTIVO'),
('carmen.flores@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'Carmen', 'Flores', 'OPERADOR', 'Operaciones de Recepción', '987654328', 'ACTIVO'),
('luis.vargas@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'Luis', 'Vargas', 'OPERADOR', 'Operaciones de Distribución', '987654329', 'ACTIVO'),
('patricia.morales@hospital.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIX3arjLO.5e0zXXXXXXXXXXXXXXXXXXX', 'Patricia', 'Morales', 'OPERADOR', 'Operaciones de Inventario', '987654330', 'ACTIVO')
ON CONFLICT (email) DO NOTHING;

-- 2. INSERTAR ALMACENES
INSERT INTO almacenes (codigo, nombre, ubicacion, responsable, capacidad, ocupacion, porcentaje_ocupacion, productos, estado) VALUES
('ALM001', 'Almacén Central', 'Sótano - Bloque A', 'Pedro Martínez', '1000 m³', '650 m³', 65, 0, 'ACTIVO'),
('ALM002', 'Farmacia Principal', 'Primer Piso - Ala Norte', 'María García', '200 m³', '120 m³', 60, 0, 'ACTIVO'),
('ALM003', 'Almacén Quirúrgico', 'Segundo Piso - Ala Sur', 'Carlos Mendoza', '150 m³', '90 m³', 60, 0, 'ACTIVO'),
('ALM004', 'Almacén UCI', 'Tercer Piso - Ala Este', 'Laura Sánchez', '100 m³', '75 m³', 75, 0, 'ACTIVO'),
('ALM005', 'Almacén Emergencias', 'Primer Piso - Ala Oeste', 'Roberto Torres', '80 m³', '60 m³', 75, 0, 'ACTIVO')
ON CONFLICT (codigo) DO NOTHING;

-- 3. INSERTAR PRODUCTOS (ALINEADO CON Producto.java)
INSERT INTO productos (codigo, nombre, descripcion, categoria, precio, stock, stock_minimo, estado) VALUES
-- Medicamentos - Analgésicos
('MED001', 'Paracetamol 500mg', 'Tabletas analgésicas y antipiréticas', 'Medicamentos', 0.15, 5000, 500, 'ACTIVO'),
('MED002', 'Ibuprofeno 400mg', 'Tabletas antiinflamatorias y analgésicas', 'Medicamentos', 0.25, 3000, 300, 'ACTIVO'),
('MED003', 'Diclofenaco 75mg/3ml', 'Ampolla intramuscular analgésica', 'Medicamentos', 2.50, 800, 100, 'ACTIVO'),
('MED004', 'Tramadol 50mg', 'Cápsulas analgésicas opioides', 'Medicamentos', 1.20, 1200, 150, 'ACTIVO'),

-- Medicamentos - Antibióticos
('MED005', 'Amoxicilina 500mg', 'Cápsulas antibióticas betalactámicas', 'Medicamentos', 0.80, 2500, 250, 'ACTIVO'),
('MED006', 'Ciprofloxacino 500mg', 'Tabletas antibióticas quinolonas', 'Medicamentos', 1.50, 1800, 200, 'ACTIVO'),
('MED007', 'Ceftriaxona 1g', 'Vial antibiótico cefalosporina', 'Medicamentos', 8.50, 600, 80, 'ACTIVO'),
('MED008', 'Azitromicina 500mg', 'Tabletas antibióticas macrólidos', 'Medicamentos', 2.20, 1000, 120, 'ACTIVO'),

-- Medicamentos - Cardiovasculares
('MED009', 'Enalapril 10mg', 'Tabletas antihipertensivas IECA', 'Medicamentos', 0.45, 2200, 250, 'ACTIVO'),
('MED010', 'Atenolol 50mg', 'Tabletas betabloqueantes', 'Medicamentos', 0.35, 1800, 200, 'ACTIVO'),
('MED011', 'Furosemida 40mg', 'Tabletas diuréticas', 'Medicamentos', 0.30, 1500, 180, 'ACTIVO'),
('MED012', 'Digoxina 0.25mg', 'Tabletas cardiotónicas', 'Medicamentos', 0.60, 800, 100, 'ACTIVO'),

-- Material Médico
('MAT001', 'Jeringa 5ml', 'Jeringa desechable estéril', 'Material Médico', 0.80, 10000, 1000, 'ACTIVO'),
('MAT002', 'Jeringa 10ml', 'Jeringa desechable estéril', 'Material Médico', 1.20, 8000, 800, 'ACTIVO'),
('MAT003', 'Aguja 21G x 1.5"', 'Aguja hipodérmica estéril', 'Material Médico', 0.15, 15000, 1500, 'ACTIVO'),
('MAT004', 'Catéter venoso 18G', 'Catéter intravenoso periférico', 'Material Médico', 3.50, 2000, 200, 'ACTIVO'),
('MAT005', 'Sonda Foley 16Fr', 'Sonda uretral de silicona', 'Material Médico', 12.00, 500, 50, 'ACTIVO'),

-- Insumos Quirúrgicos
('QUI001', 'Guantes Quirúrgicos Talla 7', 'Guantes estériles de látex', 'Insumos Quirúrgicos', 2.50, 5000, 500, 'ACTIVO'),
('QUI002', 'Mascarilla Quirúrgica', 'Mascarilla desechable 3 capas', 'Insumos Quirúrgicos', 0.80, 8000, 800, 'ACTIVO'),
('QUI003', 'Gasa Estéril 10x10cm', 'Gasa estéril para curaciones', 'Insumos Quirúrgicos', 1.20, 3000, 300, 'ACTIVO'),
('QUI004', 'Sutura Seda 3-0', 'Hilo de sutura no absorbible', 'Insumos Quirúrgicos', 8.50, 800, 80, 'ACTIVO'),
('QUI005', 'Bisturí Desechable N°15', 'Hoja de bisturí estéril', 'Insumos Quirúrgicos', 1.80, 2000, 200, 'ACTIVO'),

-- Equipos de Protección
('EPP001', 'Mascarilla N95', 'Respirador de alta eficiencia', 'Equipos de Protección', 8.50, 2000, 200, 'ACTIVO'),
('EPP002', 'Bata Quirúrgica Desechable', 'Bata estéril impermeable', 'Equipos de Protección', 15.00, 1000, 100, 'ACTIVO'),
('EPP003', 'Gorro Quirúrgico', 'Gorro desechable no tejido', 'Equipos de Protección', 0.50, 5000, 500, 'ACTIVO'),
('EPP004', 'Protector Facial', 'Careta de protección facial', 'Equipos de Protección', 12.00, 800, 80, 'ACTIVO'),

-- Reactivos de Laboratorio
('LAB001', 'Suero Fisiológico 1000ml', 'Solución salina estéril', 'Reactivos de Laboratorio', 8.50, 1500, 150, 'ACTIVO'),
('LAB002', 'Alcohol Etílico 96°', 'Alcohol para desinfección', 'Reactivos de Laboratorio', 12.00, 500, 50, 'ACTIVO'),
('LAB003', 'Agua Destilada 1000ml', 'Agua purificada para laboratorio', 'Reactivos de Laboratorio', 3.50, 800, 80, 'ACTIVO'),
('LAB004', 'Reactivo Glucosa', 'Kit para determinación de glucosa', 'Reactivos de Laboratorio', 45.00, 200, 20, 'ACTIVO')
ON CONFLICT (codigo) DO NOTHING;

-- 4. INSERTAR PROVEEDORES
INSERT INTO proveedores (codigo, nombre, razon_social, ruc, contacto, telefono, email, direccion, ciudad, calificacion, estado) VALUES
('PROV001', 'Droguería San Martín', 'Droguería San Martín S.A.C.', '20123456789', 'Juan Pérez', '01-2345678', 'ventas@sanmartin.com', 'Av. Brasil 1234', 'Lima', 4.5, 'ACTIVO'),
('PROV002', 'Laboratorios Bayer', 'Bayer S.A.', '20234567890', 'María González', '01-3456789', 'pedidos@bayer.com.pe', 'Av. Javier Prado 2345', 'Lima', 4.8, 'ACTIVO'),
('PROV003', 'Química Suiza', 'Química Suiza S.A.', '20345678901', 'Carlos Ruiz', '01-4567890', 'comercial@quimicasuiza.com', 'Av. Argentina 3456', 'Lima', 4.3, 'ACTIVO'),
('PROV004', 'Medifarma', 'Medifarma S.A.', '20456789012', 'Ana Torres', '01-5678901', 'ventas@medifarma.com.pe', 'Av. Colonial 4567', 'Lima', 4.6, 'ACTIVO'),
('PROV005', 'Inkafarma Distribución', 'Inkafarma S.A.', '20567890123', 'Luis Vargas', '01-6789012', 'distribucion@inkafarma.pe', 'Av. Universitaria 5678', 'Lima', 4.4, 'ACTIVO')
ON CONFLICT (codigo) DO NOTHING;

-- 5. INSERTAR CATEGORÍAS
INSERT INTO categorias (codigo, nombre, descripcion, nivel, icono, color, orden_visualizacion, estado) VALUES
('CAT001', 'Medicamentos', 'Productos farmacéuticos para tratamiento médico', 1, 'ri-capsule-line', '#EF4444', 1, 'ACTIVA'),
('CAT002', 'Material Médico', 'Instrumental y equipos médicos', 1, 'ri-stethoscope-line', '#3B82F6', 2, 'ACTIVA'),
('CAT003', 'Insumos Quirúrgicos', 'Material para procedimientos quirúrgicos', 1, 'ri-surgical-mask-line', '#10B981', 3, 'ACTIVA'),
('CAT004', 'Equipos de Protección', 'EPP para personal médico', 1, 'ri-shield-line', '#F59E0B', 4, 'ACTIVA'),
('CAT005', 'Reactivos de Laboratorio', 'Químicos para análisis clínicos', 1, 'ri-test-tube-line', '#8B5CF6', 5, 'ACTIVA')
ON CONFLICT (codigo) DO NOTHING;

-- 6. INSERTAR TRANSACCIONES
INSERT INTO transacciones (codigo, tipo, fecha, producto_id, almacen_id, cantidad, precio_unitario, total, responsable, observaciones, estado) VALUES
('TXN001', 'ENTRADA', '2024-01-15 08:30:00', 1, 2, 5000, 0.15, 750.00, 'Ana López', 'Recepción de orden OC-2024-001', 'COMPLETADA'),
('TXN002', 'ENTRADA', '2024-01-15 09:00:00', 2, 2, 3000, 0.25, 750.00, 'Ana López', 'Recepción de orden OC-2024-001', 'COMPLETADA'),
('TXN003', 'SALIDA', '2024-01-16 14:30:00', 1, 2, 500, 0.15, 75.00, 'Laura Sánchez', 'Dispensación a almacén central', 'COMPLETADA'),
('TXN004', 'SALIDA', '2024-01-17 10:15:00', 2, 2, 300, 0.25, 75.00, 'Roberto Torres', 'Dispensación desde farmacia', 'COMPLETADA'),
('TXN005', 'ENTRADA', '2024-01-18 11:00:00', 7, 2, 600, 8.50, 5100.00, 'Ana López', 'Recepción de orden OC-2024-002', 'COMPLETADA')
ON CONFLICT (codigo) DO NOTHING;

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Verificar datos insertados
SELECT 'Usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'Productos', COUNT(*) FROM productos
UNION ALL
SELECT 'Almacenes', COUNT(*) FROM almacenes
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM proveedores
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL
SELECT 'Transacciones', COUNT(*) FROM transacciones;
