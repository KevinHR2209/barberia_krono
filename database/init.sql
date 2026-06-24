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
    direccion VARCHAR(300),
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
    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
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

-- Índices
CREATE INDEX idx_citas_barbero_fecha ON citas(barbero_id, fecha);
CREATE INDEX idx_citas_cliente ON citas(cliente_id);
CREATE INDEX idx_horarios_barbero ON horarios_barbero(barbero_id);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Sillas
INSERT INTO sillas (id, numero, descripcion) VALUES
    ('11111111-1111-1111-1111-111111111111', 1, 'Silla principal junto a la ventana'),
    ('22222222-2222-2222-2222-222222222222', 2, 'Silla central del local'),
    ('33333333-3333-3333-3333-333333333333', 3, 'Silla del fondo');

-- Barberos (uno por silla)
INSERT INTO barberos (id, nombre, apellido, email, telefono, silla_id) VALUES
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Matías', 'González', 'matias@kronobarberia.cl', '+56912345678', '11111111-1111-1111-1111-111111111111'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sebastián', 'Rojas', 'sebastian@kronobarberia.cl', '+56923456789', '22222222-2222-2222-2222-222222222222'),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Nicolás', 'Muñoz', 'nicolas@kronobarberia.cl', '+56934567890', '33333333-3333-3333-3333-333333333333');

-- Horarios de cada barbero (Lunes a Sábado, 09:00 - 19:00)
INSERT INTO horarios_barbero (barbero_id, dia_semana, hora_inicio, hora_fin) VALUES
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0, '09:00', '19:00'),
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '09:00', '19:00'),
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '09:00', '19:00'),
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, '09:00', '19:00'),
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, '09:00', '19:00'),
    ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, '09:00', '19:00'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0, '09:00', '19:00'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '09:00', '19:00'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '09:00', '19:00'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, '09:00', '19:00'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, '09:00', '19:00'),
    ('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, '09:00', '19:00'),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0, '09:00', '19:00'),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, '09:00', '19:00'),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, '09:00', '19:00'),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, '09:00', '19:00'),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, '09:00', '19:00'),
    ('aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, '09:00', '19:00');

-- 10 Servicios
INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio) VALUES
    ('Corte clásico', 'Corte de cabello clásico con tijera y máquina', 30, 8000),
    ('Corte + barba', 'Corte de cabello más arreglo de barba completo', 50, 14000),
    ('Arreglo de barba', 'Perfilado y arreglo de barba con navaja', 25, 7000),
    ('Corte infantil', 'Corte de cabello para niños menores de 12 años', 20, 6000),
    ('Corte degradado', 'Fade completo con degradado a máquina', 40, 10000),
    ('Corte + degradado + barba', 'Servicio completo: corte con fade y arreglo de barba', 70, 18000),
    ('Afeitado con navaja', 'Afeitado tradicional con navaja y toalla caliente', 35, 9000),
    ('Tratamiento capilar', 'Hidratación y tratamiento nutritivo para el cabello', 45, 12000),
    ('Tinte o decoloración', 'Coloración o decoloración según requerimiento del cliente', 90, 22000),
    ('Cejas', 'Depilación y diseño de cejas con hilo o pinza', 15, 4000);
