-- Usuario y base de datos ya creados por variables de entorno de Docker
-- Solo insertamos datos semilla

-- Sillas
INSERT INTO sillas (numero, activa) VALUES
  (1, true),
  (2, true),
  (3, true)
ON CONFLICT DO NOTHING;

-- Barberos
INSERT INTO barberos (nombre, apellido, email, telefono, activo, silla_id) VALUES
  ('Matías',   'Rojas',   'matias.rojas@kronobarberia.cl',   '+56912345601', true, 1),
  ('Sebastián','Fuentes', 'sebastian.fuentes@kronobarberia.cl','+56912345602', true, 2),
  ('Nicolás',  'Herrera', 'nicolas.herrera@kronobarberia.cl', '+56912345603', true, 3)
ON CONFLICT (email) DO NOTHING;

-- Horarios (Lunes=0 a Sábado=5, 09:00 - 19:00) para cada barbero
DO $$
DECLARE
  b RECORD;
  dia INT;
BEGIN
  FOR b IN SELECT id FROM barberos LOOP
    FOR dia IN 0..5 LOOP
      INSERT INTO horarios_barbero (barbero_id, dia_semana, hora_inicio, hora_fin)
      VALUES (b.id, dia, '09:00:00', '19:00:00')
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Servicios
INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio, activo) VALUES
  ('Corte Clásico',          'Corte de cabello clásico con tijera y máquina, acabado prolijo.',           30, 8000,  true),
  ('Corte + Barba',          'Combo completo: corte de cabello y arreglo de barba con navaja.',           50, 13000, true),
  ('Arreglo de Barba',       'Perfilado y arreglo de barba con navaja caliente y toalla.',               25, 6000,  true),
  ('Afeitado Clásico',       'Afeitado tradicional con navaja, espuma caliente y toalla húmeda.',        30, 7000,  true),
  ('Corte Degradado',        'Fade o degradado a máquina con acabado de tijera en la parte superior.',   40, 10000, true),
  ('Tinte de Barba',         'Coloración de barba con tinte profesional. Incluye hidratación.',          35, 9000,  true),
  ('Keratina Exprés',        'Tratamiento de keratina exprés para alisar y nutrir el cabello.',          60, 18000, true),
  ('Diseño de Cejas',        'Depilación y perfilado de cejas con hilo y pinzas.',                       15, 4000,  true),
  ('Lavado + Hidratación',   'Lavado profundo con champú profesional y mascarilla hidratante.',          20, 5000,  true),
  ('Corte Infantil',         'Corte de cabello para niños hasta 12 años, ambiente amigable.',             25, 6000,  true)
ON CONFLICT DO NOTHING;
