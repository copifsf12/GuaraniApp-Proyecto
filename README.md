# 🦊 GuaraniApp - Aprende Guaraní Oriental Boliviano

Una aplicación móvil y web interactiva estilo **Duolingo** con diseño, colores e identidad cultural del **Oriente Boliviano y el Gran Chaco** (Santa Cruz, Tarija y Chuquisaca). Conducida por la simpática mascota **Aguará** (el zorro chaqueño con sombrero de saó y poncho tradicional).

---

## 🌿 Características Principales

1. **Variantes Dialectales Bolivianas**:
   - **Ava Guaraní**: Cordillera y valles chaqueños.
   - **Izoceño-Guaraní**: Bañados del Izozog y río Parapetí.
   - **Simba Guaraní**: Comunidades tradicionales de Chuquisaca y Tarija.

2. **Identidad Cultural y Cromática**:
   - Paleta inspirada en el Chaco: verdes de monte (*Ka'aguy*), terracota de vasijas (*Yapepó*), oro del maíz sagrado (*Abatí*) y fiesta del *Arete Guasu*.
   - Mascota animada **Aguará** vestida con sombrero de saó y poncho chaqueño.

3. **Flujo de Onboarding & Accesibilidad a Prueba de Fallos**:
   - Selección guiada de variante, grupo de edad y meta diaria (Casual, Regular, Serio, Intenso).
   - Modo de acceso rápido como **Invitado** sin contraseñas para evitar cualquier bloqueo técnico.

4. **El Sendero de Aprendizaje (*The Path*)**:
   - Sendero serpenteante que cruza el monte chaqueño con nodos temáticos, coronas doradas, cofres culturales y examen comunal (*Tëta*).

5. **Motor Dinámico de Lecciones**:
   - **Tarjetas gráficas ilustradas** (animales, plantas, saludos).
   - **Constructor de oraciones** con fichas flotantes interactivas.
   - **Teclado virtual de caracteres guaraníes**: `ã, ẽ, ĩ, õ, ũ, ỹ, ñ, '` (*pusó*).
   - **Discriminación fonética nasal vs oral**: identificación auditiva de resonancia.
   - **Onda sonora y altavoz con pronunciación nativa**.
   - **Cápsula Cultural Emergente**: explicaciones de cosmovisión y costumbres de cada palabra.

6. **Módulos Adicionales**:
   - **Kassukuaa Stories**: Cuentos tradicionales interactivos (*El Zorro y el Jaguar*, *La Leyenda del Maíz*).
   - **Ligas Comunales**: Liga Semilla, Vasija y Mburuvicha, con zonas de ascenso/descenso y reto colectivo mensual (10,000 lecciones).
   - **Tienda de Aguará**: Accesorios tradicionales, vasijas protectoras de racha (*Tatá*) y semillas de recarga de vida.
   - **Perfil e Insignias**: Estadísticas de racha, XP y galería de logros tallados en madera.

---

## 🚀 Arquitectura del Proyecto

```
GuaraniApp/
├── client/                     # App React Native + Expo (Móvil y Web)
│   ├── assets/images/          # Ilustraciones de Aguará y celebración
│   ├── src/
│   │   ├── components/         # Header, BottomNavBar, Teclado, Modales, Mascota
│   │   ├── context/            # Estado global (Progreso, Racha, Monedas Mba'e)
│   │   ├── data/               # Lecciones, cuentos y vocabulario boliviano
│   │   ├── screens/            # 10 Pantallas completas
│   │   └── theme/              # Paleta del Oriente Boliviano
│   └── App.js
├── server/                     # Backend Node.js + Express
│   ├── src/
│   │   ├── data/               # Base de datos en memoria y fallback
│   │   ├── routes/             # Endpoints REST (/api/lessons, /api/auth, etc.)
│   │   └── index.js
└── supabase/                   # Configuración Supabase & PostgreSQL
    ├── schema.sql              # Tablas relacionales completas
    ├── seed.sql                # Vocabulario y datos iniciales auténticos
    └── README.md
```

---

## 📲 Cómo Ejecutar la Aplicación

### 1. Iniciar el Servidor Backend (Node.js + Express)
Abre una terminal y ejecuta:
```bash
cd server
npm start
```
El servidor escuchará en `http://localhost:5000`.

### 2. Iniciar la App Móvil y Web (Expo)
Abre otra terminal y ejecuta:
```bash
cd client
npx expo start
```
- **Para probar en el Navegador de tu PC**: Presiona la tecla `w` en la consola (o ejecuta `npx expo start --web`).
- **Para probar en tu Teléfono Móvil con Expo Go**:
  1. Abre la app **Expo Go** en tu Android o iPhone.
  2. Escanea el código QR que aparece en la terminal.

---

## 🗄️ Conexión con Supabase / PostgreSQL (Opcional)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. En el **SQL Editor**, copia y ejecuta `supabase/schema.sql`, seguido de `supabase/seed.sql`.
3. Configura tus credenciales en el archivo `.env`.
*La aplicación cuenta con sincronización automática y modo offline para que nunca se interrumpa el aprendizaje.*
