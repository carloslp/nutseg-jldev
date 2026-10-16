-- ============================================================================
-- NutSeg (BioMetrix Pro) - Seed Data para Catálogo SMAE y Ejercicios
-- 50+ Alimentos equivalentes del SMAE y 40+ Ejercicios Biomecánicos
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ALIMENTOS EQUIVALENTES SMAE (55 alimentos)
-- ----------------------------------------------------------------------------
INSERT INTO public.food_catalog (name, smae_group, portion_qty, portion_unit, grams_net, kcal, protein_g, fat_g, carbs_g, allergen_tags)
VALUES
    -- Alimentos de Origen Animal (AOA) - 10
    ('Pechuga de pollo cocida y deshebrada', 'aoa', 30, 'g', 30, 40, 7.0, 1.0, 0.0, ARRAY[]::text[]),
    ('Atún en agua drenado', 'aoa', 35, 'g', 35, 40, 7.0, 0.5, 0.0, ARRAY['fish']::text[]),
    ('Claras de huevo pasteurizadas', 'aoa', 2, 'piezas', 66, 40, 7.2, 0.1, 0.3, ARRAY['egg']::text[]),
    ('Huevo entero fresco', 'aoa', 1, 'pieza', 50, 75, 6.5, 5.0, 0.5, ARRAY['egg']::text[]),
    ('Filete de res magro (sirloin/cuete)', 'aoa', 30, 'g', 30, 45, 7.0, 1.5, 0.0, ARRAY[]::text[]),
    ('Queso panela bajo en grasa', 'aoa', 40, 'g', 40, 40, 7.0, 1.2, 0.5, ARRAY['lactose']::text[]),
    ('Queso cottage bajo en grasa', 'aoa', 3, 'cdas', 45, 40, 6.8, 0.8, 1.5, ARRAY['lactose']::text[]),
    ('Salmón fresco a la plancha', 'aoa', 30, 'g', 30, 55, 7.0, 3.0, 0.0, ARRAY['fish']::text[]),
    ('Camarón cocido o al vapor', 'aoa', 35, 'g', 35, 38, 7.0, 0.3, 0.0, ARRAY['shellfish']::text[]),
    ('Tofu firme prensado', 'aoa', 60, 'g', 60, 45, 7.0, 1.5, 1.0, ARRAY['soy']::text[]),

    -- Cereales y Tubérculos (10)
    ('Avena en hojuelas entera', 'cereals', 0.33, 'taza', 30, 70, 2.5, 1.0, 14.5, ARRAY['gluten']::text[]),
    ('Arroz blanco o integral al vapor', 'cereals', 0.5, 'taza', 80, 70, 2.0, 0.2, 15.0, ARRAY[]::text[]),
    ('Tortilla de maíz nixtamalizado', 'cereals', 1, 'pieza', 30, 68, 1.8, 0.5, 14.0, ARRAY[]::text[]),
    ('Papa cocida o al horno con cáscara', 'cereals', 0.5, 'pieza mediana', 90, 70, 2.0, 0.1, 15.5, ARRAY[]::text[]),
    ('Camote cocido al vapor', 'cereals', 0.33, 'pieza mediana', 70, 70, 1.5, 0.1, 16.0, ARRAY[]::text[]),
    ('Pan integral de caja (100% grano entero)', 'cereals', 1, 'rebanada', 30, 70, 3.0, 0.8, 13.5, ARRAY['gluten']::text[]),
    ('Pasta cocida al dente', 'cereals', 0.5, 'taza', 75, 70, 2.5, 0.3, 14.8, ARRAY['gluten']::text[]),
    ('Quinoa cocida', 'cereals', 0.33, 'taza', 60, 75, 2.8, 1.2, 13.0, ARRAY[]::text[]),
    ('Tostada de maíz horneada', 'cereals', 2, 'piezas', 24, 65, 1.5, 0.4, 14.0, ARRAY[]::text[]),
    ('Tortita de arroz inflado', 'cereals', 2, 'piezas', 20, 70, 1.4, 0.2, 15.0, ARRAY[]::text[]),

    -- Leguminosas (6)
    ('Frijoles negros de la olla cocidos', 'legumes', 0.5, 'taza', 85, 120, 8.0, 0.5, 20.0, ARRAY[]::text[]),
    ('Lentejas cocidas', 'legumes', 0.5, 'taza', 90, 120, 8.5, 0.4, 20.0, ARRAY[]::text[]),
    ('Garbanzos cocidos', 'legumes', 0.5, 'taza', 85, 120, 7.5, 1.2, 19.5, ARRAY[]::text[]),
    ('Edamames al vapor en vaina', 'legumes', 0.5, 'taza', 80, 110, 8.5, 3.0, 12.0, ARRAY['soy']::text[]),
    ('Habas cocidas', 'legumes', 0.5, 'taza', 85, 115, 8.0, 0.5, 19.0, ARRAY[]::text[]),
    ('Soya texturizada hidratada', 'legumes', 0.33, 'taza', 50, 110, 9.0, 0.5, 16.0, ARRAY['soy']::text[]),

    -- Verduras (9)
    ('Espinacas crudas desinfectadas', 'vegetables', 2, 'tazas', 120, 25, 2.5, 0.2, 3.5, ARRAY[]::text[]),
    ('Brócoli al vapor', 'vegetables', 1, 'taza', 90, 25, 2.6, 0.3, 4.5, ARRAY[]::text[]),
    ('Jitomate saladette en rodajas', 'vegetables', 1, 'pieza mediana', 100, 22, 1.1, 0.2, 4.0, ARRAY[]::text[]),
    ('Pepino rebanado con cáscara', 'vegetables', 1.5, 'tazas', 150, 20, 1.0, 0.1, 3.8, ARRAY[]::text[]),
    ('Champiñones blancos fileteados', 'vegetables', 1, 'taza', 80, 22, 2.5, 0.2, 3.0, ARRAY[]::text[]),
    ('Calabacita italiana cocida', 'vegetables', 1, 'taza', 110, 25, 1.5, 0.2, 4.5, ARRAY[]::text[]),
    ('Espárragos asados a la plancha', 'vegetables', 6, 'piezas', 90, 25, 2.4, 0.2, 4.0, ARRAY[]::text[]),
    ('Zanahoria cruda rallada', 'vegetables', 0.5, 'taza', 60, 25, 0.8, 0.1, 5.5, ARRAY[]::text[]),
    ('Pimiento morrón picado', 'vegetables', 1, 'taza', 100, 28, 1.2, 0.2, 5.5, ARRAY[]::text[]),

    -- Frutas (8)
    ('Manzana gala con cáscara', 'fruits', 1, 'pieza chica', 110, 60, 0.3, 0.2, 15.0, ARRAY[]::text[]),
    ('Plátano maduro', 'fruits', 0.5, 'pieza mediana', 60, 60, 0.7, 0.2, 15.5, ARRAY[]::text[]),
    ('Fresas frescas lavadas', 'fruits', 1, 'taza', 150, 50, 1.0, 0.4, 12.0, ARRAY[]::text[]),
    ('Frutos rojos mixtos congelados', 'fruits', 0.75, 'taza', 120, 60, 1.0, 0.4, 14.0, ARRAY[]::text[]),
    ('Papaya picada en cubos', 'fruits', 1, 'taza', 140, 55, 0.7, 0.1, 14.0, ARRAY[]::text[]),
    ('Naranja fresca en gajos', 'fruits', 1, 'pieza mediana', 120, 60, 1.2, 0.1, 15.0, ARRAY[]::text[]),
    ('Uvas rojas sin semilla', 'fruits', 15, 'piezas', 90, 62, 0.6, 0.2, 16.0, ARRAY[]::text[]),
    ('Kiwi en rebanadas', 'fruits', 1.5, 'piezas', 100, 58, 1.1, 0.4, 14.5, ARRAY[]::text[]),

    -- Aceites y Grasas (8)
    ('Aceite de oliva extra virgen', 'fats', 1, 'cdta', 5, 45, 0.0, 5.0, 0.0, ARRAY[]::text[]),
    ('Aguacate Hass fresco', 'fats', 0.33, 'pieza', 35, 45, 0.6, 4.8, 1.5, ARRAY[]::text[]),
    ('Almendras naturales enteras', 'fats', 10, 'piezas', 12, 70, 2.8, 5.5, 2.0, ARRAY['tree_nuts']::text[]),
    ('Nueces de Castilla en mitades', 'fats', 3, 'piezas', 12, 75, 1.8, 7.0, 1.5, ARRAY['tree_nuts']::text[]),
    ('Crema de cacahuate 100% natural', 'fats', 2, 'cdtas', 14, 75, 3.2, 6.0, 2.5, ARRAY['peanuts']::text[]),
    ('Semillas de chía', 'fats', 1, 'cda', 10, 48, 1.8, 3.2, 4.0, ARRAY[]::text[]),
    ('Aceite de coco extra virgen', 'fats', 1, 'cdta', 5, 45, 0.0, 5.0, 0.0, ARRAY[]::text[]),
    ('Aceitunas verdes deshuesadas', 'fats', 6, 'piezas', 25, 40, 0.3, 4.0, 0.8, ARRAY[]::text[]),

    -- Leche y Derivados Lácteos (4)
    ('Leche descremada / light', 'milk', 1, 'taza', 240, 95, 9.0, 1.5, 12.0, ARRAY['lactose']::text[]),
    ('Yogurt griego natural sin azúcar', 'milk', 0.75, 'taza', 150, 100, 12.0, 1.5, 6.0, ARRAY['lactose']::text[]),
    ('Bebida de almendra sin azúcar', 'milk', 1, 'taza', 240, 35, 1.0, 2.5, 1.5, ARRAY['tree_nuts']::text[]),
    ('Bebida de soya sin azúcar fortificada', 'milk', 1, 'taza', 240, 85, 7.0, 3.5, 4.0, ARRAY['soy']::text[])
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. CATÁLOGO BIOMECÁNICO DE EJERCICIOS (42 ejercicios)
-- ----------------------------------------------------------------------------
INSERT INTO public.exercise_catalog (
    name, movement_pattern, primary_muscle, equipment_required, difficulty, joint_stress_tags, default_sets, default_reps, default_rest_sec, instructions, video_url
)
VALUES
    -- Patrón Squat (Dominante de Rodilla) - 6
    ('Sentadilla Goblet con Mancuerna', 'squat', 'Cuádriceps', 'dumbbells', 'beginner', ARRAY['knee']::text[], 4, '10-12', 90, 'Sujeta la mancuerna vertical en el pecho. Desciende con el torso erguido abriendo rodillas hacia la punta de los pies.', 'https://www.youtube.com/watch?v=MeIiIdhvXT4'),
    ('Prensa Inclinada de Piernas (45°)', 'squat', 'Cuádriceps', 'machine', 'intermediate', ARRAY['knee']::text[], 4, '12-15', 90, 'Pies al ancho de hombros en el centro. Empuja con los talones y evita bloquear rodillas arriba.', 'https://www.youtube.com/watch?v=IZxyjW7MPJQ'),
    ('Sentadilla Búlgara con Mancuernas', 'squat', 'Cuádriceps y Glúteos', 'dumbbells', 'advanced', ARRAY['knee']::text[], 3, '10/pierna', 90, 'Empeine trasero sobre banco. Desciende verticalmente manteniendo el peso repartido en talón delantero.', 'https://www.youtube.com/watch?v=2C-uNgKwPLE'),
    ('Extensión Isométrica de Cuádriceps (Safe Rodilla)', 'squat', 'Cuádriceps', 'machine', 'beginner', ARRAY[]::text[], 4, '45 seg', 60, 'Sostén la contracción en 45° a 60° evitando el ángulo agudo de cizallamiento rotuliano.', 'https://www.youtube.com/watch?v=YyvSfVjQeL0'),
    ('Sentadilla Frontal con Barra', 'squat', 'Cuádriceps y Core', 'gym', 'advanced', ARRAY['knee', 'wrist']::text[], 4, '6-8', 120, 'Codos altos y pecho erguido. Permite mantener la columna más vertical que la trasera.', 'https://www.youtube.com/watch?v=tlfahndnk44'),
    ('Step-Up en Cajón con Mancuernas', 'squat', 'Glúteos y Cuádriceps', 'dumbbells', 'intermediate', ARRAY[]::text[], 3, '12/pierna', 75, 'Sube empujando exclusivamente con la pierna elevada sin impulsarte con el pie del suelo.', 'https://www.youtube.com/watch?v=dQqApCGd5Ss'),

    -- Patrón Hinge (Bisagra de Cadera / Isquios / Glúteos) - 6
    ('Peso Muerto Rumano con Mancuernas', 'hinge', 'Isquiotibiales', 'dumbbells', 'intermediate', ARRAY['lower_back']::text[], 4, '10-12', 90, 'Inicia con ligera flexión de rodillas y empuja la cadera hacia atrás con columna estrictamente neutra.', 'https://www.youtube.com/watch?v=JCXUYuzwNrM'),
    ('Hip Thrust con Barra / Máquina', 'hinge', 'Glúteo Mayor', 'gym', 'intermediate', ARRAY[]::text[], 4, '10-12', 100, 'Escápulas apoyadas en banco. Extensión completa de cadera en puente con barbilla pegada al pecho.', 'https://www.youtube.com/watch?v=SEdqd1n0cvg'),
    ('Puente de Glúteos en Suelo (Safe Lumbar)', 'hinge', 'Glúteos', 'bodyweight', 'beginner', ARRAY[]::text[], 3, '15-20', 60, 'Pies apoyados al ancho de caderas. Aprieta glúteos arriba sin hiperextender la zona lumbar.', 'https://www.youtube.com/watch?v=wPM8icPu6H8'),
    ('Buenos Días con Banda de Resistencia', 'hinge', 'Isquiotibiales y Erectores', 'bands', 'beginner', ARRAY[]::text[], 3, '12-15', 60, 'Pisa la banda y pásala por el cuello. Ejecuta bisagra de cadera con tensión constante.', 'https://www.youtube.com/watch?v=s3w4j4X-j-s'),
    ('Curl Femoral Tumbado en Máquina', 'hinge', 'Isquiotibiales', 'machine', 'intermediate', ARRAY['knee']::text[], 4, '12-15', 75, 'Mantén la pelvis pegada al banco para evitar trampas con la zona lumbar al flexionar.', 'https://www.youtube.com/watch?v=1Tq3QdYUuHs'),
    ('Kettlebell Swing Ruso', 'hinge', 'Cadena Posterior', 'dumbbells', 'intermediate', ARRAY['lower_back']::text[], 4, '15-20', 60, 'Empuje explosivo de cadera, no una elevación con brazos ni sentadilla profunda.', 'https://www.youtube.com/watch?v=YSxHifyI6s8'),

    -- Patrón Push Horizontal (Pecho / Tríceps) - 5
    ('Press de Banca Plano con Mancuernas', 'push_h', 'Pectoral Mayor', 'dumbbells', 'intermediate', ARRAY['shoulder']::text[], 4, '8-10', 90, 'Escápulas retraídas y deprimidas. Descenso de codos en ángulo de 45° respecto al torso.', 'https://www.youtube.com/watch?v=VmB1G1K7v94'),
    ('Press en Máquina con Agarre Neutro (Safe Hombro)', 'push_h', 'Pectoral Mayor', 'machine', 'beginner', ARRAY[]::text[], 4, '10-12', 75, 'Agarre neutro para minimizar el pinzamiento de la cabeza del húmero con el acromion.', 'https://www.youtube.com/watch?v=xUm0BiZCWlQ'),
    ('Flexiones de Pecho (Push-ups)', 'push_h', 'Pectoral y Tríceps', 'bodyweight', 'beginner', ARRAY['wrist']::text[], 3, '12-15', 60, 'Alinea cabeza, cadera y talones. Desciende hasta rozar el suelo con el pecho.', 'https://www.youtube.com/watch?v=IODxDxX7oi4'),
    ('Press Inclinado con Mancuernas a 30°', 'push_h', 'Pectoral Clavicular', 'dumbbells', 'intermediate', ARRAY['shoulder']::text[], 4, '10-12', 90, 'Banco a 30° de inclinación para focalizar la porción alta del pecho sin sobrecargar el deltoides.', 'https://www.youtube.com/watch?v=8iPEnn-ltC8'),
    ('Cruces en Polea Media con Codos Fijos', 'push_h', 'Pectoral', 'gym', 'intermediate', ARRAY[]::text[], 3, '12-15', 60, 'Tensión continua en el rango medio y acortado del pectoral con ligera semiflexión de codo.', 'https://www.youtube.com/watch?v=taI4XduLp4M'),

    -- Patrón Push Vertical (Hombros / Tríceps) - 5
    ('Press de Hombro Sentado con Mancuernas', 'push_v', 'Deltoides Anterior', 'dumbbells', 'intermediate', ARRAY['shoulder']::text[], 4, '10-12', 90, 'Respaldo a 80°. Empuja hacia arriba convergiendo ligeramente las mancuernas sin arquear la espalda.', 'https://www.youtube.com/watch?v=qEwKCR5JCog'),
    ('Elevaciones Laterales en Plano Escapular', 'push_v', 'Deltoides Lateral', 'dumbbells', 'beginner', ARRAY[]::text[], 4, '12-15', 60, 'Brazos a 30° por delante del plano coronal. Protege la bursa y el manguito rotador.', 'https://www.youtube.com/watch?v=3VcKaXpzqRo'),
    ('Press Militar con Barra de Pie', 'push_v', 'Deltoides y Core', 'gym', 'advanced', ARRAY['shoulder', 'lower_back']::text[], 4, '6-8', 120, 'Glúteos y abdomen contraídos. Pasa la cabeza hacia el frente una vez que la barra supera la frente.', 'https://www.youtube.com/watch?v=2yjwXTZQDDI'),
    ('Press de Hombros en Máquina Guiada', 'push_v', 'Deltoides Anterior', 'machine', 'beginner', ARRAY[]::text[], 3, '12-15', 75, 'Trayectoria segura y guiada ideal para aislar el hombro sin estrés estabilizador excesivo.', 'https://www.youtube.com/watch?v=Wqq43dKW1TU'),
    ('Elevaciones Posteriores con Mancuernas (Pájaros)', 'push_v', 'Deltoides Posterior', 'dumbbells', 'intermediate', ARRAY[]::text[], 4, '15-18', 60, 'Torso inclinado a 45° hacia adelante. Abre los brazos guiando el movimiento con los codos.', 'https://www.youtube.com/watch?v=ttvfGg9d76c'),

    -- Patrón Pull Horizontal (Espalda Media / Dorsal / Bíceps) - 5
    ('Remo con Mancuerna a una Mano', 'pull_h', 'Dorsal Ancho', 'dumbbells', 'intermediate', ARRAY['lower_back']::text[], 4, '10-12', 75, 'Rodilla y mano apoyadas en banco. Tracción llevando el codo hacia el bolsillo de la cadera.', 'https://www.youtube.com/watch?v=roCP6wCXPqo'),
    ('Remo en Pecho Apoyado (Chest-Supported Row)', 'pull_h', 'Espalda Media', 'machine', 'beginner', ARRAY[]::text[], 4, '10-12', 75, 'Pecho completamente apoyado en respaldo. Cero carga axial o fatiga en la columna lumbar.', 'https://www.youtube.com/watch?v=GZbfZ033f74'),
    ('Remo Gironda en Polea Baja (Seated Cable Row)', 'pull_h', 'Dorsal y Romboides', 'gym', 'intermediate', ARRAY['lower_back']::text[], 4, '12-15', 75, 'Espalda recta y pecho al frente. Tira hacia el ombligo apretando escápulas al final.', 'https://www.youtube.com/watch?v=GZbfZ033f74'),
    ('Remo Invertido en Barra Smith (Australian Pull-up)', 'pull_h', 'Espalda Superior', 'bodyweight', 'beginner', ARRAY[]::text[], 3, '10-12', 60, 'Excelente ejercicio de autocarga. Varía la inclinación de los pies para graduar la dificultad.', 'https://www.youtube.com/watch?v=hXTc1mDnZCw'),
    ('Face Pull en Polea con Cuerda', 'pull_h', 'Deltoides Posterior y Manguito', 'gym', 'beginner', ARRAY[]::text[], 4, '15-20', 60, 'Tira de la cuerda hacia la frente separando los extremos y rotando externamente los hombros.', 'https://www.youtube.com/watch?v=rep-qVOkqgk'),

    -- Patrón Pull Vertical (Dorsal / Bíceps) - 5
    ('Jalón al Pecho en Polea Alta (Lat Pulldown)', 'pull_v', 'Dorsal Ancho', 'machine', 'intermediate', ARRAY['shoulder']::text[], 4, '10-12', 90, 'Agarre al ancho de hombros. Tira hacia la parte alta del esternón sin arquear excesivamente la espalda.', 'https://www.youtube.com/watch?v=CAwf7n6Luuc'),
    ('Jalón al Pecho con Agarre Neutro (Safe Hombro)', 'pull_v', 'Dorsal Ancho', 'machine', 'beginner', ARRAY[]::text[], 4, '10-12', 75, 'Agarre neutro estrecho para favorecer el recorrido dorsal con menor tensión articular.', 'https://www.youtube.com/watch?v=lueEJGjTuPQ'),
    ('Dominadas Asistidas en Máquina o Banda', 'pull_v', 'Dorsal y Bíceps', 'machine', 'intermediate', ARRAY['shoulder']::text[], 3, '8-10', 90, 'Rango completo de movimiento desde codos casi estirados hasta mentón sobre la barra.', 'https://www.youtube.com/watch?v=y3ha7s6V7zY'),
    ('Pullover con Mancuerna en Banco Horizontal', 'pull_v', 'Dorsal y Serrato', 'dumbbells', 'intermediate', ARRAY['shoulder']::text[], 3, '12-15', 60, 'Sujeta mancuerna sobre el pecho. Desciende controlando la extensión del dorsal.', 'https://www.youtube.com/watch?v=FK4rHfWKEac'),
    ('Jalón Unilateral en Polea Alta de Rodillas', 'pull_v', 'Dorsal Ancho', 'gym', 'intermediate', ARRAY[]::text[], 3, '12/brazo', 60, 'Permite alinear la línea de tracción con las fibras dorsales de forma anatómica perfecta.', 'https://www.youtube.com/watch?v=fKhygZkO99s'),

    -- Patrón Core (Estabilidad / Anti-movimiento) - 5
    ('Plancha Abdominal Estática (Plank)', 'core', 'Transverso Abdominal', 'bodyweight', 'beginner', ARRAY[]::text[], 3, '45-60 seg', 60, 'Apoyo en antebrazos con retroversión pélvica y contracción simultánea de glúteos.', 'https://www.youtube.com/watch?v=pSHjTRCQxIw'),
    ('Pallof Press con Banda o Polea', 'core', 'Oblicuos y Anti-rotación', 'bands', 'beginner', ARRAY[]::text[], 3, '12/lado', 60, 'Sostén la banda frente al pecho y extiende brazos resistiendo la fuerza de rotación lateral.', 'https://www.youtube.com/watch?v=AH_QZLM_0-s'),
    ('Deadbug (Bicho Muerto)', 'core', 'Core Profundo', 'bodyweight', 'beginner', ARRAY[]::text[], 3, '10/lado', 45, 'Espalda baja pegada al piso mientras extiendes brazo y pierna opuesta con respiración diafragmática.', 'https://www.youtube.com/watch?v=g_BYB0R-4Ws'),
    ('Bird Dog Isométrico', 'core', 'Erectores y Estabilizadores', 'bodyweight', 'beginner', ARRAY[]::text[], 3, '10/lado', 45, 'Cuadrupedia con extensión de brazo y pierna contrarios manteniendo la pelvis totalmente nivelada.', 'https://www.youtube.com/watch?v=wiFNA3sqjCA'),
    ('Rueda Abdominal (Ab Wheel Rollout)', 'core', 'Recto Abdominal', 'bodyweight', 'advanced', ARRAY['lower_back', 'shoulder']::text[], 3, '8-10', 90, 'Extiende el torso de rodillas manteniendo la pelvis bloqueada en retroversión sin arquear la zona lumbar.', 'https://www.youtube.com/watch?v=rqiTPdK1cWg'),

    -- Patrón Arms / Accesorios - 5
    ('Curl de Bíceps con Mancuernas en Banco Inclinado', 'arms', 'Bíceps Braquial', 'dumbbells', 'intermediate', ARRAY[]::text[], 3, '12-15', 60, 'Banco a 60° para estirar al máximo la cabeza larga del bíceps.', 'https://www.youtube.com/watch?v=soxrZlIl35U'),
    ('Extensión de Tríceps en Polea Alta con Cuerda', 'arms', 'Tríceps', 'gym', 'beginner', ARRAY[]::text[], 3, '12-15', 60, 'Codos pegados al cuerpo, abre la cuerda abajo contrayendo la cabeza lateral del tríceps.', 'https://www.youtube.com/watch?v=vB5OHsJ3EME'),
    ('Curl Martillo con Mancuernas', 'arms', 'Braquial y Braquiorradial', 'dumbbells', 'beginner', ARRAY[]::text[], 3, '10-12', 60, 'Agarre neutro continuo para mayor grosor del brazo y antebrazo.', 'https://www.youtube.com/watch?v=zC3nLlEvin4'),
    ('Press Francés con Mancuernas en Banco Plano', 'arms', 'Tríceps (Cabeza Larga)', 'dumbbells', 'intermediate', ARRAY['wrist']::text[], 3, '10-12', 60, 'Flexiona los codos hacia las orejas manteniendo los brazos perpendiculares al torso.', 'https://www.youtube.com/watch?v=ir5Psb4V9AU'),
    ('Elevación de Talones de Pie para Gemelos', 'arms', 'Gastrocnemio y Sóleo', 'bodyweight', 'beginner', ARRAY[]::text[], 4, '15-20', 45, 'Pausa de 2 segundos arriba en contracción máxima y descenso lento estirando el talón.', 'https://www.youtube.com/watch?v=-M4-G8p8fmc')
ON CONFLICT DO NOTHING;
