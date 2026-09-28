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
    greetingSample: 'Kaaruma tẽta (Buenas tardes comunidad)'
  }
];

export const AGE_GROUPS = [
  {
    id: 'nino',
    label: 'Niños (6 a 12 años)',
    subtext: '2 unidades, 1 lección + 2 juegos por unidad. Aprendizaje visual y divertido.',
    icon: 'happy-outline',
    unitsLimit: 2,
    lessonsLimit: 1,
    gamesPerUnit: 2,
    games: ['memory', 'matching']
  },
  {
    id: 'joven',
    label: 'Jóvenes (13 a 17 años)',
    subtext: '3 unidades, 2 lecciones + 2 juegos por unidad. Ritmo ágil y vocabulario rápido.',
    icon: 'school-outline',
    unitsLimit: 3,
    lessonsLimit: 2,
    gamesPerUnit: 2,
    games: ['hangman', 'quick_quiz']
  },
  {
    id: 'adulto',
    label: 'Adultos (18+ años)',
    subtext: '3 unidades, 2 lecciones + 2 juegos por unidad. Aprendizaje cultural profundo.',
    icon: 'person-outline',
    unitsLimit: 3,
    lessonsLimit: 2,
    gamesPerUnit: 2,
    games: ['complete_word', 'word_search']
  },
  {
    id: 'mayor',
    label: 'Adultos Mayores / Accesible',
    subtext: '3 unidades, 2 lecciones + 2 juegos por unidad. Texto grande y asistencia de voz.',
    icon: 'heart-outline',
    unitsLimit: 3,
    lessonsLimit: 2,
    gamesPerUnit: 2,
    games: ['memory', 'matching']
  }
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
        id: 101,
        title: 'Juego: Unir Saludos',
        type: 'game',
        game_type: 'matching',
        xp: 20,
        coins: 15,
        is_completed: false,
        cultural_capsule: {
          title: 'La Fuerza del Saludo',
          content: 'En la cultura guaraní, el saludo es el primer puente entre dos almas. "Maitei" abre las puertas del corazón.'
        }
      },
      {
        id: 2,
        title: 'Saludos de la Tarde',
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
        id: 102,
        title: 'Juego: Memoria',
        type: 'game',
        game_type: 'memory',
        xp: 20,
        coins: 15,
        is_completed: false,
        cultural_capsule: {
          title: 'La Memoria de los Abuelos',
          content: 'Los abuelos guaraníes entrenan la memoria con historias y cantos. Cada palabra recordada es un tesoro.'
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
        id: 3,
        title: 'Aguará y sus Amigos',
        type: 'normal',
        xp: 15,
        coins: 10,
        is_completed: false,
        cultural_capsule: {
          title: 'La Astucia de Aguará',
          content: 'El zorro chaqueño es el héroe astuto de las fábulas indígenas, venciendo a oponentes más grandes con ingenio.'
        }
      },
      {
        id: 103,
        title: 'Juego: Ahorcado',
        type: 'game',
        game_type: 'hangman',
        xp: 20,
        coins: 15,
        is_completed: false,
        cultural_capsule: {
          title: 'El Lenguaje de los Animales',
          content: 'Cada animal del monte chaqueño tiene un nombre sagrado en guaraní que guarda su esencia.'
        }
      },
      {
        id: 4,
        title: 'Más Animales del Chaco',
        type: 'normal',
        xp: 15,
        coins: 10,
        is_completed: false,
        cultural_capsule: {
          title: 'El Tatú y su Coraza',
          content: 'El armadillo (Tatú) es admirado por su paciencia y su resistencia bajo tierra.'
        }
      },
      {
        id: 104,
        title: 'Juego: Quiz Rápido',
        type: 'game',
        game_type: 'quick_quiz',
        xp: 20,
        coins: 15,
        is_completed: false,
        cultural_capsule: {
          title: 'El Guasu, Señor del Monte',
          content: 'El venado (Guasu) simboliza la libertad y el cuidado del territorio en los relatos guaraníes.'
        }
      }
    ]
  },
  {
    id: 3,
    unit_number: 3,
    title_guarani: "Ñemoñare ha Papapy",
    title_spanish: 'Familia y Números',
    description: 'Aprende a nombrar a tu familia y a contar del uno al diez en Guaraní.',
    theme_color: '#8E24AA',
    lessons: [
      {
        id: 5,
        title: 'Miembros de la Familia',
        type: 'normal',
        xp: 15,
        coins: 10,
        is_completed: false,
        cultural_capsule: {
          title: 'La Familia Extensa Guaraní',
          content: 'En las comunidades guaraníes, "familia" incluye abuelos, tíos y toda la Tëta (casa comunal).'
        }
      },
      {
        id: 105,
        title: 'Juego: Completar Palabra',
        type: 'game',
        game_type: 'complete_word',
        xp: 20,
        coins: 15,
        is_completed: false,
        cultural_capsule: {
          title: 'Ñemoñare, la Raíz',
          content: 'La palabra "Ñemoñare" significa descendencia. Cada nombre familiar es un árbol que crece.'
        }
      },
      {
        id: 6,
        title: 'Números del 1 al 5',
        type: 'normal',
        xp: 15,
        coins: 10,
        is_completed: false,
        cultural_capsule: {
          title: 'Contar como los Abuelos',
          content: 'Los números guaraníes acompañan cantos y juegos tradicionales transmitidos de generación en generación.'
        }
      },
      {
        id: 106,
        title: 'Juego: Sopa de Letras',
        type: 'game',
        game_type: 'word_search',
        xp: 20,
        coins: 15,
        is_completed: false,
        cultural_capsule: {
          title: 'Papapy: Los Números',
          content: 'Los números en guaraní tienen origen en los dedos de las manos y los ciclos de la luna.'
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
        { id: '3', text: 'Pîtuma', translation: 'Buenas noches', icon: 'moon-outline', isCorrect: false },
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
    },
    {
      id: 202,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Buenas noches"?',
      prompt_guarani: '¿Mba\'eicha "Buenas noches"?',
      audio_text: 'Pîtuma',
      correct_answer: 'Pîtuma',
      options: [
        { id: '1', text: 'Pîtuma', translation: 'Buenas noches', icon: 'moon-outline', isCorrect: true },
        { id: '2', text: 'Puama', translation: 'Buenos días', icon: 'sunny-outline', isCorrect: false },
        { id: '3', text: 'Kaaruma', translation: 'Buenas tardes', icon: 'partly-sunny-outline', isCorrect: false },
        { id: '4', text: 'Maitei', translation: 'Hola', icon: 'happy-outline', isCorrect: false }
      ],
      explanation: 'Pîtuma es el saludo nocturno.',
      cultural_fact: 'Al caer la noche, la comunidad guaraní se recoge para descansar.'
    },
    {
      id: 203,
      type: 'sentence_builder',
      prompt_spanish: 'Forma: "Hola amigo mío"',
      prompt_guarani: 'Eñono: "Maitei che irũ"',
      audio_text: 'Maitei che irũ',
      correct_answer: 'Maitei che irũ',
      chips: [
        { id: 'b1', text: 'Maitei' },
        { id: 'b2', text: 'che' },
        { id: 'b3', text: 'irũ' },
        { id: 'b4', text: 'kaaruma' }
      ],
      explanation: 'Maitei = Hola, Che irũ = amigo mío.',
      cultural_fact: 'El saludo entre amigos refuerza los lazos comunales.'
    },
    {
      id: 204,
      type: 'special_keyboard',
      prompt_spanish: 'Escribe "Buenas tardes" en guaraní:',
      prompt_guarani: 'Ehai "Kaaruma"',
      audio_text: 'Kaaruma',
      correct_answer: 'Kaaruma',
      special_keys: ['ã', 'ẽ', 'ĩ', 'õ', 'ũ', 'ỹ', 'ñ', "'"],
      explanation: 'Se escribe "Kaaruma".',
      cultural_fact: 'La k suena fuerte en guaraní.'
    },
    {
      id: 205,
      type: 'true_false',
      prompt_spanish: '"Kaaruma" se usa por la mañana.',
      prompt_guarani: 'Kaaruma es matutino?',
      audio_text: 'Kaaruma',
      correct_answer: 'false',
      explanation: '¡No! Kaaruma es de la tarde.',
      cultural_fact: 'Cada hora del día tiene su saludo.'
    },
    {
      id: 206,
      type: 'multiple_choice',
      prompt_spanish: '¿Cuál es el saludo de la tarde?',
      prompt_guarani: 'Mba\'éichapa Kaaruma?',
      audio_text: 'Kaaruma',
      correct_answer: 'Kaaruma',
      options: [
        { id: 'a', text: 'Kaaruma', isCorrect: true },
        { id: 'b', text: 'Puama', isCorrect: false },
        { id: 'c', text: 'Pîtuma', isCorrect: false },
        { id: 'd', text: 'Maitei', isCorrect: false }
      ],
      explanation: 'Kaaruma es el saludo de la tarde.',
      cultural_fact: 'Se usa entre el mediodía y el atardecer.'
    }
  ],

  3: [
    {
      id: 301,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Zorro" en guaraní?',
      prompt_guarani: 'Mba\'eicha "Zorro"?',
      audio_text: 'Aguará',
      correct_answer: 'Aguará',
      options: [
        { id: '1', text: 'Aguará', translation: 'Zorro', icon: 'paw-outline', isCorrect: true },
        { id: '2', text: 'Yagua', translation: 'Jaguar', icon: 'paw-outline', isCorrect: false },
        { id: '3', text: 'Tatú', translation: 'Armadillo', icon: 'shield-outline', isCorrect: false },
        { id: '4', text: 'Guasu', translation: 'Venado', icon: 'walk-outline', isCorrect: false }
      ],
      explanation: 'Aguará significa "Zorro".',
      cultural_fact: 'El zorro es el héroe astuto del monte.'
    },
    {
      id: 302,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Jaguar"?',
      prompt_guarani: 'Mba\'eicha "Jaguar"?',
      audio_text: 'Yagua',
      correct_answer: 'Yagua',
      options: [
        { id: '1', text: 'Yagua', translation: 'Jaguar', icon: 'paw-outline', isCorrect: true },
        { id: '2', text: 'Aguará', translation: 'Zorro', icon: 'paw-outline', isCorrect: false },
        { id: '3', text: 'Tatú', translation: 'Armadillo', icon: 'shield-outline', isCorrect: false },
        { id: '4', text: 'Guasu', translation: 'Venado', icon: 'walk-outline', isCorrect: false }
      ],
      explanation: 'Yagua significa "Jaguar".',
      cultural_fact: 'El jaguar es el señor del monte chaqueño.'
    },
    {
      id: 303,
      type: 'sentence_builder',
      prompt_spanish: 'Forma: "El zorro corre en el monte"',
      prompt_guarani: 'Eñono: "Aguará oñani ka\'aguype"',
      audio_text: 'Aguará oñani ka\'aguype',
      correct_answer: 'Aguará oñani ka\'aguype',
      chips: [
        { id: 'b1', text: 'Aguará' },
        { id: 'b2', text: 'oñani' },
        { id: 'b3', text: 'ka\'aguype' },
        { id: 'b4', text: 'puama' }
      ],
      explanation: 'Aguará = Zorro, oñani = corre, ka\'aguype = en el monte.',
      cultural_fact: 'El zorro se mueve ágil por el monte.'
    },
    {
      id: 304,
      type: 'multiple_choice',
      prompt_spanish: '¿Qué significa "Yagua"?',
      prompt_guarani: 'Mba\'éipa Yagua?',
      audio_text: 'Yagua',
      correct_answer: 'Yagua',
      options: [
        { id: 'a', text: 'Jaguar', isCorrect: true },
        { id: 'b', text: 'Zorro', isCorrect: false },
        { id: 'c', text: 'Ave', isCorrect: false },
        { id: 'd', text: 'Venado', isCorrect: false }
      ],
      explanation: 'Yagua = Jaguar.',
      cultural_fact: 'El jaguar es el mayor felino del Chaco.'
    },
    {
      id: 305,
      type: 'true_false',
      prompt_spanish: '"Aguará" significa "Zorro".',
      prompt_guarani: 'Aguará = Zorro?',
      audio_text: 'Aguará',
      correct_answer: 'true',
      explanation: '¡Correcto! Aguará es Zorro.',
      cultural_fact: 'El zorro es un animal sagrado en el Chaco.'
    }
  ],

  4: [
    {
      id: 401,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Armadillo" en Guaraní?',
      prompt_guarani: '¿Mba\'eicha oñe\'ẽ "Armadillo"?',
      audio_text: 'Tatú',
      correct_answer: 'Tatú',
      options: [
        { id: '1', text: 'Tatú', translation: 'Armadillo', icon: 'shield-outline', isCorrect: true },
        { id: '2', text: 'Guasu', translation: 'Venado', icon: 'walk-outline', isCorrect: false },
        { id: '3', text: 'Aguará', translation: 'Zorro', icon: 'paw-outline', isCorrect: false },
        { id: '4', text: 'Yagua', translation: 'Jaguar', icon: 'paw-outline', isCorrect: false }
      ],
      explanation: 'Tatú es el armadillo.',
      cultural_fact: 'El Tatú excava madrigueras profundas.'
    },
    {
      id: 402,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Venado" en Guaraní?',
      prompt_guarani: '¿Mba\'eicha oñe\'ẽ "Venado"?',
      audio_text: 'Guasu',
      correct_answer: 'Guasu',
      options: [
        { id: '1', text: 'Guasu', translation: 'Venado', icon: 'walk-outline', isCorrect: true },
        { id: '2', text: 'Tatú', translation: 'Armadillo', icon: 'shield-outline', isCorrect: false },
        { id: '3', text: 'Yagua', translation: 'Jaguar', icon: 'paw-outline', isCorrect: false },
        { id: '4', text: 'Aguará', translation: 'Zorro', icon: 'paw-outline', isCorrect: false }
      ],
      explanation: 'Guasu es el venado.',
      cultural_fact: 'El Guasu es respetado como guardián silencioso.'
    },
    {
      id: 403,
      type: 'special_keyboard',
      prompt_spanish: 'Escribe "Armadillo" en guaraní:',
      prompt_guarani: 'Ehai "Tatú"',
      audio_text: 'Tatú',
      correct_answer: 'Tatú',
      special_keys: ['ã', 'ẽ', 'ĩ', 'õ', 'ũ', 'ỹ', 'ñ', "'"],
      explanation: 'Se escribe "Tatú".',
      cultural_fact: 'El acento cae en la última sílaba.'
    },
    {
      id: 404,
      type: 'multiple_choice',
      prompt_spanish: '¿Cuál de estos es el "Venado"?',
      prompt_guarani: 'Mba\'éichapa Guasu?',
      audio_text: 'Guasu',
      correct_answer: 'Guasu',
      options: [
        { id: 'a', text: 'Guasu', isCorrect: true },
        { id: 'b', text: 'Tatú', isCorrect: false },
        { id: 'c', text: 'Aguará', isCorrect: false },
        { id: 'd', text: 'Yagua', isCorrect: false }
      ],
      explanation: 'Guasu = Venado.',
      cultural_fact: 'Símbolo de libertad en el monte.'
    },
    {
      id: 405,
      type: 'true_false',
      prompt_spanish: '"Tatú" significa "Armadillo".',
      prompt_guarani: 'Tatú = Armadillo?',
      audio_text: 'Tatú',
      correct_answer: 'true',
      explanation: '¡Correcto! Tatú es Armadillo.',
      cultural_fact: 'El armadillo es símbolo de paciencia.'
    }
  ],

  5: [
    {
      id: 501,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Madre" en Guaraní?',
      prompt_guarani: '¿Mba\'eicha oñe\'ẽ "Madre"?',
      audio_text: 'Sy',
      correct_answer: 'Sy',
      options: [
        { id: '1', text: 'Sy', translation: 'Madre', icon: 'woman-outline', isCorrect: true },
        { id: '2', text: 'Túa', translation: 'Padre', icon: 'man-outline', isCorrect: false },
        { id: '3', text: 'Angu', translation: 'Abuelo', icon: 'person-outline', isCorrect: false },
        { id: '4', text: 'Tëta', translation: 'Casa comunal', icon: 'home-outline', isCorrect: false }
      ],
      explanation: 'Sy significa "madre".',
      cultural_fact: 'La madre (Sy) es la base de la familia extensa.'
    },
    {
      id: 502,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Padre"?',
      prompt_guarani: '¿Mba\'eicha "Padre"?',
      audio_text: 'Túa',
      correct_answer: 'Túa',
      options: [
        { id: '1', text: 'Túa', translation: 'Padre', icon: 'man-outline', isCorrect: true },
        { id: '2', text: 'Sy', translation: 'Madre', icon: 'woman-outline', isCorrect: false },
        { id: '3', text: 'Angu', translation: 'Abuelo', icon: 'person-outline', isCorrect: false },
        { id: '4', text: 'Tëta', translation: 'Casa comunal', icon: 'home-outline', isCorrect: false }
      ],
      explanation: 'Túa significa "padre".',
      cultural_fact: 'El padre (Túa) enseña los saberes de la caza.'
    },
    {
      id: 503,
      type: 'special_keyboard',
      prompt_spanish: 'Escribe "Abuelo" en guaraní:',
      prompt_guarani: 'Ehai "Angu"',
      audio_text: 'Angu',
      correct_answer: 'Angu',
      special_keys: ['ã', 'ẽ', 'ĩ', 'õ', 'ũ', 'ỹ', 'ñ', "'"],
      explanation: 'Se escribe "Angu".',
      cultural_fact: 'Los abuelos (Angu) son guardianes de la memoria oral.'
    },
    {
      id: 504,
      type: 'multiple_choice',
      prompt_spanish: '¿Cuál es "Madre"?',
      prompt_guarani: 'Mba\'éichapa Sy?',
      audio_text: 'Sy',
      correct_answer: 'Sy',
      options: [
        { id: 'a', text: 'Sy', isCorrect: true },
        { id: 'b', text: 'Túa', isCorrect: false },
        { id: 'c', text: 'Angu', isCorrect: false },
        { id: 'd', text: 'Tëta', isCorrect: false }
      ],
      explanation: 'Sy = Madre.',
      cultural_fact: 'La madre es pilar del hogar guaraní.'
    },
    {
      id: 505,
      type: 'true_false',
      prompt_spanish: '"Angu" significa "Abuelo".',
      prompt_guarani: 'Angu = Abuelo?',
      audio_text: 'Angu',
      correct_answer: 'true',
      explanation: '¡Correcto! Angu es Abuelo.',
      cultural_fact: 'Los abuelos son los sabios de la comunidad.'
    }
  ],

  6: [
    {
      id: 601,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Uno" en guaraní?',
      prompt_guarani: 'Mba\'eicha "Uno"?',
      audio_text: 'Peteĩ',
      correct_answer: 'Peteĩ',
      options: [
        { id: '1', text: 'Peteĩ', translation: 'Uno', icon: 'apps-outline', isCorrect: true },
        { id: '2', text: 'Mokõi', translation: 'Dos', icon: 'apps-outline', isCorrect: false },
        { id: '3', text: 'Mbohapy', translation: 'Tres', icon: 'apps-outline', isCorrect: false },
        { id: '4', text: 'Irundy', translation: 'Cuatro', icon: 'apps-outline', isCorrect: false }
      ],
      explanation: 'Peteĩ = Uno.',
      cultural_fact: 'Los números tienen raíz ancestral.'
    },
    {
      id: 602,
      type: 'card_selection',
      prompt_spanish: '¿Cómo se dice "Dos"?',
      prompt_guarani: 'Mba\'eicha "Dos"?',
      audio_text: 'Mokõi',
      correct_answer: 'Mokõi',
      options: [
        { id: '1', text: 'Mokõi', translation: 'Dos', icon: 'apps-outline', isCorrect: true },
        { id: '2', text: 'Peteĩ', translation: 'Uno', icon: 'apps-outline', isCorrect: false },
        { id: '3', text: 'Mbohapy', translation: 'Tres', icon: 'apps-outline', isCorrect: false },
        { id: '4', text: 'Irundy', translation: 'Cuatro', icon: 'apps-outline', isCorrect: false }
      ],
      explanation: 'Mokõi = Dos.',
      cultural_fact: 'La õ es nasal.'
    },
    {
      id: 603,
      type: 'sentence_builder',
      prompt_spanish: 'Forma: "Uno, dos, tres"',
      prompt_guarani: 'Eñono: "Peteĩ, mokõi, mbohapy"',
      audio_text: 'Peteĩ mokõi mbohapy',
      correct_answer: 'Peteĩ mokõi mbohapy',
      chips: [
        { id: 'b1', text: 'Peteĩ' },
        { id: 'b2', text: 'mokõi' },
        { id: 'b3', text: 'mbohapy' },
        { id: 'b4', text: 'sy' }
      ],
      explanation: 'Peteĩ=1, Mokõi=2, Mbohapy=3.',
      cultural_fact: 'Contar es memorizar la lengua.'
    },
    {
      id: 604,
      type: 'multiple_choice',
      prompt_spanish: '¿Qué significa "Irundy"?',
      prompt_guarani: 'Mba\'éipa Irundy?',
      audio_text: 'Irundy',
      correct_answer: 'Irundy',
      options: [
        { id: 'a', text: 'Cuatro', isCorrect: true },
        { id: 'b', text: 'Uno', isCorrect: false },
        { id: 'c', text: 'Dos', isCorrect: false },
        { id: 'd', text: 'Cinco', isCorrect: false }
      ],
      explanation: 'Irundy = Cuatro.',
      cultural_fact: 'Los números guaraníes son base 5.'
    },
    {
      id: 605,
      type: 'true_false',
      prompt_spanish: '"Peteĩ" significa "Uno".',
      prompt_guarani: 'Peteĩ = Uno?',
      audio_text: 'Peteĩ',
      correct_answer: 'true',
      explanation: '¡Correcto! Peteĩ = Uno.',
      cultural_fact: 'Cada número guarda memoria.'
    }
  ],

  7: [
    {
      id: 701,
      type: 'matching_pairs',
      prompt_spanish: 'Empareja cada animal con su nombre en Guaraní',
      prompt_guarani: 'Eñono ojoykére mymba reta',
      pairs: [
        { id: 'p1', left: 'Zorro', right: 'Aguará' },
        { id: 'p2', left: 'Jaguar', right: 'Yagua' },
        { id: 'p3', left: 'Armadillo', right: 'Tatú' },
        { id: 'p4', left: 'Venado', right: 'Guasu' }
      ],
      explanation: '¡Excelente memoria!',
      cultural_fact: 'Cada animal aparece en fábulas guaraníes.'
    }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// 🎮 JUEGOS
// ══════════════════════════════════════════════════════════════════════════════
export const LOCAL_GAMES = {
  matching: {
    id: 'matching',
    title: 'Unir Pares',
    description: 'Empareja cada palabra con su traducción',
    icon: 'git-compare',
    color: '#7E57C2',
    pairs: [
      { id: 'p1', left: 'Puama', right: 'Buenos días' },
      { id: 'p2', left: 'Maitei', right: 'Hola' },
      { id: 'p3', left: 'Kaaruma', right: 'Buenas tardes' },
      { id: 'p4', left: 'Pîtuma', right: 'Buenas noches' }
    ]
  },

  memory: {
    id: 'memory',
    title: 'Memoria',
    description: 'Encuentra las parejas de cartas',
    icon: 'grid',
    color: '#26A69A',
    pairs: [
      { id: 'm1', emoji: '🌅', word: 'Puama' },
      { id: 'm2', emoji: '👋', word: 'Maitei' },
      { id: 'm3', emoji: '☀️', word: 'Kaaruma' },
      { id: 'm4', emoji: '🌙', word: 'Pîtuma' },
      { id: 'm5', emoji: '🦊', word: 'Aguará' },
      { id: 'm6', emoji: '🐆', word: 'Yagua' }
    ]
  },

  quick_quiz: {
    id: 'quick_quiz',
    title: 'Quiz Rápido',
    description: '¡Responde antes de que se acabe el tiempo!',
    icon: 'flash',
    color: '#FFA726',
    timePerQuestion: 10,
    questions: [
      { id: 'q1', prompt: '¿Cómo se dice "Zorro"?', correct: 'Aguará', options: ['Aguará', 'Yagua', 'Tatú', 'Guasu'] },
      { id: 'q2', prompt: '¿Cómo se dice "Jaguar"?', correct: 'Yagua', options: ['Yagua', 'Aguará', 'Guasu', 'Tatú'] },
      { id: 'q3', prompt: '¿Qué significa "Maitei"?', correct: 'Hola', options: ['Hola', 'Adiós', 'Gracias', 'Buenos días'] },
      { id: 'q4', prompt: '¿Cómo se dice "Buenos días"?', correct: 'Puama', options: ['Puama', 'Kaaruma', 'Pîtuma', 'Maitei'] },
      { id: 'q5', prompt: '¿Cómo se dice "Armadillo"?', correct: 'Tatú', options: ['Tatú', 'Guasu', 'Yagua', 'Aguará'] },
      { id: 'q6', prompt: '¿Qué significa "Sy"?', correct: 'Madre', options: ['Madre', 'Padre', 'Abuelo', 'Hermano'] },
      { id: 'q7', prompt: '¿Cómo se dice "Uno"?', correct: 'Peteĩ', options: ['Peteĩ', 'Mokõi', 'Mbohapy', 'Irundy'] },
      { id: 'q8', prompt: '¿Qué significa "Guasu"?', correct: 'Venado', options: ['Venado', 'Jaguar', 'Zorro', 'Armadillo'] }
    ]
  },

  hangman: {
    id: 'hangman',
    title: 'Ahorcado',
    description: 'Adivina la palabra antes de perder tus corazones',
    icon: 'text',
    color: '#EF5350',
    words: [
      { word: 'AGUARÁ', hint: 'Zorro chaqueño', emoji: '🦊', category: 'Animal' },
      { word: 'YAGUA', hint: 'Gran felino del monte', emoji: '🐆', category: 'Animal' },
      { word: 'TATÚ', hint: 'Armadillo acorazado', emoji: '🦔', category: 'Animal' },
      { word: 'GUASU', hint: 'Venado saltarín', emoji: '🦌', category: 'Animal' },
      { word: 'MAITEI', hint: 'Saludo de amistad', emoji: '👋', category: 'Saludo' },
      { word: 'PUAMA', hint: 'Saludo del amanecer', emoji: '🌅', category: 'Saludo' },
      { word: 'KAARUMA', hint: 'Saludo de la tarde', emoji: '☀️', category: 'Saludo' },
      { word: 'PÎTUMA', hint: 'Saludo de la noche', emoji: '🌙', category: 'Saludo' },
      { word: 'SY', hint: 'Pilar del hogar', emoji: '👩', category: 'Familia' },
      { word: 'TÚA', hint: 'Enseña la caza', emoji: '👨', category: 'Familia' },
      { word: 'ANGU', hint: 'Sabio de la comunidad', emoji: '👴', category: 'Familia' },
      { word: 'PETEĨ', hint: 'El primer número', emoji: '1️⃣', category: 'Número' },
      { word: 'MOKÕI', hint: 'El segundo número', emoji: '2️⃣', category: 'Número' }
    ]
  },

  complete_word: {
    id: 'complete_word',
    title: 'Completar Palabra',
    description: 'Elige la letra que falta para completar la palabra',
    icon: 'extension-puzzle',
    color: '#42A5F5',
    words: [
      { word: 'AGUARÁ', hint: 'Zorro chaqueño', emoji: '🦊', missingIndex: 2 },
      { word: 'YAGUA', hint: 'Gran felino', emoji: '🐆', missingIndex: 1 },
      { word: 'TATÚ', hint: 'Armadillo', emoji: '🦔', missingIndex: 2 },
      { word: 'GUASU', hint: 'Venado', emoji: '🦌', missingIndex: 3 },
      { word: 'MAITEI', hint: 'Hola', emoji: '👋', missingIndex: 3 },
      { word: 'PUAMA', hint: 'Buenos días', emoji: '🌅', missingIndex: 2 },
      { word: 'KAARUMA', hint: 'Buenas tardes', emoji: '☀️', missingIndex: 4 },
      { word: 'SY', hint: 'Madre', emoji: '👩', missingIndex: 1 },
      { word: 'ANGU', hint: 'Abuelo', emoji: '👴', missingIndex: 2 },
      { word: 'PETEĨ', hint: 'Uno', emoji: '1️⃣', missingIndex: 3 }
    ]
  },

  word_search: {
    id: 'word_search',
    title: 'Sopa de Letras',
    description: 'Encuentra las palabras escondidas',
    icon: 'search',
    color: '#66BB6A',
    gridSize: 8,
    words: ['MAITEI', 'PUAMA', 'AGUARÁ', 'YAGUA', 'SY', 'ANGU']
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// 🪙 PAQUETES DE MBAE (monedas del juego)
// ══════════════════════════════════════════════════════════════════════════════
export const MBAE_PACKS = [
  {
    id: 'pack_100',
    mbae: 100,
    price_bs: 10,
    name: 'Puñado de Mbae',
    description: '100 monedas Mbae para empezar',
    icon: 'leaf-outline',
    popular: false
  },
  {
    id: 'pack_250',
    mbae: 250,
    price_bs: 20,
    name: 'Bolsa de Mbae',
    description: '250 monedas Mbae',
    icon: 'bag-outline',
    popular: true
  },
  {
    id: 'pack_500',
    mbae: 500,
    price_bs: 35,
    name: 'Cofre de Mbae',
    description: '500 monedas Mbae',
    icon: 'cube-outline',
    popular: false
  },
  {
    id: 'pack_1000',
    mbae: 1000,
    price_bs: 60,
    name: 'Vasija Dorada de Mbae',
    description: '1000 monedas Mbae',
    icon: 'trophy-outline',
    popular: false
  }
];