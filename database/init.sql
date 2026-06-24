-- ============================================================
-- Barbería Krono - Script de inicialización de base de datos
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sillas
CREATE TABLE IF NOT EXISTS sillas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero INTEGER UNIQUE NOT NULL,
    descripcion VARCHAR(200),
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Barberos
CREATE TABLE IF NOT EXISTS barberos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    foto_url VARCHAR(300),
    silla_id UUID REFERENCES sillas(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Días de atención por barbero
CREATE TABLE IF NOT EXISTS horarios_barbero (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barbero_id UUID NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Lunes, 6=Domingo
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(barbero_id, dia_semana)
);

-- Tipos de servicios
CREATE TABLE IF NOT EXISTS servicios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    duracion_minutos INTEGER NOT NULL DEFAULT 30,
    precio NUMERIC(10, 2) NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Citas
CREATE TABLE IF NOT EXISTS citas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    barbero_id UUID NOT NULL REFERENCES barberos(id) ON DELETE CASCADE,
    servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
    silla_id UUID REFERENCES sillas(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'asignada' CHECK (estado IN ('asignada', 'completada', 'cancelada')),
    notas TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX idx_citas_barbero_fecha ON citas(barbero_id, fecha);
CREATE INDEX idx_citas_cliente ON citas(cliente_id);
CREATE INDEX idx_horarios_barbero ON horarios_barbero(barbero_id);

-- Datos de ejemplo
INSERT INTO sillas (numero, descripcion) VALUES
    (1, 'Silla principal junto a la ventana'),
    (2, 'Silla central'),
    (3, 'Silla del fondo');

INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio) VALUES
    ('Corte clásico', 'Corte de cabello clásico con tijera y máquina', 30, 8000),
    ('Corte + barba', 'Corte de cabello más arreglo de barba completo', 50, 14000),
    ('Arreglo de barba', 'Perfilado y arreglo de barba con navaja', 25, 7000),
    ('Corte infantil', 'Corte de cabello para niños menores de 12 años', 20, 6000),
    ('Corte degradado', 'Fade completo con degradado', 40, 10000);
