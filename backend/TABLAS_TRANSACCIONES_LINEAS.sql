-- Script para crear las tablas transacciones y lineas_producto
-- Alineadas con las entidades Java

-- Tabla transacciones
CREATE TABLE IF NOT EXISTS transacciones (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA', 'TRANSFERENCIA', 'AJUSTE')),
    producto VARCHAR(255),
    almacen VARCHAR(255),
    cantidad INTEGER NOT NULL,
    usuario VARCHAR(255),
    observaciones TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA' CHECK (estado IN ('PENDIENTE', 'COMPLETADA', 'CANCELADA')),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para transacciones
CREATE INDEX IF NOT EXISTS idx_transacciones_codigo ON transacciones(codigo);
CREATE INDEX IF NOT EXISTS idx_transacciones_tipo ON transacciones(tipo);
CREATE INDEX IF NOT EXISTS idx_transacciones_fecha ON transacciones(fecha);
CREATE INDEX IF NOT EXISTS idx_transacciones_estado ON transacciones(estado);

-- Tabla lineas_producto
CREATE TABLE IF NOT EXISTS lineas_producto (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    familia VARCHAR(100),
    categoria VARCHAR(100),
    productos INTEGER DEFAULT 0,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA' CHECK (estado IN ('ACTIVA', 'INACTIVA')),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para lineas_producto
CREATE INDEX IF NOT EXISTS idx_lineas_producto_codigo ON lineas_producto(codigo);
CREATE INDEX IF NOT EXISTS idx_lineas_producto_nombre ON lineas_producto(nombre);
CREATE INDEX IF NOT EXISTS idx_lineas_producto_estado ON lineas_producto(estado);

-- Comentarios
COMMENT ON TABLE transacciones IS 'Tabla de transacciones de inventario (entradas, salidas, transferencias, ajustes)';
COMMENT ON TABLE lineas_producto IS 'Tabla de líneas de productos para categorización';
