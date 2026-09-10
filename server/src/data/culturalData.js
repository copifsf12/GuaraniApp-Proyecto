// ==============================================================================
// GUARANIAPP - CULTURAL DATA REPOSITORY (GUARANÍ ORIENTAL BOLIVIANO)
// ==============================================================================

const UNITS = [
  {
    id: 1,
    unit_number: 1,
    title_guarani: 'Maitei reta',
    title_spanish: 'Saludos y Presentaciones',
    description: 'Aprende los saludos cotidianos del Chaco y la cortesía guaraní.',
    icon: 'hand-wave',
    theme_color: '#2D6A4F',
    cultural_notes: 'En la cultura guaraní oriental (Chaco cruceño, tarijeño y chuquisaqueño), el saludo sincero refuerza la reciprocidad (Ñandereko). "Puama" acompaña el despertar del sol chaqueño.'
  },
  {
    id: 2,
    unit_number: 2,
    title_guarani: "Ka'aguy mymba reta",
    title_spanish: 'Animales del Monte Chaqueño',
    description: 'Descubre los animales autóctonos del Chaco y la mascota Aguará.',
    icon: 'paw',
    theme_color: '#C85A32',
    cultural_notes: "El monte chaqueño (Ka'aguy) es sagrado. Aguará (el zorro) y Yagua (el jaguar) protagonizan los cuentos ancestrales más sabios de la cestería y la oralidad."
  },
  {
    id: 3,
    unit_number: 3,
    title_guarani: 'Tëtara reta',
    title_spanish: 'La Familia y la Comunidad',
    description: 'El valor del hogar guaraní y el respeto a los abuelos.',
    icon: 'users',
    theme_color: '#D97736',
    cultural_notes: 'La vida social gira en torno al Tëta (hogar comunal) liderado por el Mburuvicha, donde cada familia aporta al bienestar colectivo.'
  },
  {
    id: 4,
    unit_number: 4,
    title_guarani: 'Arete Guasu',
    title_spanish: 'La Fiesta Grande del Maíz',
    description: 'Celebración milenaria de máscaras, danzas y reencuentro.',
    icon: 'sparkles',
    theme_color: '#8E24AA',
    cultural_notes: 'El Arete Guasu se celebra con el florecimiento del maíz (Abatí), uniendo el mundo terrenal con el recuerdo alegre de los antepasados.'
  }
];

const LESSONS = [
  {
    id: 1,
    unit_id: 1,
    lesson_order: 1,
    title: 'Saludos del Amanecer',
    type: 'normal',
    xp_reward: 15,
    coins_reward: 10,
    cultural_capsule_title: 'El Despertar Chaqueño (Puama)',
    cultural_capsule_content: 'Al amanecer en las comunidades guaraníes, desear "Puama" no es solo un saludo; es desear que el Tumpa (el Creador) bendiga la jornada en el chaco.'
  },
  {
    id: 2,
    unit_id: 1,
    lesson_order: 2,
    title: 'Saludos de la Tarde y Despedidas',
    type: 'normal',
    xp_reward: 15,
    coins_reward: 10,
    cultural_capsule_title: 'La Calidez del Kaaruma',
    cultural_capsule_content: 'Al caer la tarde, las familias se reúnen bajo los árboles de algarrobo y se saludan con "Kaaruma" para compartir noticias y descanso.'
  },
  {
    id: 3,
    unit_id: 1,
    lesson_order: 3,
    title: 'Cofre Cultural del Izozog',
    type: 'chest',
    xp_reward: 25,
    coins_reward: 30,
    cultural_capsule_title: 'Tesoros de Cestería Izoceña',
    cultural_capsule_content: '¡Has abierto el cofre cultural! Los artesanos izoceños tejen canastos y esteras con figuras geométricas que representan constelaciones chaqueñas.'
  },
  {
    id: 4,
    unit_id: 1,
    lesson_order: 4,
    title: 'Preguntar ¿Cómo estás?',
    type: 'normal',
    xp_reward: 15,
    coins_reward: 10,
    cultural_capsule_title: 'La Salud Comunal',
    cultural_capsule_content: 'En guaraní, preguntar "Kóĩ mba\'epa" busca escuchar de corazón el estado del interlocutor antes de iniciar cualquier conversación.'
  },
  {
    id: 5,
    unit_id: 1,
    lesson_order: 5,
    title: 'Evaluación de la Casa Comunal (Tëta)',
    type: 'checkpoint_teta',
    xp_reward: 40,
    coins_reward: 35,
    cultural_capsule_title: 'Consagración ante el Mburuvicha',
    cultural_capsule_content: 'Has completado la Unidad 1 con honores. La comunidad reconoce tu esfuerzo para mantener viva la lengua nativa de nuestros valles y llanos.'
  }
];

const EXERCISES_BY_LESSON = {
  1: [
    {
      id: 101,
      lesson_id: 1,
      exercise_type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Buenos días" en Guaraní Oriental Boliviano?',
      prompt_guarani: '¿Mba\'eicha oñe\'ẽ "Buenos días"?',
      audio_sample_text: 'Puama',
      correct_answer: 'Puama',
      options: [
        { id: '1', text: 'Puama', translation: 'Buenos días', icon: 'sunny-outline', isCorrect: true },
        { id: '2', text: 'Kaaruma', translation: 'Buenas tardes', icon: 'partly-sunny-outline', isCorrect: false },
        { id: '3', text: 'Pïtuma', translation: 'Buenas noches', icon: 'moon-outline', isCorrect: false },
        { id: '4', text: 'Yagua', translation: 'Jaguar / Tigre', icon: 'paw-outline', isCorrect: false }
      ],
      explanation: 'Puama es el saludo oficial de la mañana en las variantes de Santa Cruz, Tarija y Chuquisaca.',
      cultural_fact: 'En el Chaco cruceño, el saludo matutino acompaña el mate amargo antes de labrar la tierra.'
    },
    {
      id: 102,
      lesson_id: 1,
      exercise_type: 'sentence_builder',
      prompt_spanish: 'Forma la frase: "Hola, buenos días"',
      prompt_guarani: 'Eñono oñondive: "Maitei, puama"',
      audio_sample_text: 'Maitei puama',
      correct_answer: 'Maitei puama',
      options: [
        { id: 'b1', text: 'Maitei' },
        { id: 'b2', text: 'puama' },
        { id: 'b3', text: 'kaaruma' },
        { id: 'b4', text: 'yagua' }
      ],
      explanation: 'Maitei significa "Hola/Saludo cordial" y puama "buenos días".',
      cultural_fact: 'Los guaraníes dan gran importancia a la cortesía verbal.'
    },
    {
      id: 103,
      lesson_id: 1,
      exercise_type: 'nasal_discrimination',
      prompt_spanish: 'Escucha y distingue la palabra con tono NASAL (~):',
      prompt_guarani: 'Ehecha mba\'epa oñendu tĩgua',
      audio_sample_text: 'Akã',
      correct_answer: 'Akã',
      options: [
        { id: 'n1', text: 'Akã (Cabeza - Sonido Nasal)', isCorrect: true, phonetic: 'ah-KÃHN', note: 'Vocal nasal ã' },
        { id: 'n2', text: 'Aka (Simple - Sonido Oral)', isCorrect: false, phonetic: 'ah-kah', note: 'Vocal oral a' }
      ],
      explanation: 'La virgulilla sobre la ã produce un aire resonante por la cavidad nasal.',
      cultural_fact: 'El guaraní boliviano tiene 6 vocales orales y 6 nasales: ã, ẽ, ĩ, õ, ũ, ỹ.'
    },
    {
      id: 104,
      lesson_id: 1,
      exercise_type: 'special_keyboard',
      prompt_spanish: 'Escribe en guaraní: "Hola / Saludo"',
      prompt_guarani: 'Ehai "Hola" guaraníme',
      audio_sample_text: 'Maitei',
      correct_answer: 'Maitei',
      special_keys: ['ã', 'ẽ', 'ĩ', 'õ', 'ũ', 'ỹ', 'ñ', "'"],
      explanation: 'La palabra es "Maitei".',
      cultural_fact: 'El apóstrofe (\') se llama "pusó" y representa una pausa glotal.'
    },
    {
      id: 105,
      lesson_id: 1,
      exercise_type: 'audio_listening',
      prompt_spanish: 'Escucha la pronunciación con la onda sonora y escribe lo que oyes:',
      prompt_guarani: 'Ehendu katu ha ehai',
      audio_sample_text: 'Puama',
      correct_answer: 'Puama',
      options: [],
      explanation: 'Has escuchado "Puama", saludo del amanecer.',
      cultural_fact: 'El acento en guaraní suele recaer con vigor en la última sílaba.'
    }
  ],
  2: [
    {
      id: 201,
      lesson_id: 2,
      exercise_type: 'card_selection',
      prompt_spanish: '¿Cuál es el saludo para "Buenas tardes"?',
      prompt_guarani: '¿Mba\'epa "Buenas tardes"?',
      audio_sample_text: 'Kaaruma',
      correct_answer: 'Kaaruma',
      options: [
        { id: '1', text: 'Kaaruma', translation: 'Buenas tardes', icon: 'partly-sunny-outline', isCorrect: true },
        { id: '2', text: 'Puama', translation: 'Buenos días', icon: 'sunny-outline', isCorrect: false },
        { id: '3', text: 'Aguará', translation: 'Zorro', icon: 'paw-outline', isCorrect: false },
        { id: '4', text: 'Tëta', translation: 'Pueblo / Casa', icon: 'home-outline', isCorrect: false }
      ],
      explanation: 'Kaaruma se utiliza desde el mediodía hasta el anochecer.',
      cultural_fact: 'En Izozog y Cordillera, la tarde se dedica a la siembra y a la alfarería tradicional.'
    },
    {
      id: 202,
      lesson_id: 2,
      exercise_type: 'sentence_builder',
      prompt_spanish: 'Construye: "Buenas tardes amigo"',
      prompt_guarani: 'Kaaruma che irũ',
      audio_sample_text: 'Kaaruma che irũ',
      correct_answer: 'Kaaruma che irũ',
      options: [
        { id: 'c1', text: 'Kaaruma' },
        { id: 'c2', text: 'che' },
        { id: 'c3', text: 'irũ' },
        { id: 'c4', text: 'puama' }
      ],
      explanation: '"Che" significa mi, e "irũ" significa amigo o compañero de camino.',
      cultural_fact: 'Llamar a alguien "che irũ" demuestra respeto y solidaridad comunal.'
    }
  ]
};

const STORIES = [
  {
    id: 1,
    title_guarani: 'Aguará ha Yagua',
    title_spanish: 'El Zorro y el Jaguar',
    synopsis: 'Un relato clásico del Chaco donde el astuto zorro Aguará engaña al temible jaguar Yagua junto al río Parapetí.',
    dialect_variant: 'Ava Guaraní',
    difficulty_level: 'Principiante',
    cover_image: 'story_aguara_yagua',
    xp_reward: 35,
    dialogues: [
      {
        speaker: 'Narrador',
        avatar: 'book',
        text_guarani: "Peteĩ ára, Aguará oguata ka'aguype y rembe'ype.",
        text_spanish: 'Un día, el Zorro caminaba por el monte a la orilla del río Parapetí.',
        hasQuestion: false
      },
      {
        speaker: 'Yagua',
        avatar: 'paw',
        text_guarani: "¡Aguará! Che ro'uta ko'águi.",
        text_spanish: '¡Zorro! Te comeré ahora mismo sin escapatoria.',
        hasQuestion: false
      },
      {
        speaker: 'Aguará',
        avatar: 'fox',
        text_guarani: "¡Ani che 'u, che ruvicha! Ahechaka ndéve peteĩ mba'e hete va'e.",
        text_spanish: '¡No me comas, mi señor! Te mostraré un manjar más sabroso en la cueva.',
        hasQuestion: true,
        question: {
          prompt: '¿Qué le promete el zorro al jaguar para salvar su vida?',
          options: [
            'Mostrarle un manjar más sabroso',
            'Enseñarle a cantar en guaraní',
            'Nadar juntos a través del río'
          ],
          correctIndex: 0
        }
      },
      {
        speaker: 'Narrador',
        avatar: 'book',
        text_guarani: "Yagua ojerovia hese, ha Aguará oñani pya'e oñemi hag̃ua.",
        text_spanish: 'El jaguar le creyó, y el zorro corrió velozmente a refugiarse en la espesura del monte.',
        hasQuestion: false
      }
    ]
  },
  {
    id: 2,
    title_guarani: 'Abatí Rembiasa',
    title_spanish: 'La Leyenda del Maíz Sagrado',
    synopsis: 'Cómo los antepasados guaraníes recibieron la semilla dorada de Abatí para celebrar el Arete Guasu.',
    dialect_variant: 'Izoceño-Guaraní',
    difficulty_level: 'Intermedio',
    cover_image: 'story_abati',
    xp_reward: 45,
    dialogues: [
      {
        speaker: 'Narrador',
        avatar: 'book',
        text_guarani: "Ymandoie, ndaipori kuri tembi'u heva va'e tëtape.",
        text_spanish: 'En tiempos antiguos, escaseaba el alimento en las casas comunales del Chaco.',
        hasQuestion: false
      },
      {
        speaker: 'Tumpa',
        avatar: 'sparkles',
        text_guarani: "Peñotỹ ko yvyra ra'ỹi, opu'ãta Abatí ju.",
        text_spanish: 'Siembren esta semilla en la tierra fértil, brotará el maíz dorado.',
        hasQuestion: true,
        question: {
          prompt: '¿Qué brotará según las palabras sagradas del Creador?',
          options: [
            'El maíz dorado (Abatí)',
            'Un árbol de algarrobo silvestre',
            'Una planta de algodón chaqueño'
          ],
          correctIndex: 0
        }
      },
      {
        speaker: 'Mburuvicha',
        avatar: 'ribbon',
        text_guarani: "¡Ore aguije Tumpape! Jajapota kagüi Arete Guasurã.",
        text_spanish: '¡Damos gracias de corazón! Con este maíz prepararemos la chicha sagrada para el Arete Guasu.',
        hasQuestion: false
      }
    ]
  }
];

const LEAGUES_DATA = {
  leagues: [
    { id: 1, name: 'Liga Semilla (Ra\'ỹi)', rank_req: 'Inicial', min_xp: 0, icon: 'leaf' },
    { id: 2, name: 'Liga Vasija (Yapepó)', rank_req: 'Intermedio', min_xp: 150, icon: 'color-filter' },
    { id: 3, name: 'Liga del Mburuvicha', rank_req: 'Maestro', min_xp: 400, icon: 'trophy' }
  ],
  current_user_league: 'Liga Semilla (Ra\'ỹi)',
  leaderboard: [
    { rank: 1, name: 'Kuarahy (Sol Chaqueño)', xp: 420, avatar: 'fox', isCurrentUser: false, change: 'up' },
    { rank: 2, name: 'Yasí (Luna del Oriente)', xp: 390, avatar: 'woman', isCurrentUser: false, change: 'up' },
    { rank: 3, name: 'Tú (Estudiante)', xp: 285, avatar: 'fox_user', isCurrentUser: true, change: 'up' },
    { rank: 4, name: 'Ñanderu (Caminante)', xp: 260, avatar: 'man', isCurrentUser: false, change: 'up' },
    { rank: 5, name: 'Izoceño Valiente', xp: 240, avatar: 'boy', isCurrentUser: false, change: 'up' },
    { rank: 6, name: 'Ara (Tiempo Limpio)', xp: 210, avatar: 'fox', isCurrentUser: false, change: 'same' },
    { rank: 7, name: 'Mainumby (Picaflor)', xp: 195, avatar: 'bird', isCurrentUser: false, change: 'same' },
    { rank: 8, name: 'Cordillera Verde', xp: 180, avatar: 'woman', isCurrentUser: false, change: 'same' },
    { rank: 9, name: 'Chaco Tarijeño', xp: 170, avatar: 'man', isCurrentUser: false, change: 'same' },
    { rank: 10, name: 'Parapetí Ñe\'ẽ', xp: 155, avatar: 'river', isCurrentUser: false, change: 'same' },
    { rank: 11, name: 'Simba Resiliente', xp: 140, avatar: 'shield', isCurrentUser: false, change: 'down' },
    { rank: 12, name: 'Tatú Carreta', xp: 125, avatar: 'paw', isCurrentUser: false, change: 'down' },
    { rank: 13, name: 'Guasu Mirĩ', xp: 90, avatar: 'deer', isCurrentUser: false, change: 'down' },
    { rank: 14, name: 'Pirapó', xp: 60, avatar: 'fish', isCurrentUser: false, change: 'down' },
    { rank: 15, name: 'Yvytu (Viento del Sur)', xp: 30, avatar: 'cloud', isCurrentUser: false, change: 'down' }
  ],
  community_challenge: {
    title: 'Restauración del Cuento Ancestral',
    description: 'Entre toda la comunidad de estudiantes del Guaraní, alcancemos 10,000 lecciones este mes para digitalizar la historia del Chaco.',
    target: 10000,
    current: 4320,
    percent: 43,
    reward: 'Desbloqueo mundial del relato "El Secreto del Algodón Chaqueño".'
  }
};

const SHOP_ITEMS = [
  {
    id: 1,
    key: 'sombrero_sao',
    name: 'Sombrero de Saó',
    category: 'hat',
    price_mbae: 40,
    description: 'Tradicional sombrero de palma cruceño tejido para proteger a Aguará del sol chaqueño.',
    icon: 'hat-cowboy',
    preview_tag: 'Accesorio Tradicional'
  },
  {
    id: 2,
    key: 'poncho_chiquitano',
    name: 'Poncho Chaqueño Tejido',
    category: 'costume',
    price_mbae: 60,
    description: 'Elegante tejido de lana en tonos terracota y verde monte para la mascota.',
    icon: 'shirt',
    preview_tag: 'Ropa Típica'
  },
  {
    id: 3,
    key: 'mascara_arete',
    name: 'Pintura Arete Guasu',
    category: 'costume',
    price_mbae: 50,
    description: 'Pintura y diseño festivo tradicional de la gran fiesta del maíz.',
    icon: 'sparkles',
    preview_tag: 'Festividad'
  },
  {
    id: 4,
    key: 'streak_freeze',
    name: 'Vasija Protectora (Tatá)',
    category: 'powerup',
    price_mbae: 35,
    description: 'Una vasija de barro sellada que protege tu racha si un día no puedes practicar.',
    icon: 'shield-checkmark',
    preview_tag: 'Potenciador'
  },
  {
    id: 5,
    key: 'refill_hearts',
    name: 'Semillas de Vida (5 Vidas)',
    category: 'powerup',
    price_mbae: 20,
    description: 'Recupera al instante todas tus vidas con semillas sagradas de maíz.',
    icon: 'heart',
    preview_tag: 'Recarga'
  },
  {
    id: 6,
    key: 'theme_arete',
    name: 'Tema: Fiesta Chaqueña',
    category: 'theme',
    price_mbae: 75,
    description: 'Cambia los colores de la aplicación al vibrante dorado y morado festivo.',
    icon: 'color-palette',
    preview_tag: 'Personalización'
  }
];

const ACHIEVEMENTS = [
  {
    id: 1,
    key: 'hablante_monte',
    name: 'Hablante del Monte',
    name_guarani: "Ka'aguy Ñe'ẽhára",
    description: 'Aprende 20 palabras autóctonas del Chaco boliviano.',
    icon: 'leaf',
    unlocked: true,
    progress: '20/20'
  },
  {
    id: 2,
    key: 'fuego_sagrado',
    name: 'Fuego Sagrado',
    name_guarani: 'Tatá Rendy',
    description: 'Mantén una racha de 7 días consecutivos.',
    icon: 'flame',
    unlocked: false,
    progress: '3/7'
  },
  {
    id: 3,
    key: 'vasija_sabiduria',
    name: 'Vasija de Sabiduría',
    name_guarani: 'Yapepó Arakuaa',
    description: 'Acumula 200 monedas Mba\'e de recompensa.',
    icon: 'trophy',
    unlocked: true,
    progress: '285/200'
  },
  {
    id: 4,
    key: 'amigo_aguara',
    name: 'Amigo de Aguará',
    name_guarani: 'Aguará Irũ',
    description: 'Viste a tu mascota con su primer accesorio tradicional.',
    icon: 'shirt',
    unlocked: false,
    progress: '0/1'
  }
];

module.exports = {
  UNITS,
  LESSONS,
  EXERCISES_BY_LESSON,
  STORIES,
  LEAGUES_DATA,
  SHOP_ITEMS,
  ACHIEVEMENTS
};
