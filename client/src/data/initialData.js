// ==============================================================================
// GUARANIAPP - LOCAL CLIENT DATA (GUARANÍ ORIENTAL BOLIVIANO)
// ==============================================================================

export const DIALECT_VARIANTS = [
  {
    id: 'ava',
    name: 'Ava Guaraní',
    region: 'Cordillera (Santa Cruz), Tarija y Chuquisaca',
    description: 'La variante más extendida en las serranías chaqueñas. Famosa por sus cantos y tradiciones de resistencia.',
    speakers: 'Aprox. 45,000 hablantes',
    greetingSample: 'Puama, che irũ (Buenos días, amigo)'
  },
  {
    id: 'izoceño',
    name: 'Izoceño-Guaraní',
    region: 'Bañados del Izozog y Río Parapetí (Santa Cruz)',
    description: 'Comunidades ribereñas con rica tradición en cestería geométrica, agricultura de maíz y leyendas del monte seco.',
    speakers: 'Aprox. 12,000 hablantes',
    greetingSample: 'Kóĩ mba\'epa (¿Cómo estás hoy?)'
  },
  {
    id: 'simba',
    name: 'Simba Guaraní',
    region: 'Serranías aisladas de Chuquisaca y Tarija',
    description: 'Habitada por familias que conservaron vestimentas tradicionales y el trenzado de cabello ancestral.',
    speakers: 'Aprox. 3,000 hablantes',
    greetingSample: 'Kaaruma tëta (Buenas tardes comunidad)'
  }
];

export const AGE_GROUPS = [
  { id: 'nino', label: 'Niños (6 a 12 años)', subtext: 'Letras grandes, explicaciones sencillas y muchos animales', icon: 'happy-outline' },
  { id: 'joven', label: 'Jóvenes (13 a 17 años)', subtext: 'Ritmo ágil y desafíos de vocabulario rápido', icon: 'school-outline' },
  { id: 'adulto', label: 'Adultos (18+ años)', subtext: 'Aprendizaje cultural profundo y gramática conversacional', icon: 'person-outline' },
  { id: 'mayor', label: 'Adultos Mayores / Accesible', subtext: 'Texto extra grande, alto contraste y asistencia de voz', icon: 'heart-outline' }
];

export const DAILY_GOALS = [
  { id: 'casual', minutes: 5, label: 'Casual', subtext: '5 minutos al día (1 lección corta)', icon: 'leaf-outline' },
  { id: 'regular', minutes: 10, label: 'Regular', subtext: '10 minutos al día (2 lecciones)', icon: 'fitness-outline' },
  { id: 'serio', minutes: 15, label: 'Serio', subtext: '15 minutos al día (Constancia firme)', icon: 'flame-outline' },
  { id: 'intenso', minutes: 20, label: 'Intenso', subtext: '20 minutos al día (Inmersión chaqueña)', icon: 'trophy-outline' }
];

export const LOCAL_UNITS = [
  {
    id: 1,
    unit_number: 1,
    title_guarani: 'Maitei reta',
    title_spanish: 'Saludos y Cortesía',
    description: 'Aprende a saludar en la mañana, tarde y noche según las costumbres guaraníes.',
    theme_color: '#2D6A4F',
    lessons: [
      {
        id: 1,
        title: 'Saludos del Amanecer',
        type: 'normal',
        xp: 15,
        coins: 10,
        is_completed: false,
        cultural_capsule: {
          title: 'El Amanecer Chaqueño: Puama',
          content: 'Al salir el sol sobre el Chaco, los guaraníes dicen "Puama" para desear una jornada llena de bendición (Tumpa) en el sembradío.'
        }
      },
      {
        id: 2,
        title: 'Saludos de la Tarde y Noche',
        type: 'normal',
        xp: 15,
        coins: 10,
        is_completed: false,
        cultural_capsule: {
          title: 'La Calidez del Kaaruma',
          content: '"Kaaruma" se usa al caer la tarde, cuando la comunidad se reúne alrededor del fogón a compartir historias.'
        }
      },
      {
        id: 3,
        title: 'Cofre Cultural del Parapetí',
        type: 'chest',
        xp: 25,
        coins: 30,
        is_completed: false,
        cultural_capsule: {
          title: 'Cestería Izoceña Sagrada',
          content: '¡Cofre abierto! Descubriste los canastos izoceños tejidos con fibra de caraguatá y motivos de constelaciones.'
        }
      },
      {
        id: 4,
        title: 'Preguntar ¿Cómo estás?',
        type: 'normal',
        xp: 15,
        coins: 10,
        is_completed: false,
        cultural_capsule: {
          title: 'El Buen Vivir: Kóĩ mba\'epa',
          content: 'Preguntar por el bienestar de la otra persona es el pilar de la reciprocidad comunal guaraní.'
        }
      },
      {
        id: 5,
        title: 'Prueba de la Casa Comunal (Tëta)',
        type: 'checkpoint_teta',
        xp: 40,
        coins: 35,
        is_completed: false,
        cultural_capsule: {
          title: 'Honor del Mburuvicha',
          content: 'Has superado el examen de la Casa Comunal. La comunidad reconoce tu respeto por la palabra de los abuelos.'
        }
      }
    ]
  },
  {
    id: 2,
    unit_number: 2,
    title_guarani: "Ka'aguy mymba reta",
    title_spanish: 'Animales del Monte',
    description: 'Conoce a Aguará (el zorro), Yagua (el jaguar), Tatú (el armadillo) y Guasu (el venado).',
    theme_color: '#C85A32',
    lessons: [
      {
        id: 6,
        title: 'Aguará y sus Amigos',
        type: 'normal',
        xp: 15,
        coins: 10,
        is_completed: false,
        cultural_capsule: {
          title: 'La Astucia de Aguará',
          content: 'El zorro chaqueño es el héroe astuto de las fábulas indígenas, venciendo a oponentes más grandes con ingenio.'
        }
      }
    ]
  }
];

export const LOCAL_EXERCISES = {
  1: [
    {
      id: 101,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Buenos días" en Guaraní Oriental Boliviano?',
      prompt_guarani: '¿Mba\'eicha oñe\'ẽ "Buenos días"?',
      audio_text: 'Puama',
      correct_answer: 'Puama',
      options: [
        { id: '1', text: 'Puama', translation: 'Buenos días', icon: 'sunny-outline', isCorrect: true },
        { id: '2', text: 'Kaaruma', translation: 'Buenas tardes', icon: 'partly-sunny-outline', isCorrect: false },
        { id: '3', text: 'Pïtuma', translation: 'Buenas noches', icon: 'moon-outline', isCorrect: false },
        { id: '4', text: 'Yagua', translation: 'Jaguar / Tigre', icon: 'paw-outline', isCorrect: false }
      ],
      explanation: 'Puama es el saludo de la mañana utilizado en Santa Cruz, Tarija y Chuquisaca.',
      cultural_fact: 'En el Chaco boliviano, el saludo temprano une a las familias antes de las faenas agrícolas.'
    },
    {
      id: 102,
      type: 'sentence_builder',
      prompt_spanish: 'Forma la frase: "Hola, buenos días"',
      prompt_guarani: 'Eñono oñondive: "Maitei, puama"',
      audio_text: 'Maitei puama',
      correct_answer: 'Maitei puama',
      chips: [
        { id: 'b1', text: 'Maitei' },
        { id: 'b2', text: 'puama' },
        { id: 'b3', text: 'kaaruma' },
        { id: 'b4', text: 'yagua' }
      ],
      explanation: 'Maitei es "Hola" y puama es "Buenos días".',
      cultural_fact: 'El saludo cordial es la llave de entrada a toda comunidad guaraní.'
    },
    {
      id: 103,
      type: 'nasal_discrimination',
      prompt_spanish: 'Escucha y selecciona la palabra con sonido NASAL (~):',
      prompt_guarani: 'Ehecha mba\'epa oñendu tĩgua',
      audio_text: 'Akã',
      correct_answer: 'Akã',
      options: [
        { id: 'n1', text: 'Akã (Cabeza - Resonancia Nasal)', isCorrect: true, phonetic: 'ah-KÃHN', note: 'Vocal con tilde nasal (~)' },
        { id: 'n2', text: 'Aka (Vocal Oral Simple)', isCorrect: false, phonetic: 'ah-kah', note: 'Sonido oral sin resonancia de nariz' }
      ],
      explanation: 'La virgulilla sobre la ã indica que el aire resuena por la nariz. Esto cambia el significado en guaraní.',
      cultural_fact: 'El alfabeto guaraní boliviano contiene 6 vocales nasales indispensables: ã, ẽ, ĩ, õ, ũ, ỹ.'
    },
    {
      id: 104,
      type: 'special_keyboard',
      prompt_spanish: 'Escribe en guaraní: "Hola / Saludo"',
      prompt_guarani: 'Ehai "Hola" guaraníme',
      audio_text: 'Maitei',
      correct_answer: 'Maitei',
      special_keys: ['ã', 'ẽ', 'ĩ', 'õ', 'ũ', 'ỹ', 'ñ', "'"],
      explanation: 'La palabra se escribe "Maitei".',
      cultural_fact: 'El signo \' se llama "pusó" y marca un corte seco de la voz en la laringe.'
    },
    {
      id: 105,
      type: 'audio_listening',
      prompt_spanish: 'Escucha la pronunciación de la onda sonora y escribe la palabra:',
      prompt_guarani: 'Ehendu katu ha ehai',
      audio_text: 'Puama',
      correct_answer: 'Puama',
      explanation: 'Has escuchado "Puama" (Buenos días).',
      cultural_fact: 'El acento en guaraní oriental se pronuncia con fuerza en la última sílaba.'
    }
  ],
  2: [
    {
      id: 201,
      type: 'card_selection',
      prompt_spanish: '¿Cuál es el saludo para "Buenas tardes"?',
      prompt_guarani: '¿Mba\'epa "Buenas tardes"?',
      audio_text: 'Kaaruma',
      correct_answer: 'Kaaruma',
      options: [
        { id: '1', text: 'Kaaruma', translation: 'Buenas tardes', icon: 'partly-sunny-outline', isCorrect: true },
        { id: '2', text: 'Puama', translation: 'Buenos días', icon: 'sunny-outline', isCorrect: false },
        { id: '3', text: 'Aguará', translation: 'Zorro chaqueño', icon: 'paw-outline', isCorrect: false },
        { id: '4', text: 'Tëta', translation: 'Casa comunal', icon: 'home-outline', isCorrect: false }
      ],
      explanation: 'Kaaruma se utiliza desde las doce del mediodía hasta el anochecer.',
      cultural_fact: 'El descanso de la tarde en el Chaco es el momento de compartir el mate y la chicha de maíz.'
    }
  ]
};

export const LOCAL_STORIES = [
  {
    id: 1,
    title_guarani: 'Aguará ha Yagua',
    title_spanish: 'El Zorro y el Jaguar',
    synopsis: 'Un relato clásico del Chaco boliviano donde el astuto Aguará engaña al temible Yagua junto al río Parapetí.',
    dialect: 'Ava Guaraní',
    difficulty: 'Principiante',
    xp: 35,
    dialogues: [
      {
        speaker: 'Narrador',
        avatar: 'book-outline',
        guarani: "Peteĩ ára, Aguará oguata ka'aguype y rembe'ype.",
        spanish: 'Un día, el Zorro caminaba por el monte a la orilla del río Parapetí.',
        hasQuestion: false
      },
      {
        speaker: 'Yagua',
        avatar: 'paw-outline',
        guarani: "¡Aguará! Che ro'uta ko'águi.",
        spanish: '¡Zorro! Te comeré ahora mismo sin que puedas huir.',
        hasQuestion: false
      },
      {
        speaker: 'Aguará',
        avatar: 'happy-outline',
        guarani: "¡Ani che 'u, che ruvicha! Ahechaka ndéve peteĩ mba'e hete va'e.",
        spanish: '¡No me comas, mi señor! Te mostraré un manjar más sabroso en la orilla opuesta.',
        hasQuestion: true,
        question: {
          prompt: '¿Qué le promete el astuto zorro al jaguar?',
          options: [
            'Mostrarle un manjar más sabroso',
            'Enseñarle a bailar en el Arete Guasu',
            'Buscar a otro animal del monte'
          ],
          correctIndex: 0
        }
      },
      {
        speaker: 'Narrador',
        avatar: 'book-outline',
        guarani: "Yagua ojerovia hese, ha Aguará oñani pya'e oñemi hag̃ua.",
        spanish: 'El jaguar le creyó, y el zorro corrió con destreza a refugiarse en la espesura del monte.',
        hasQuestion: false
      }
    ]
  },
  {
    id: 2,
    title_guarani: 'Abatí Rembiasa',
    title_spanish: 'La Leyenda del Maíz Sagrado',
    synopsis: 'Cómo los antepasados recibieron la semilla de maíz para alimentar a la comunidad y celebrar la fiesta grande.',
    dialect: 'Izoceño-Guaraní',
    difficulty: 'Intermedio',
    xp: 45,
    dialogues: [
      {
        speaker: 'Narrador',
        avatar: 'book-outline',
        guarani: "Ymandoie, ndaipori kuri tembi'u heva va'e tëtape.",
        spanish: 'En tiempos remotos, escaseaba el alimento en las casas comunales del Chaco.',
        hasQuestion: false
      },
      {
        speaker: 'Tumpa',
        avatar: 'sparkles-outline',
        guarani: "Peñotỹ ko yvyra ra'ỹi, opu'ãta Abatí ju.",
        spanish: 'Siembren esta semilla en la tierra fértil, brotará el maíz dorado.',
        hasQuestion: true,
        question: {
          prompt: '¿Qué brotará según la voz del Creador?',
          options: [
            'El maíz dorado (Abatí)',
            'Un algarrobo silvestre',
            'Un árbol de toborochi'
          ],
          correctIndex: 0
        }
      },
      {
        speaker: 'Mburuvicha',
        avatar: 'ribbon-outline',
        guarani: "¡Ore aguije Tumpape! Jajapota kagüi Arete Guasurã.",
        spanish: '¡Damos gracias de corazón! Con este maíz prepararemos la chicha sagrada para la Gran Fiesta.',
        hasQuestion: false
      }
    ]
  }
];

export const LOCAL_SHOP_ITEMS = [
  {
    id: 1,
    key: 'sombrero_sao',
    name: 'Sombrero de Saó',
    category: 'hat',
    price: 40,
    description: 'Sombrero tradicional de palma cruceña tejido a mano para proteger a Aguará del sol chaqueño.',
    icon: 'sunny-outline',
    tag: 'Accesorio Típico'
  },
  {
    id: 2,
    key: 'poncho_chiquitano',
    name: 'Poncho Chaqueño Tejido',
    category: 'costume',
    price: 60,
    description: 'Elegante poncho con colores de tierra chaqueña y figuras geométricas guaraníes.',
    icon: 'shirt-outline',
    tag: 'Vestimenta'
  },
  {
    id: 3,
    key: 'pintura_arete',
    name: 'Pintura Arete Guasu',
    category: 'costume',
    price: 50,
    description: 'Pinturas faciales tradicionales de la gran fiesta del reencuentro.',
    icon: 'color-palette-outline',
    tag: 'Festividad'
  },
  {
    id: 4,
    key: 'streak_freeze',
    name: 'Vasija Protectora (Tatá)',
    category: 'powerup',
    price: 35,
    description: 'Una vasija de barro sellada que protege tu racha si un día no puedes practicar.',
    icon: 'shield-checkmark-outline',
    tag: 'Protector'
  },
  {
    id: 5,
    key: 'refill_hearts',
    name: 'Semillas de Vida (5 Vidas)',
    category: 'powerup',
    price: 20,
    description: 'Recupera al instante todas tus vidas con semillas sagradas de maíz.',
    icon: 'heart-outline',
    tag: 'Recarga'
  }
];
