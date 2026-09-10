-- ==============================================================================
-- GUARANIAPP - SEED DATA (DATOS INICIALES)
-- Guaraní Oriental Boliviano: Unidades, Lecciones, Ejercicios y Cuentos
-- ==============================================================================

-- 1. UNIDADES TEMÁTICAS DEL ORIENTE BOLIVIANO
INSERT INTO units (id, unit_number, title_guarani, title_spanish, description, icon, theme_color, cultural_notes) VALUES
(1, 1, 'Maitei reta', 'Saludos y Presentaciones', 'Aprende los saludos cotidianos del Chaco y cortesía guaraní.', 'hand-wave', '#2D6A4F', 'En la cultura guaraní oriental, el saludo (Maitei) refuerza la fraternidad y el buen vivir (Ñandereko). Puama se usa por la mañana y Kaaruma por la tarde.'),
(2, 2, 'Ka''aguy mymba reta', 'Animales del Monte Chaqueño', 'Descubre los animales autóctonos del Chaco boliviano.', 'paw', '#C85A32', 'El monte chaqueño (Ka''aguy) es el hogar sagrado de la fauna. El zorro (Aguará) es símbolo de astucia y el jaguar (Yagua) de fuerza y respeto.'),
(3, 3, 'Tëtara reta', 'La Familia y la Comunidad', 'Nombrar a los miembros de la familia y el hogar guaraní.', 'users', '#D97736', 'La vida comunitaria se organiza alrededor del Tëta (hogar comunal) donde las decisiones son guiadas por el Mburuvicha.'),
(4, 4, 'Arete Guasu', 'La Fiesta Grande y Comida', 'Celebraciones, comida tradicional y el maíz sagrado (Abatí).', 'sparkles', '#8E24AA', 'El Arete Guasu es la fiesta cumbre de reencuentro con los ancestros (Aña), con danzas, máscaras talladas y chicha de maíz (Kagüi).');

-- 2. LECCIONES DE LA UNIDAD 1 (SALUDOS)
INSERT INTO lessons (id, unit_id, lesson_order, title, type, xp_reward, coins_reward, cultural_capsule_title, cultural_capsule_content) VALUES
(1, 1, 1, 'Saludos del Amanecer', 'normal', 15, 10, 'El Amanecer en el Chaco', 'Al salir el sol, los guaraníes dicen "Puama" para desear que el día sea fructífero en el trabajo del campo y la recolección.'),
(2, 1, 2, 'Saludos de la Tarde y Despedidas', 'normal', 15, 10, 'La Cortesía de la Tarde', '"Kaaruma" acompaña el descanso del atardecer chaqueño cuando la comunidad se reúne alrededor del fogón.'),
(3, 1, 3, 'Cofre del Chaco', 'chest', 20, 25, 'Cestería Izoceña', 'Los izoceños son célebres por sus tejidos de cestería con fibra de caraguatá, con figuras geométricas que representan serpientes y estrellas.'),
(4, 1, 4, 'Preguntar ¿Cómo estás?', 'normal', 15, 10, 'El concepto del Buen Vivir', 'Preguntar "Kóĩ mba''epa" (¿Cómo estás?) no es solo un formalismo, es interesarse genuinamente por la salud física y espiritual de la otra persona.'),
(5, 1, 5, 'Reto de la Casa Comunal (Tëta)', 'checkpoint_teta', 35, 30, 'El Tëta y el Mburuvicha', 'Has demostrado maestría en la Unidad 1. En la asamblea comunal eres reconocido como estudiante digno del pueblo guaraní.');

-- 3. EJERCICIOS DE LA LECCIÓN 1 (SALUDOS DEL AMANECER)
INSERT INTO exercises (lesson_id, exercise_type, prompt_spanish, prompt_guarani, audio_sample_text, correct_answer, options, explanation, cultural_fact) VALUES
(1, 'card_selection', '¿Cómo se dice "Buenos días" en Guaraní Oriental Boliviano?', '¿Mba''eicha oñe''e "Buenos días"?', 'Puama', 'Puama', 
 '[{"id":"1","text":"Puama","translation":"Buenos días","image":"sunrise","isCorrect":true},
   {"id":"2","text":"Kaaruma","translation":"Buenas tardes","image":"sunset","isCorrect":false},
   {"id":"3","text":"Pïtuma","translation":"Buenas noches","image":"night","isCorrect":false},
   {"id":"4","text":"Yagua","translation":"Jaguar / Tigre","image":"jaguar","isCorrect":false}]', 
 'Puama significa "Buenos días" en las variantes bolivianas del Guaraní.', 'En el Chaco boliviano, el saludo matutino fortalece los lazos de reciprocidad comunal.'),

(1, 'sentence_builder', 'Ordena las palabras para formar: "Hola, buenos días"', 'Maitei, puama', 'Maitei, puama', 'Maitei puama',
 '[{"id":"t1","text":"Maitei"},{"id":"t2","text":"puama"},{"id":"t3","text":"kaaruma"},{"id":"t4","text":"yagua"}]',
 'Maitei es "Hola/Saludo" y Puama es "Buenos días". Juntos forman el saludo cordial.', 'Los saludos en guaraní siempre expresan buenos deseos para la jornada.'),

(1, 'nasal_discrimination', 'Escucha y selecciona la palabra con sonido NASAL:', 'Ehecha mba''e oñendu tĩgua', 'Akã', 'Akã',
 '[{"id":"n1","text":"Akã (Cabeza - Nasal)","isCorrect":true,"phonetic":"ak-AN"},
   {"id":"n2","text":"Aka (Vocal oral simple)","isCorrect":false,"phonetic":"ah-kah"}]',
 'La virgulilla (~) sobre la ã indica resonancia por la nariz. En guaraní, cambiar el tono nasal cambia por completo el significado de la palabra.', 'El alfabeto guaraní boliviano oficializa 6 vocales nasales: ã, ẽ, ĩ, õ, ũ, ỹ.'),

(1, 'special_keyboard', 'Escribe "Hola" usando el teclado con caracteres guaraníes:', 'Ehai "Hola" guaraníme', 'Maitei', 'Maitei',
 '["ã","ẽ","ĩ","õ","ũ","ỹ","ñ","''"]',
 'Maitei se escribe M-a-i-t-e-i.', 'Maitei es el saludo universal de paz entre las comunidades guaraníes.'),

(1, 'audio_listening', 'Escucha con atención la pronunciación y escribe la palabra:', 'Ehendu katu ha ehai', 'Puama', 'Puama',
 '[]',
 'Has escuchado claramente "Puama" (Buenos días).', 'Escuchar atentamente el acento en la última sílaba es clave para hablar el guaraní chaqueño.');

-- 4. EJERCICIOS DE LA LECCIÓN 2 (KAARUMA Y DESPEDIDAS)
INSERT INTO exercises (lesson_id, exercise_type, prompt_spanish, prompt_guarani, audio_sample_text, correct_answer, options, explanation, cultural_fact) VALUES
(2, 'card_selection', 'Selecciona la opción para "Buenas tardes":', 'Eiporavo "Buenas tardes"', 'Kaaruma', 'Kaaruma',
 '[{"id":"1","text":"Kaaruma","translation":"Buenas tardes","image":"sunset","isCorrect":true},
   {"id":"2","text":"Puama","translation":"Buenos días","image":"sunrise","isCorrect":false},
   {"id":"3","text":"Aguará","translation":"Zorro","image":"fox","isCorrect":false},
   {"id":"4","text":"Tëta","translation":"Casa / Pueblo","image":"house","isCorrect":false}]',
 'Kaaruma se utiliza desde el mediodía hasta la puesta del sol.', 'Al caer la tarde en el Izozog, se comparte mate y relatos ancestrales.'),

(2, 'sentence_builder', 'Traduce: "Buenas tardes amigo"', 'Kaaruma che irũ', 'Kaaruma che irũ', 'Kaaruma che irũ',
 '[{"id":"s1","text":"Kaaruma"},{"id":"s2","text":"che"},{"id":"s3","text":"irũ"},{"id":"s4","text":"puama"}]',
 'Che significa "mi" e irũ significa "amigo o compañero".', 'La amistad y lealtad entre compañeros es central en el Ñandereko guaraní.');

-- 5. LECCIONES Y EJERCICIOS DE ANIMALES (UNIDAD 2)
INSERT INTO lessons (id, unit_id, lesson_order, title, type, xp_reward, coins_reward, cultural_capsule_title, cultural_capsule_content) VALUES
(6, 2, 1, 'El Zorro y el Jaguar', 'normal', 15, 10, 'Mito de Aguará y Yagua', 'En la tradición oral guaraní, Aguará (el zorro) siempre burla la fuerza bruta de Yagua (el jaguar) con su ingenio y astucia.'),
(7, 2, 2, 'Aves y Reptiles del Chaco', 'normal', 15, 10, 'Aves del Bañado', 'Las aves del río Parapetí anuncian las estaciones de siembra y lluvia para los pueblos agricultores.');

INSERT INTO exercises (lesson_id, exercise_type, prompt_spanish, prompt_guarani, audio_sample_text, correct_answer, options, explanation, cultural_fact) VALUES
(6, 'card_selection', '¿Cuál de estos animales es "Aguará" (el zorro chaqueño)?', '¿Mba''e mymbapa "Aguará"?', 'Aguará', 'Aguará',
 '[{"id":"1","text":"Aguará (Zorro)","image":"fox","isCorrect":true},
   {"id":"2","text":"Yagua (Jaguar / Tigre)","image":"jaguar","isCorrect":false},
   {"id":"3","text":"Tatú (Armadillo)","image":"armadillo","isCorrect":false},
   {"id":"4","text":"Guasu (Venado)","image":"deer","isCorrect":false}]',
 'Aguará es el zorro chaqueño, la sabia y ágil mascota de nuestra aplicación.', 'El Aguará Guasú habita los pastizales del oriente boliviano y es respetado por su elegancia.'),

(6, 'sentence_builder', 'Forma la oración: "El zorro corre en el monte"', 'Aguará oñani ka''aguype', 'Aguará oñani ka''aguype', 'Aguará oñani ka''aguype',
 '[{"id":"a1","text":"Aguará"},{"id":"a2","text":"oñani"},{"id":"a3","text":"ka''aguype"},{"id":"a4","text":"yagua"}]',
 'Aguará = el zorro, oñani = corre, ka''aguype = en el monte.', 'Ka''aguy es el monte sagrado que provee alimento, medicinas y vida al pueblo guaraní.');

-- 6. CUENTOS TRADICIONALES (KASSUKUAA)
INSERT INTO stories (id, title_guarani, title_spanish, synopsis, dialect_variant, difficulty_level, cover_image, xp_reward, dialogues) VALUES
(1, 'Aguará ha Yagua', 'El Zorro y el Jaguar', 'Un relato clásico del Chaco donde el astuto Aguará engaña al temible Yagua junto al río Parapetí.', 'ava', 'facil', 'story_aguara_yagua', 35,
 '[
    {"speaker":"Narrador","text_guarani":"Peteĩ ára, Aguará oguata ka''aguype y rembe''ype.", "text_spanish":"Un día, el Zorro caminaba por el monte a la orilla del río.", "hasQuestion":false},
    {"speaker":"Yagua","text_guarani":"¡Aguará! Che ro''uta ko''águi.", "text_spanish":"¡Zorro! Te comeré ahora mismo.", "hasQuestion":false},
    {"speaker":"Aguará","text_guarani":"¡Ani che ''u, che ruvicha! Ahechaka ndéve peteĩ mba''e hete va''e.", "text_spanish":"¡No me comas, mi señor! Te mostraré algo muy sabroso.", "hasQuestion":true,
     "question":{"prompt":"¿Qué le pide el zorro al jaguar?","options":["Que no lo coma y le mostrará algo rico","Que corran juntos una carrera","Que crucen el río nadando"],"correctIndex":0}},
    {"speaker":"Narrador","text_guarani":"Yagua ojerovia hese, ha Aguará oñani pya''e oñemi hag̃ua.", "text_spanish":"El jaguar le creyó, y el zorro corrió velozmente a esconderse.", "hasQuestion":false}
  ]'),

(2, 'Abatí Rembiasa', 'La Leyenda del Maíz', 'Cómo los antepasados guaraníes recibieron el maíz dorado para alimentar a sus comunidades durante el Arete Guasu.', 'izoceño', 'intermedio', 'story_abati', 45,
 '[
    {"speaker":"Narrador","text_guarani":"Ymandoie, ndaipori kuri tembi''u heva va''e tëtape.", "text_spanish":"En tiempos antiguos, no había alimento suficiente en la comunidad.", "hasQuestion":false},
    {"speaker":"Tumpa","text_guarani":"Peñotỹ ko yvyra ra''ỹi, opu''ãta Abatí ju.", "text_spanish":"Siembren esta semilla en la tierra, brotará el maíz dorado.", "hasQuestion":true,
     "question":{"prompt":"¿Qué brotará al sembrar la semilla?","options":["El maíz dorado (Abatí)","Un árbol de algarrobo","Una flor del monte"],"correctIndex":0}},
    {"speaker":"Mburuvicha","text_guarani":"¡Ore aguije Tumpape! Jajapota kagüi Arete Guasurã.", "text_spanish":"¡Agradecemos al Creador! Haremos chicha para la Gran Fiesta.", "hasQuestion":false}
  ]');

-- 7. CATÁLOGO DE LA TIENDA
INSERT INTO shop_items (item_key, name, category, description, price_mbae, icon) VALUES
('sombrero_sao', 'Sombrero de Saó Tradicional', 'hat', 'Típico sombrero de palma tejido a mano del oriente boliviano.', 40, 'hat-cowboy'),
('poncho_chiquitano', 'Poncho Chaqueño Tejido', 'costume', 'Elegante poncho con colores de tierra chaqueña para Aguará.', 60, 'shirt'),
('pintura_arete', 'Pintura Facial Arete Guasu', 'costume', 'Pinturas rituales festivas para celebrar la alegría guaraní.', 50, 'mask'),
('streak_freeze', 'Vasija Sellada (Protector de Racha)', 'powerup', 'Una vasija de barro sellada que protege tu racha si un día no puedes practicar.', 35, 'shield'),
('refill_hearts', 'Semillas de Vida (Recarga Completa)', 'powerup', 'Restaura tus 5 vidas al instante con semillas de maíz sagrado.', 20, 'heart'),
('theme_arete', 'Tema Visual: Fiesta Arete Guasu', 'theme', 'Colores festivos morados y dorados para toda la aplicación.', 80, 'palette');

-- 8. RETO COMUNITARIO
INSERT INTO community_challenge (title, description, target_lessons, current_lessons, month_year, reward_description) VALUES
('Restauración del Cuento Ancestral', 'Entre todos los estudiantes de Bolivia y el mundo, completemos 10,000 lecciones este mes para digitalizar un relato inédito del Gran Chaco.', 10000, 3840, 'Septiembre 2026', 'Desbloqueo gratuito del cuento "El Viento del Sur" narrado por abuelos izoceños.');

-- 9. INSIGNIAS Y LOGROS
INSERT INTO achievements (badge_key, name, name_guarani, description, icon, requirement_type, target_value) VALUES
('hablante_monte', 'Hablante del Monte', 'Ka''aguy Ñe''ẽhára', 'Aprende tus primeras 25 palabras del Chaco boliviano.', 'tree', 'words_learned', 25),
('fuego_sagrado', 'Fuego Sagrado (Tatá)', 'Tatá Rendy', 'Alcanza una racha de 7 días continuos de aprendizaje.', 'flame', 'streak', 7),
('vasija_sabiduria', 'Vasija de Sabiduría', 'Yapepó Arakuaa', 'Acumula 500 monedas Mba''e por tu constancia.', 'jar', 'coins', 500),
('mburuvicha_honor', 'Espíritu Mburuvicha', 'Mburuvicha Rekó', 'Completa la primera unidad comunitaria con 100% de precisión.', 'crown', 'unit_completed', 1);
