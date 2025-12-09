-- =====================================================
-- TABLAS ADICIONALES PARA SISTEMA DE INVENTARIO HOSPITALARIO
-- =====================================================

-- 1. TABLA: usuarios (ALINEADA CON LA ENTIDAD Usuario.java)
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('ADMIN', 'SUPERVISOR', 'OPERADOR')),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    telefono VARCHAR(20),
    departamento VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- 2. TABLA: productos (ALINEADA CON LA ENTIDAD Producto.java)
CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500),
    categoria VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    stock_minimo INTEGER NOT NULL CHECK (stock_minimo >= 0),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'DESCONTINUADO')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: almacenes
CREATE TABLE IF NOT EXISTS almacenes (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255),
    responsable VARCHAR(255),
    capacidad VARCHAR(50),
    ocupacion VARCHAR(50),
    porcentaje_ocupacion INTEGER DEFAULT 0 CHECK (porcentaje_ocupacion >= 0 AND porcentaje_ocupacion <= 100),
    productos INTEGER DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'MANTENIMIENTO')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: transacciones
CREATE TABLE IF NOT EXISTS transacciones (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA', 'AJUSTE', 'TRANSFERENCIA')),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    producto_id BIGINT REFERENCES productos(id),
    almacen_id BIGINT REFERENCES almacenes(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2),
    total DECIMAL(12,2),
    responsable VARCHAR(255),
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'COMPLETADA' CHECK (estado IN ('PENDIENTE', 'COMPLETADA', 'CANCELADA'))
);

-- 5. TABLA: proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    razon_social VARCHAR(255),
    ruc VARCHAR(20) UNIQUE,
    contacto VARCHAR(255),
    telefono VARCHAR(50),
    email VARCHAR(255),
    direccion TEXT,
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Perú',
    sitio_web VARCHAR(255),
    calificacion DECIMAL(3,2) DEFAULT 0.00,
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO')),
    productos_suministrados INTEGER DEFAULT 0,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: categorias
CREATE TABLE IF NOT EXISTS categorias (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria_padre_id BIGINT REFERENCES categorias(id),
    nivel INTEGER DEFAULT 1,
    icono VARCHAR(100),
    color VARCHAR(7) DEFAULT '#6B7280',
    estado VARCHAR(20) DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'INACTIVA')),
    productos_count INTEGER DEFAULT 0,
    orden_visualizacion INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: ordenes_compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id BIGSERIAL PRIMARY KEY,
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    proveedor_id BIGINT REFERENCES proveedores(id) NOT NULL,
    usuario_solicitante_id BIGINT REFERENCES usuarios(id),
    fecha_orden TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega_esperada DATE,
    fecha_entrega_real DATE,
    estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADA', 'ENVIADA', 'RECIBIDA_PARCIAL', 'RECIBIDA_COMPLETA', 'CANCELADA')),
    prioridad VARCHAR(20) DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
    subtotal DECIMAL(12,2) DEFAULT 0.00,
    impuestos DECIMAL(12,2) DEFAULT 0.00,
    descuento DECIMAL(12,2) DEFAULT 0.00,
    total DECIMAL(12,2) DEFAULT 0.00,
    moneda VARCHAR(3) DEFAULT 'PEN',
    responsable VARCHAR(255),
    observaciones TEXT,
    aprobado_por VARCHAR(255),
    fecha_aprobacion TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA: detalle_orden_compra
CREATE TABLE IF NOT EXISTS detalle_orden_compra (
    id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos(id),
    cantidad_solicitada INTEGER NOT NULL CHECK (cantidad_solicitada > 0),
    cantidad_recibida INTEGER DEFAULT 0 CHECK (cantidad_recibida >= 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0.00,
    subtotal DECIMAL(12,2),
    fecha_vencimiento DATE,
    lote VARCHAR(100),
    observaciones TEXT
);

-- 9. TABLA: requerimientos
CREATE TABLE IF NOT EXISTS requerimientos (
    id BIGSERIAL PRIMARY KEY,
    numero_requerimiento VARCHAR(50) UNIQUE NOT NULL,
    departamento_solicitante VARCHAR(100) NOT NULL,
    usuario_solicitante_id BIGINT REFERENCES usuarios(id),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_necesaria DATE NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
    estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'PROCESANDO', 'COMPLETADO', 'RECHAZADO', 'CANCELADO')),
    tipo_requerimiento VARCHAR(50) DEFAULT 'NORMAL' CHECK (tipo_requerimiento IN ('NORMAL', 'EMERGENCIA', 'PROGRAMADO')),
    justificacion TEXT NOT NULL,
    observaciones TEXT,
    aprobado_por_id BIGINT REFERENCES usuarios(id),
    fecha_aprobacion TIMESTAMP,
    motivo_rechazo TEXT,
    total_estimado DECIMAL(12,2) DEFAULT 0.00
);

-- 10. TABLA: detalle_requerimiento
CREATE TABLE IF NOT EXISTS detalle_requerimiento (
    id BIGSERIAL PRIMARY KEY,
    requerimiento_id BIGINT REFERENCES requerimientos(id) ON DELETE CASCADE,
    producto_id BIGINT REFERENCES productos(id),
    cantidad_solicitada INTEGER NOT NULL CHECK (cantidad_solicitada > 0),
    cantidad_aprobada INTEGER DEFAULT 0 CHECK (cantidad_aprobada >= 0),
    cantidad_entregada INTEGER DEFAULT 0 CHECK (cantidad_entregada >= 0),
    precio_estimado DECIMAL(10,2),
    justificacion TEXT,
    observaciones TEXT,
    estado VARCHAR(30) DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'ENTREGADO'))
);

-- 11. TABLA: kardex
CREATE TABLE IF NOT EXISTS kardex (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT REFERENCES productos(id) NOT NULL,
    almacen_id BIGINT REFERENCES almacenes(id) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_movimiento VARCHAR(30) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE_POSITIVO', 'AJUSTE_NEGATIVO', 'TRANSFERENCIA_ENTRADA', 'TRANSFERENCIA_SALIDA', 'DEVOLUCION', 'VENCIMIENTO')),
    documento_referencia VARCHAR(100),
    numero_documento VARCHAR(50),
    cantidad_entrada INTEGER DEFAULT 0 CHECK (cantidad_entrada >= 0),
    cantidad_salida INTEGER DEFAULT 0 CHECK (cantidad_salida >= 0),
    stock_anterior INTEGER NOT NULL CHECK (stock_anterior >= 0),
    stock_actual INTEGER NOT NULL CHECK (stock_actual >= 0),
    precio_unitario DECIMAL(10,2),
    costo_total DECIMAL(12,2),
    lote VARCHAR(100),
    fecha_vencimiento DATE,
    responsable_id BIGINT REFERENCES usuarios(id),
    observaciones TEXT,
    almacen_destino_id BIGINT REFERENCES almacenes(id)
);

-- 12. TABLA: alertas
CREATE TABLE IF NOT EXISTS alertas (
    id BIGSERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('STOCK_BAJO', 'STOCK_CRITICO', 'VENCIMIENTO_PROXIMO', 'VENCIMIENTO_CRITICO', 'REORDEN_AUTOMATICO', 'PRODUCTO_INACTIVO', 'ORDEN_VENCIDA')),
    producto_id BIGINT REFERENCES productos(id),
    almacen_id BIGINT REFERENCES almacenes(id),
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    nivel VARCHAR(20) DEFAULT 'INFO' CHECK (nivel IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_leida TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'LEIDA', 'RESUELTA', 'ARCHIVADA')),
    usuario_asignado_id BIGINT REFERENCES usuarios(id),
    accion_requerida VARCHAR(255),
    parametros_adicionales JSONB
);

-- 13. TABLA: lotes
CREATE TABLE IF NOT EXISTS lotes (
    id BIGSERIAL PRIMARY KEY,
    codigo_lote VARCHAR(100) NOT NULL,
    producto_id BIGINT REFERENCES productos(id) NOT NULL,
    proveedor_id BIGINT REFERENCES proveedores(id),
    fecha_fabricacion DATE,
    fecha_vencimiento DATE NOT NULL,
    cantidad_inicial INTEGER NOT NULL CHECK (cantidad_inicial > 0),
    cantidad_actual INTEGER NOT NULL CHECK (cantidad_actual >= 0),
    precio_compra DECIMAL(10,2),
    numero_factura VARCHAR(100),
    certificado_calidad VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'VENCIDO', 'RETIRADO', 'CUARENTENA')),
    observaciones TEXT,
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(codigo_lote, producto_id)
);

-- 14. TABLA: auditoria
CREATE TABLE IF NOT EXISTS auditoria (
    id BIGSERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(100) NOT NULL,
    registro_id BIGINT NOT NULL,
    operacion VARCHAR(20) NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    usuario_id BIGINT REFERENCES usuarios(id),
    fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    campos_modificados TEXT[],
    observaciones TEXT
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- =====================================================

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_estado ON productos(estado);

-- Índices para almacenes
CREATE INDEX IF NOT EXISTS idx_almacenes_codigo ON almacenes(codigo);
CREATE INDEX IF NOT EXISTS idx_almacenes_estado ON almacenes(estado);

-- Índices para transacciones
CREATE INDEX IF NOT EXISTS idx_transacciones_producto ON transacciones(producto_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_almacen ON transacciones(almacen_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha);

-- Índices para proveedores
CREATE INDEX IF NOT EXISTS idx_proveedores_estado ON proveedores(estado);
CREATE INDEX IF NOT EXISTS idx_proveedores_ciudad ON proveedores(ciudad);

-- Índices para categorías
CREATE INDEX IF NOT EXISTS idx_categorias_padre ON categorias(categoria_padre_id);
CREATE INDEX IF NOT EXISTS idx_categorias_estado ON categorias(estado);

-- Índices para órdenes de compra
CREATE INDEX IF NOT EXISTS idx_ordenes_proveedor ON ordenes_compra(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_compra(estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes_compra(fecha_orden);

-- Índices para requerimientos
CREATE INDEX IF NOT EXISTS idx_requerimientos_usuario ON requerimientos(usuario_solicitante_id);
CREATE INDEX IF NOT EXISTS idx_requerimientos_estado ON requerimientos(estado);
CREATE INDEX IF NOT EXISTS idx_requerimientos_fecha ON requerimientos(fecha_solicitud);

-- Índices para kardex
CREATE INDEX IF NOT EXISTS idx_kardex_producto ON kardex(producto_id);
CREATE INDEX IF NOT EXISTS idx_kardex_almacen ON kardex(almacen_id);
CREATE INDEX IF NOT EXISTS idx_kardex_fecha ON kardex(fecha);
CREATE INDEX IF NOT EXISTS idx_kardex_tipo ON kardex(tipo_movimiento);

-- Índices para alertas
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas(estado);
CREATE INDEX IF NOT EXISTS idx_alertas_fecha ON alertas(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_alertas_usuario ON alertas(usuario_asignado_id);

-- Índices para lotes
CREATE INDEX IF NOT EXISTS idx_lotes_producto ON lotes(producto_id);
CREATE INDEX IF NOT EXISTS idx_lotes_vencimiento ON lotes(fecha_vencimiento);
CREATE INDEX IF NOT EXISTS idx_lotes_estado ON lotes(estado);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla_afectada);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha_operacion);

-- =====================================================
-- TRIGGERS PARA AUTOMATIZACIÓN
-- =====================================================

-- Trigger para actualizar fecha de modificación
CREATE OR REPLACE FUNCTION update_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas relevantes
DROP TRIGGER IF EXISTS trigger_usuarios_update ON usuarios;
CREATE TRIGGER trigger_usuarios_update
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

DROP TRIGGER IF EXISTS trigger_productos_update ON productos;
CREATE TRIGGER trigger_productos_update
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

DROP TRIGGER IF EXISTS trigger_almacenes_update ON almacenes;
CREATE TRIGGER trigger_almacenes_update
    BEFORE UPDATE ON almacenes
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();

DROP TRIGGER IF EXISTS trigger_proveedores_update ON proveedores;
CREATE TRIGGER trigger_proveedores_update
    BEFORE UPDATE ON proveedores
    FOR EACH ROW
    EXECUTE FUNCTION update_fecha_actualizacion();
