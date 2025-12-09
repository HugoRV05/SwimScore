export type Language = 'es' | 'en';

export const translations = {
  es: {
    // Navigation
    nav: {
      dashboard: "Panel Principal",
      upload: "Subir Datos",
      events: "Pruebas",
      swimmers: "Nadadores",
      clubs: "Clubes",
      settings: "Configuración",
    },
    // Settings
    settings: {
      title: "Configuración de Puntuación",
      subtitle: "Configurar reglas de puntuación y distribuciones",
      unsavedChanges: "Tienes cambios sin guardar",
      discard: "Descartar",
      save: "Guardar y Recalcular",
      tabs: {
        presets: "Preajustes",
        points: "Distribución de Puntos",
        categories: "Categorías",
        bonus: "Puntos Extra"
      },
      presets: {
        title: "Preajustes de Puntuación",
        description: "Selecciona una configuración predefinida o personaliza tus propias reglas.",
        noLimit: "⚡ Sin límite por club",
        limitPerClub: "👥 {n} nadadores/club",
        categoriesCount: "{n} categorías"
      },
      points: {
        title: "Distribución de Puntos",
        individual: "Puntos Prueba Individual (Posición 1-16)",
        relay: "Puntos Relevos (Posición 1-16)",
        commaSeparated: "Valores separados por coma para posiciones 1 a 16",
        clubLimit: "Máximo Nadadores por Club por Prueba",
        noLimitPlaceholder: "Sin límite",
        redistribute: "Redistribuir puntos al siguiente elegible"
      },
      categories: {
        title: "Categorías de Edad",
        add: "Añadir Categoría",
        description: "Definir categorías de edad y dónde pueden puntuar.",
        name: "Nombre",
        minAge: "Edad Mín",
        maxAge: "Edad Máx",
        canScoreIn: "Puntúa En",
        none: "Ninguna"
      },
      bonus: {
        title: "Puntos Extra por Récords",
        enable: "Habilitar Puntos Extra por Récords",
        regionalBest: "Mejor Marca Regional",
        championshipRecord: "Récord del Campeonato",
        absoluteRegional: "Récord Absoluto Regional",
        nationalBest: "Mejor Marca Nacional"
      },
      summary: {
        title: "Resumen de Configuración Actual",
        configName: "Nombre Config:",
        individualPoints: "Puntos Individuales:",
        clubLimit: "Límite Club:",
        categories: "Categorías:",
        defined: "{n} definidas",
        perEvent: "por Prueba"
      },
      language: {
        title: "Idioma",
        select: "Seleccionar Idioma del Sistema"
      }
    },
    // Dashboard
    dashboard: {
      welcome: {
        title: "Bienvenido a SwimScore",
        message: "Sube un archivo PDF para comenzar a analizar los resultados de la competición y ver clasificaciones profesionales."
      },
      empty: {
        title: "Bienvenido a SwimScore",
        message: "Sube un archivo PDF para comenzar."
      },
      stats: {
        events: "Pruebas",
        clubs: "Clubes",
        swimmers: "Nadadores",
        athletes: "Atletas",
        totalPoints: "Puntos Totales"
      },
      podium: {
        title: "Podio de Clubes",
        viewFull: "Ver Clasificación Completa",
        pts: "PTS"
      },
      charts: {
        pointsVariance: "Varianza de Puntos"
      },
      topAthletes: {
        title: "Mejores Atletas",
        seeAll: "Ver Todos los Rankings"
      },
      ready: {
        title: "¿Listo para Analizar?",
        message: "Importa tu PDF de Splash Meet Manager para desbloquear insights profesionales."
      },
      live: "RESULTADOS EN VIVO",
      topClubs: {
        title: "Top 5 Clubes",
        viewAll: "Ver Todos"
      },
      topSwimmers: {
        title: "Top 5 Nadadores",
        viewAll: "Ver Todos"
      }
    },
    // Club Rankings
    clubRankings: {
      title: "Clasificación de Clubes",
      subtitle: "Ver clasificaciones de clubes basadas en resultados de competición",
      subtitleWithMeet: "{meet} • {count} clubes • Puntuación: {scoring}",
      empty: {
        title: "Ninguna Competición Cargada",
        message: "Sube un archivo PDF para ver las clasificaciones de clubes y comparar el rendimiento de los equipos."
      },
      filters: {
        search: "Buscar",
        searchPlaceholder: "Buscar clubes...",
        category: "Categoría",
        gender: "Género"
      },
      table: {
        individual: "Individual",
        relay: "Relevo",
        total: "Total",
        medals: "Medallas",
        swimmers: "Nadadores"
      },
      stats: {
        totalPointsView: "Puntos Totales (Vista Actual)",
        goldMedalsView: "Medallas de Oro (Vista Actual)"
      }
    },
    // Swimmer Rankings
    swimmerRankings: {
      title: "Clasificación de Nadadores",
      subtitle: "Ver clasificaciones individuales de nadadores",
      empty: {
        title: "Ninguna Competición Cargada",
        message: "Sube un archivo PDF para ver las clasificaciones de nadadores y rendimientos individuales."
      },
      filters: {
        search: "Buscar Nadadores",
        searchPlaceholder: "Buscar por nombre...",
        club: "Club",
        pointsView: "Vista de Puntos",
        allClubs: "Todos los Clubes"
      },
      table: {
        year: "Año",
        cat: "Cat",
        evts: "Evts",
        avgPos: "PosMed",
        openPts: "Pts Open",
        catPts: "Pts Cat",
        totalPts: "Puntos"
      },
      stats: {
        totalSwimmers: "Total Nadadores",
        goldWinners: "Ganadores de Oro",
        avgEvents: "Media Pruebas/Nadador"
      }
    },
    // Event Details
    eventDetails: {
      noMeet: "No hay competición cargada",
      goHome: "Ir a Inicio",
      notFound: "Prueba no encontrado",
      backToEvents: "Volver a Pruebas",
      entries: "{n} inscripciones totales",
      relayEvent: "Prueba de Relevos",
      individualEvent: "Prueba Individual",
      table: {
        clubTeam: "Club / Equipo",
        time: "Tiempo",
        status: "Estado"
      },
      status: {
        scoringOpenCat: "Puntúa (Open & Cat)",
        scoringOpen: "Puntúa (Sólo Open)",
        scoringCat: "Puntúa (Sólo Cat)",
        notEligible: "No Elegible (Open)",
        noPoints: "Sin Puntos",
        seePoints: "Ver Puntos",
        // Specific reasons
        timeLimit: "NO MIN",
        clubLimit: "MAX CLUB",
        dq: "DQ"
      }
    },
    // Event Browser
    eventBrowser: {
      title: "Explorador de Pruebas",
      subtitle: "Explorar todos los Pruebas y resultados",
      subtitleWithMeet: "{meet} • {n} Pruebas",
      empty: {
        title: "Ninguna Competición Cargada",
        message: "Sube un archivo PDF para explorar Pruebas y ver resultados detallados."
      },
      filters: {
        stroke: "Estilo",
        allStrokes: "Todos los Estilos",
        freestyle: "Libre",
        backstroke: "Espalda",
        breaststroke: "Braza",
        butterfly: "Mariposa",
        medley: "Estilos",
        distance: "Distancia",
        allDist: "Todas",
        gender: "Género",
        type: "Tipo",
        allTypes: "Todos",
        individual: "Individual",
        relay: "Relevo",
        sortBy: "Ordenar Por",
        numberAsc: "Prueba # (Asc)",
        numberDesc: "Prueba # (Desc)",
        distanceAsc: "Distancia (Corta primero)",
        distanceDesc: "Distancia (Larga primero)",
        entriesDesc: "Más Inscripciones",
        entriesAsc: "Menos Inscripciones"
      },
      showing: "Mostrando {n} de {m} Pruebas",
      table: {
        number: "#",
        gender: "Género",
        event: "Prueba",
        type: "Tipo",
        category: "Categoría",
        entries: "Inscrip."
      },
      tags: {
        relay: "Relevo",
        indiv: "Indiv"
      },
      qualifyingTimes: {
        title: "Tiempos Mínimos (Minimas)",
        open: "OPEN:",
        age: "{age} años:"
      }
    },
    // Upload Page
    upload: {
      title: "Subir PDF de Resultados",
      subtitle: "Sube un PDF de Splash Meet Manager para analizar los resultados",
      dropZone: {
        processing: "Procesando PDF...",
        extracting: "Extrayendo texto y analizando resultados",
        dragDrop: "Arrastra y Suelta el PDF Aquí",
        browse: "o haz clic para buscar archivos"
      },
      error: "Error al Analizar PDF",
      success: {
        title: "¡PDF Cargado con Éxito!",
        message: "Se encontraron {n} Pruebas con resultados",
        viewDashboard: "Ver Dashboard"
      },
      preview: {
        title: "📋 Pruebas Analizados",
        raw: "Texto Crudo Extraído",
        hide: "Ocultar",
        show: "Mostrar"
      }
    },
    // Common
    common: {
      pos: "Pos",
      club: "Club",
      swimmer: "Nadador",
      ind: "Ind.",
      relay: "Relevo",
      total: "Total",
      medals: "Medallas",
      events: "Pruebas",
      points: "Puntos",
      allCategories: "Todas las Categorías",
      allGenders: "Todos los Géneros",
      male: "Masculino",
      female: "Femenino",
      mixed: "Mixto",
      open: "Open",
      junior: "Junior", 
      uploadPdf: "Subir PDF",
      team: "Equipo",
      unknown: "Desconocido"
    }
  },
  en: {
    // Navigation
    nav: {
      dashboard: "Dashboard",
      upload: "Upload Data",
      events: "Events",
      swimmers: "Swimmers",
      clubs: "Clubs",
      settings: "Settings",
    },
    // Settings
    settings: {
      title: "Scoring Settings",
      subtitle: "Configure scoring rules and point distributions",
      unsavedChanges: "You have unsaved changes",
      discard: "Discard",
      save: "Save & Recalculate",
      tabs: {
        presets: "Presets",
        points: "Point Distribution",
        categories: "Categories",
        bonus: "Bonus Points"
      },
      presets: {
        title: "Scoring Presets",
        description: "Select a preset configuration or customize your own scoring rules.",
        noLimit: "⚡ No club limits",
        limitPerClub: "👥 {n} swimmers/club",
        categoriesCount: "{n} categories"
      },
      points: {
        title: "Point Distribution",
        individual: "Individual Event Points (Position 1-16)",
        relay: "Relay Event Points (Position 1-16)",
        commaSeparated: "Comma-separated values for positions 1 through 16",
        clubLimit: "Max Swimmers per Club per Event",
        noLimitPlaceholder: "No limit",
        redistribute: "Redistribute points to next eligible"
      },
      categories: {
        title: "Age Categories",
        add: "Add Category",
        description: "Define age categories and which categories each can score in.",
        name: "Name",
        minAge: "Min Age",
        maxAge: "Max Age",
        canScoreIn: "Can Score In",
        none: "None"
      },
      bonus: {
        title: "Bonus Points for Records",
        enable: "Enable Bonus Points for Records",
        regionalBest: "Regional Best Time",
        championshipRecord: "Championship Record",
        absoluteRegional: "Absolute Regional Record",
        nationalBest: "National Best Time"
      },
      summary: {
        title: "Current Configuration Summary",
        configName: "Config Name:",
        individualPoints: "Individual Points:",
        clubLimit: "Club Limit:",
        categories: "Categories:",
        defined: "{n} defined",
        perEvent: "per event"
      },
      language: {
        title: "Language",
        select: "Select System Language"
      }
    },
    // Dashboard
    dashboard: {
      welcome: {
        title: "Welcome to SwimScore",
        message: "Upload a PDF file to start analyzing competition results and view professional standings."
      },
      empty: {
        title: "Welcome to SwimScore",
        message: "Upload a PDF file to start."
      },
      stats: {
        events: "Events",
        clubs: "Clubs",
        swimmers: "Swimmers",
        athletes: "Athletes",
        totalPoints: "Total Points"
      },
      podium: {
        title: "Club Podium",
        viewFull: "View Full Standings",
        pts: "PTS"
      },
      charts: {
        pointsVariance: "Points Variance"
      },
      topAthletes: {
        title: "Top Athletes",
        seeAll: "See All Rankings"
      },
      ready: {
        title: "Ready to Analyze?",
        message: "Import your Splash Meet Manager PDF to unlock professional insights."
      },
      live: "LIVE RESULTS",
      topClubs: {
        title: "Top 5 Clubs",
        viewAll: "View All"
      },
      topSwimmers: {
        title: "Top 5 Swimmers",
        viewAll: "View All"
      }
    },
    // Club Rankings
    clubRankings: {
      title: "Club Rankings",
      subtitle: "View club standings based on competition results",
      subtitleWithMeet: "{meet} • {count} clubs • Scoring: {scoring}",
      empty: {
        title: "No Meet Loaded",
        message: "Upload a PDF file to view club rankings and compare team performances."
      },
      filters: {
        search: "Search",
        searchPlaceholder: "Search clubs...",
        category: "Category",
        gender: "Gender"
      },
      table: {
        individual: "Individual",
        relay: "Relay",
        total: "Total",
        medals: "Medals",
        swimmers: "Swimmers"
      },
      stats: {
        totalPointsView: "Total Points (Current View)",
        goldMedalsView: "Gold Medals (Current View)"
      }
    },
    // Swimmer Rankings
    swimmerRankings: {
      title: "Swimmer Rankings",
      subtitle: "View individual swimmer standings",
      empty: {
        title: "No Meet Loaded",
        message: "Upload a PDF file to view swimmer rankings and individual performances."
      },
      filters: {
        search: "Search Swimmers",
        searchPlaceholder: "Search by name...",
        club: "Club",
        pointsView: "Points View",
        allClubs: "All Clubs"
      },
      table: {
        year: "Year",
        cat: "Cat",
        evts: "Evts",
        avgPos: "AvgPos",
        openPts: "Open Pts",
        catPts: "Cat Pts",
        totalPts: "Points"
      },
      stats: {
        totalSwimmers: "Total Swimmers",
        goldWinners: "Gold Medal Winners",
        avgEvents: "Avg Events/Swimmer"
      }
    },
    // Event Details
    eventDetails: {
      noMeet: "No meet loaded",
      goHome: "Go Home",
      notFound: "Event not found",
      backToEvents: "Back to Events",
      entries: "{n} total entries",
      relayEvent: "Relay Event",
      individualEvent: "Individual Event",
      table: {
        clubTeam: "Club / Team",
        time: "Time",
        status: "Status"
      },
      status: {
        scoringOpenCat: "Scoring (Open & Cat)",
        scoringOpen: "Scoring (Open Only)",
        scoringCat: "Scoring (Category Only)",
        notEligible: "Not Eligible (Open)",
        noPoints: "No Points",
        seePoints: "See Points",
        // Specific reasons
        timeLimit: "NO MIN",
        clubLimit: "MAX CLUB",
        dq: "DQ"
      }
    },
    // Event Browser
    eventBrowser: {
      title: "Event Browser",
      subtitle: "Browse all events and their results",
      subtitleWithMeet: "{meet} • {n} events",
      empty: {
        title: "No Meet Loaded",
        message: "Upload a PDF file to browse events and view detailed results."
      },
      filters: {
        stroke: "Stroke",
        allStrokes: "All Strokes",
        freestyle: "Freestyle",
        backstroke: "Backstroke",
        breaststroke: "Breaststroke",
        butterfly: "Butterfly",
        medley: "Medley",
        distance: "Distance",
        allDist: "All Dist",
        gender: "Gender",
        type: "Type",
        allTypes: "All Types",
        individual: "Individual",
        relay: "Relay",
        sortBy: "Sort By",
        numberAsc: "Event # (Asc)",
        numberDesc: "Event # (Desc)",
        distanceAsc: "Distance (Short first)",
        distanceDesc: "Distance (Long first)",
        entriesDesc: "Most Entries",
        entriesAsc: "Least Entries"
      },
      showing: "Showing {n} of {m} events",
      table: {
        number: "#",
        gender: "Gender",
        event: "Event",
        type: "Type",
        category: "Category",
        entries: "Entries"
      },
      tags: {
        relay: "Relay",
        indiv: "Indiv"
      },
      qualifyingTimes: {
        title: "Qualifying Times (Minimas)",
        open: "OPEN:",
        age: "{age}y:"
      }
    },
    // Upload Page
    upload: {
      title: "Upload Results PDF",
      subtitle: "Upload a Splash Meet Manager PDF to analyze competition results",
      dropZone: {
        processing: "Processing PDF...",
        extracting: "Extracting text and parsing results",
        dragDrop: "Drag & Drop PDF Here",
        browse: "or click to browse files"
      },
      error: "Error Parsing PDF",
      success: {
        title: "PDF Loaded Successfully!",
        message: "Found {n} events with results",
        viewDashboard: "View Dashboard"
      },
      preview: {
        title: "📋 Parsed Events",
        raw: "Raw Extracted Text",
        hide: "Hide",
        show: "Show"
      }
    },
    // Common
    common: {
      pos: "Pos",
      club: "Club",
      swimmer: "Swimmer",
      ind: "Ind.",
      relay: "Relay",
      total: "Total",
      medals: "Medals",
      events: "Events",
      points: "Points",
      allCategories: "All Categories",
      allGenders: "All Genders",
      male: "Male",
      female: "Female",
      mixed: "Mixed",
      open: "Open",
      junior: "Junior", 
      uploadPdf: "Upload PDF",
      team: "Team",
      unknown: "Unknown"
    }
  }
};
