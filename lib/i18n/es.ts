import type { Messages } from '@/lib/i18n/en';

export const es: Messages = {
  code: 'es',
  name: 'Español',

  formatMl: (ml: number) => {
    if (ml >= 1000) {
      const liters = ml / 1000;
      const value = liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(1);
      return `${value.replace('.', ',')} L`;
    }
    return `${ml} ml`;
  },

  dates: {
    months: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
    weekdayInitials: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    long: (date: Date) =>
      `${date.getDate()} ${es.dates.months[date.getMonth()]} ${date.getFullYear()}`,
    chartDay: (date: Date) => `${date.getDate()} ${es.dates.months[date.getMonth()]}`,
    chartMonth: (date: Date) =>
      `${es.dates.months[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`,
    range: (from: string, to: string, days: number) => `${from} → ${to} · ${days} días`,
  },

  common: {
    loading: 'Cargando…',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    remove: 'Quitar',
    erase: 'Borrar',
    days: (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`,
  },

  notFound: {
    header: '¡Vaya!',
    title: 'Esta pantalla no existe.',
    home: 'Ir a la pantalla de inicio',
  },

  tabs: {
    today: 'Hoy',
    habits: 'Hábitos',
    progress: 'Progreso',
    settings: 'Ajustes',
    habit: 'Hábito',
    waterHistory: 'Historial de agua',
  },

  today: {
    loading: 'Cargando HabitFlow…',
    greeting: (hour: number): string =>
      hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches',
    subtitleComplete: 'Meta diaria completada. Buen trabajo.',
    subtitleNoGoal: 'Añade un hábito para empezar tu primera racha.',
    subtitleWaterLeft: (left: string, done: number, need: number) =>
      `Te faltan ${left} de agua · ${done}/${need} tareas hechas`,
    subtitleTasks: (done: number, need: number) => `${done}/${need} tareas hechas hoy`,
    waterIsATask: 'Cuenta como una tarea diaria',
    addWaterA11y: (ml: number) => `Añadir ${ml} mililitros de agua`,
    undo: 'Deshacer el último sorbo',
    habitsSection: 'Hábitos de hoy',
    emptyTitle: 'Aún no hay hábitos',
    emptyBody: 'Añade tu primer hábito y empieza hoy mismo tu racha.',
    emptyCta: 'Añadir un hábito',
  },

  streakHeader: {
    streak: 'racha',
    gems: 'gemas',
    level: 'nivel',
  },

  dailyGoal: {
    title: 'Meta diaria',
    titleComplete: 'Meta diaria completada',
    titleEmpty: 'Todavía no hay meta diaria',
    captionEmpty: 'Añade un hábito o activa el registro de agua para empezar una racha.',
    captionMet: 'Tu llama está a salvo por hoy.',
    captionLeft: (left: number) =>
      `${left} ${left === 1 ? 'tarea más' : 'tareas más'} para mantener tu racha.`,
    a11y: (done: number, need: number) => `Meta diaria: ${done} de ${need} tareas hechas`,
    chipHabits: (done: number, total: number) => `✅ ${done}/${total} hábitos`,
    chipWater: '💧 Agua',
    chipWaterDone: '💧 Agua lista',
  },

  waterRing: {
    a11y: (ml: string, goal: string, percent: number) =>
      `Agua: ${ml} de ${goal}, ${percent} por ciento`,
    of: (goal: string, percent: number) => `de ${goal} · ${percent} %`,
  },

  habits: {
    title: 'Tus hábitos',
    meta: (used: number, total: number) =>
      `${used} / ${total} espacios · toca Editar para renombrar · mantén pulsado para eliminar`,
    waterTracking: 'Registro de agua',
    waterMeta: (ml: string, goal: string) => `${ml} / ${goal} · mantén pulsado para quitar`,
    waterHint: 'Mantén pulsado para quitar el registro de agua',
    addWaterTracking: '💧 Añadir registro de agua',
    addHabit: '+ Añadir hábito',
    addHabitA11y: 'Añadir hábito',
    unlockCta: (slots: number) => `🎬 Ver un anuncio para ${slots} hábitos más`,
    unlockA11y: (slots: number) => `Ver un anuncio para desbloquear ${slots} espacios de hábito`,
    hint: (free: number, extra: number) =>
      `${free} hábitos son gratis. Ver un anuncio corto desbloquea ${extra} espacios más y mantiene HabitFlow gratis para todos. El registro de agua nunca ocupa un espacio.`,
    deleteTitle: '¿Eliminar el hábito?',
    removeWaterTitle: '¿Quitar el registro de agua?',
    removeWaterBody: 'Puedes volver a añadirlo más tarde. Tu historial se queda en este teléfono.',
    startStreak: 'Empieza una racha hoy',
    dayStreak: (days: number) => `🔥 racha de ${days} ${days === 1 ? 'día' : 'días'}`,
    edit: 'Editar',
    editA11y: (name: string) => `Editar ${name}`,
    rowA11y: (name: string, streak: number) =>
      streak > 0 ? `${name}, racha de ${streak} días` : name,
    rowHint: 'Toca dos veces para marcar, mantén pulsado para eliminar',
  },

  rewards: {
    unavailableTitle: 'Recompensa no disponible',
    adFailedBody:
      'El anuncio no terminó de cargarse. Comprueba tu conexión y vuelve a intentarlo en un momento.',
    noAdHabitsBody: (free: number) =>
      `Ahora mismo no hay anuncios disponibles. Tus ${free} hábitos gratis siguen disponibles.`,
    noAdBody: 'Ahora mismo no hay anuncios disponibles. Inténtalo más tarde.',
    freezeReadyTitle: 'Protección de racha lista',
    freezeReadyBody: 'Si te saltas un día, una protección mantendrá tu llama.',
    freezeFullTitle: 'Inventario lleno',
    freezeFullBody: (max: number) => `Ya tienes ${max} protecciones de racha.`,
  },

  progress: {
    title: 'Progreso',
    meta: (streak: number, best: number, freezes: number) =>
      `🔥 racha de ${streak} días · mejor ${best} · ${freezes} ${freezes === 1 ? 'protección' : 'protecciones'}`,
    thisWeek: 'Esta semana',
    dayGoalMet: 'meta cumplida',
    dayFrozen: 'protección de racha usada',
    dayMissed: 'meta no cumplida',
    dayA11y: (date: string, status: string) => `${date}: ${status}`,
    level: (level: number, into: number, total: number) => `Nivel ${level} · ${into}/${total} XP`,
    xpLine: (xp: number, gems: number) => `${xp} XP en total · 💎 ${gems} gemas`,
    freezeCta: '❄️ Ver un anuncio por una protección de racha',
    freezeA11y: 'Ver un anuncio por una protección de racha',
    achievements: 'Logros',
    badgeA11y: (title: string, description: string, unlocked: boolean) =>
      `${title}: ${description}. ${unlocked ? 'Desbloqueado' : 'Bloqueado'}`,
  },

  hydration: {
    title: 'Hidratación',
    header: (ml: string, goal: string) => `${ml} / ${goal}`,
    footer: (total: string, average: string, met: number, days: number) =>
      `${total} en ${days} días · ${average} al día · meta cumplida ${met}/${days}`,
    allTime: (total: string, days: number) =>
      `Histórico · ${total} en ${days} ${days === 1 ? 'día' : 'días'}`,
    allTimeEmpty: 'Historial completo',
    seeAll: 'Ver todo →',
    cardA11y: 'Historial de agua: abrir el gráfico histórico',
    barA11y: (date: string, ml: string, goal: string, met: boolean) =>
      `${date}: ${ml} de ${goal}${met ? ', meta cumplida' : ''}`,
  },

  waterHistory: {
    ranges: { '7d': '7D', '30d': '30D', '1y': '1A', all: 'Todo' },
    rangeA11y: {
      '7d': 'Últimos 7 días',
      '30d': 'Últimos 30 días',
      '1y': 'Último año',
      all: 'Histórico completo',
    },
    dailyAverage: 'Media diaria',
    percentOfGoal: (percent: number) => `${percent} % de la meta`,
    bucketDay: 'Un punto por día',
    bucketWeek: 'Un punto por semana — media diaria',
    bucketMonth: 'Un punto por mes — media diaria',
    legendGoal: (goal: string) => `Meta ${goal}`,
    legendAverage: 'Tu media',
    chartA11y: (bucket: string, average: string, goal: string) =>
      `Gráfico de consumo de agua. ${bucket}. Media diaria de ${average} frente a una meta de ${goal}.`,
    daysOnGoal: 'Días con meta',
    daysOnGoalHint: (percent: number) => `${percent} % de los días`,
    totalVolume: 'Volumen total',
    totalVolumeHint: (days: number) => `${days} ${days === 1 ? 'día' : 'días'} registrados`,
    bestDay: 'Mejor día',
    bestDayEmpty: 'Sin agua registrada',
    trackingSince: 'Registrando desde',
    trackingSinceHint: (days: number) => `${days} días de historial`,
    emptyTitle: 'Todavía no hay registros',
    emptyBody:
      'Añade agua desde la pestaña Hoy y este gráfico empezará a llenarse. Los totales diarios se guardan para siempre, así que podrás volver a ellos dentro de años.',
    footnote:
      'Cada sorbo se guarda 90 días; el total de cada día se guarda para siempre, así que la vista Todo sigue creciendo año tras año.',
  },

  settings: {
    title: 'Ajustes',
    appearance: 'Apariencia',
    appearanceSystem: (current: string) =>
      `Sigue a tu teléfono — ahora mismo ${current}. Elige Claro u Oscuro para mantener HabitFlow en un solo tema pase lo que pase.`,
    appearanceFixed: (choice: string) =>
      `HabitFlow se queda en modo ${choice} aunque tu teléfono cambie.`,
    themeSystem: '⚙️ Sistema',
    themeLight: '☀️ Claro',
    themeDark: '🌙 Oscuro',
    schemeLight: 'claro',
    schemeDark: 'oscuro',
    themeA11y: (choice: string) => `Apariencia: ${choice}`,
    language: 'Idioma',
    languageSystem: (current: string) =>
      `Sigue a tu teléfono — ahora mismo ${current}. Elige un idioma para mantener HabitFlow en él pase lo que pase.`,
    languageFixed: (current: string) => `HabitFlow se queda en ${current}.`,
    languageSystemChip: '⚙️ Sistema',
    languageA11y: (choice: string) => `Idioma: ${choice}`,
    dailyGoal: 'Meta diaria',
    dailyGoalHelpWater:
      'Completa este número de tareas para mantener tu llama. Tu meta de agua cuenta como una de ellas.',
    dailyGoalHelp:
      'Completa este número de hábitos para mantener tu llama. Si tienes menos hábitos, la meta se ajusta.',
    goalCasual: 'Tranquilo · 1',
    goalRegular: 'Normal · 2',
    goalSerious: 'En serio · 3',
    goalEverything: 'Todo',
    goalA11y: (label: string) => `Meta diaria: ${label}`,
    waterIsATask: 'El agua cuenta como tarea diaria',
    waterIsATaskHelp:
      'Activado: cumplir tu meta de agua marca una de tus tareas diarias. Desactivado: el agua solo da XP extra.',
    waterGoal: 'Meta diaria de agua',
    waterGoalA11y: (goal: string) => `Meta de agua ${goal}`,
    reminders: 'Recordatorios de agua',
    waterOff: 'El registro de agua está desactivado. Vuelve a añadirlo desde la pestaña Hábitos.',
    privacy: 'Privacidad',
    privacyBody:
      'HabitFlow guarda tus hábitos, sorbos y racha solo en este dispositivo. No se sube nada a ningún servidor. Los anuncios los sirve Google AdMob.',
    privacyPolicy: 'Política de privacidad',
    adPrivacy: 'Opciones de privacidad de anuncios',
    eraseData: 'Borrar todos mis datos',
    eraseTitle: '¿Borrar todos los datos de HabitFlow?',
    eraseBody:
      'Tus hábitos, historial de sorbos, racha, XP y gemas se guardan solo en este teléfono. Se eliminarán de forma permanente y HabitFlow empezará de cero. Tu idioma y tu apariencia se conservan.',
    about: 'Acerca de',
    version: (version: string) => `HabitFlow ${version}`,
    contactSupport: 'Contactar con soporte',
  },

  habitForm: {
    newTitle: 'Nuevo hábito',
    editTitle: 'Editar hábito',
    name: 'Nombre',
    namePlaceholder: 'p. ej. Sin azúcar',
    nameA11y: 'Nombre del hábito',
    icon: 'Icono',
    iconA11y: (emoji: string) => `Icono ${emoji}`,
    saveNew: 'Guardar hábito',
    saveEdit: 'Guardar cambios',
    nameRequiredTitle: 'Falta el nombre',
    nameRequiredBody: 'Ponle un nombre corto a este hábito.',
    limitTitle: 'Límite de hábitos alcanzado',
    limitBody:
      'Mira un anuncio recompensado desde la pestaña Hábitos para desbloquear más espacios.',
    limitBodyHabitsTab:
      'Mira un anuncio corto desde la pestaña Hábitos para desbloquear más espacios.',
  },

  celebration: {
    titleStreak: '¡Buen trabajo!',
    titleReward: 'Has ganado una recompensa',
    dailyGoal: (streak: number) => `Meta diaria completada · racha de ${streak} días`,
    perfectDay: 'Bonus de día perfecto',
    levelUp: (level: number) => `¡Subiste de nivel! Llegaste al nivel ${level}`,
    xp: (xp: number) => `+${xp} XP`,
    gems: (gems: number) => `+${gems} gemas`,
    keepGoing: 'Seguir',
  },

  achievements: {
    first_goal: { title: 'Primera victoria', description: 'Cumple tu meta diaria' },
    streak_3: { title: 'Cogiendo ritmo', description: 'Llega a una racha de 3 días' },
    streak_7: { title: 'Semana completa', description: 'Llega a una racha de 7 días' },
    streak_14: { title: 'Llama de dos semanas', description: 'Llega a una racha de 14 días' },
    streak_30: { title: 'Leyenda del mes', description: 'Llega a una racha de 30 días' },
    streak_100: { title: 'Centurión', description: 'Llega a una racha de 100 días' },
    first_perfect: { title: 'Día perfecto', description: 'Completa todos los hábitos y el agua' },
    level_5: { title: 'Nivel 5', description: 'Llega al nivel 5' },
    level_10: { title: 'Nivel 10', description: 'Llega al nivel 10' },
    hydrate_7: { title: 'Semana hidratada', description: 'Cumple tu meta de agua 7 días seguidos' },
  },

  notifications: {
    channel: 'Recordatorios de HabitFlow',
    waterTitle: 'Hora de beber agua',
    waterBody: 'Un vaso rápido mantiene viva tu racha de HabitFlow.',
    streakTitle: (days: number): string =>
      days > 0 ? `Tu racha de ${days} días está en peligro` : 'Tu racha está en peligro',
    streakBody: 'Completa la meta de hoy para mantener la llama encendida.',
  },
};
