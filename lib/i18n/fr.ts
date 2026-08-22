import type { Messages } from '@/lib/i18n/en';

export const fr: Messages = {
  code: 'fr',
  name: 'Français',

  formatMl: (ml: number) => {
    if (ml >= 1000) {
      const liters = ml / 1000;
      const value = liters % 1 === 0 ? liters.toFixed(0) : liters.toFixed(1);
      return `${value.replace('.', ',')} L`;
    }
    return `${ml} ml`;
  },

  dates: {
    months: [
      'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
      'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
    ],
    weekdayInitials: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
    long: (date: Date) =>
      `${date.getDate()} ${fr.dates.months[date.getMonth()]} ${date.getFullYear()}`,
    chartDay: (date: Date) => `${date.getDate()} ${fr.dates.months[date.getMonth()]}`,
    chartMonth: (date: Date) =>
      `${fr.dates.months[date.getMonth()]} '${String(date.getFullYear()).slice(2)}`,
    range: (from: string, to: string, days: number) => `${from} → ${to} · ${days} jours`,
  },

  common: {
    loading: 'Chargement…',
    cancel: 'Annuler',
    delete: 'Supprimer',
    remove: 'Retirer',
    erase: 'Effacer',
    days: (n: number) => `${n} jour${n > 1 ? 's' : ''}`,
  },

  notFound: {
    header: 'Oups !',
    title: "Cette page n'existe pas.",
    home: "Aller à l'accueil",
  },

  tabs: {
    today: "Aujourd'hui",
    habits: 'Habitudes',
    progress: 'Progrès',
    settings: 'Réglages',
    habit: 'Habitude',
    waterHistory: "Historique de l'eau",
  },

  today: {
    loading: 'Chargement de HabitFlow…',
    greeting: (hour: number) =>
      hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir',
    subtitleComplete: 'Objectif du jour atteint. Beau travail.',
    subtitleNoGoal: 'Ajoutez une habitude pour lancer votre première série.',
    subtitleWaterLeft: (left: string, done: number, need: number) =>
      `Il reste ${left} d'eau · ${done}/${need} tâches faites`,
    subtitleTasks: (done: number, need: number) => `${done}/${need} tâches faites aujourd'hui`,
    waterIsATask: 'Compte comme une tâche du jour',
    addWaterA11y: (ml: number) => `Ajouter ${ml} millilitres d'eau`,
    undo: 'Annuler la dernière gorgée',
    habitsSection: 'Habitudes du jour',
    emptyTitle: 'Aucune habitude',
    emptyBody: "Ajoutez votre première habitude et lancez votre série dès aujourd'hui.",
    emptyCta: 'Ajouter une habitude',
  },

  streakHeader: {
    streak: 'série',
    gems: 'gemmes',
    level: 'niveau',
  },

  dailyGoal: {
    title: 'Objectif du jour',
    titleComplete: 'Objectif du jour atteint',
    titleEmpty: "Pas encore d'objectif",
    captionEmpty: "Ajoutez une habitude ou activez le suivi de l'eau pour lancer une série.",
    captionMet: "Votre flamme est sauvée pour aujourd'hui.",
    captionLeft: (left: number) =>
      `Encore ${left} tâche${left > 1 ? 's' : ''} pour garder votre série.`,
    a11y: (done: number, need: number) => `Objectif du jour : ${done} tâches sur ${need}`,
    chipHabits: (done: number, total: number) => `✅ ${done}/${total} habitudes`,
    chipWater: '💧 Eau',
    chipWaterDone: '💧 Eau faite',
  },

  waterRing: {
    a11y: (ml: string, goal: string, percent: number) =>
      `Eau : ${ml} sur ${goal}, ${percent} pour cent`,
    of: (goal: string, percent: number) => `sur ${goal} · ${percent} %`,
  },

  habits: {
    title: 'Vos habitudes',
    meta: (used: number, total: number) =>
      `${used} / ${total} emplacements · appuyez sur Modifier pour renommer · appui long pour supprimer`,
    waterTracking: "Suivi de l'eau",
    waterMeta: (ml: string, goal: string) => `${ml} / ${goal} · appui long pour retirer`,
    waterHint: "Appui long pour retirer le suivi de l'eau",
    addWaterTracking: "💧 Ajouter le suivi de l'eau",
    addHabit: '+ Ajouter une habitude',
    addHabitA11y: 'Ajouter une habitude',
    unlockCta: (slots: number) => `🎬 Regarder une pub pour ${slots} habitudes de plus`,
    unlockA11y: (slots: number) =>
      `Regarder une publicité pour débloquer ${slots} emplacements d'habitude`,
    hint: (free: number, extra: number) =>
      `${free} habitudes sont gratuites. Regarder une courte publicité débloque ${extra} emplacements de plus et garde HabitFlow gratuit pour tout le monde. Le suivi de l'eau n'utilise jamais d'emplacement.`,
    deleteTitle: "Supprimer l'habitude ?",
    removeWaterTitle: "Retirer le suivi de l'eau ?",
    removeWaterBody:
      'Vous pourrez le réactiver plus tard. Votre historique de gorgées reste sur ce téléphone.',
    startStreak: "Lancez une série aujourd'hui",
    dayStreak: (days: number) => `🔥 série de ${days} jour${days > 1 ? 's' : ''}`,
    edit: 'Modifier',
    editA11y: (name: string) => `Modifier ${name}`,
    rowA11y: (name: string, streak: number) =>
      streak > 0 ? `${name}, série de ${streak} jours` : name,
    rowHint: 'Appuyez deux fois pour cocher, appui long pour supprimer',
  },

  rewards: {
    unavailableTitle: 'Récompense indisponible',
    adFailedBody:
      "La publicité n'a pas fini de charger. Vérifiez votre connexion et réessayez dans un instant.",
    noAdHabitsBody: (free: number) =>
      `Aucune publicité disponible pour le moment. Vos ${free} habitudes gratuites restent accessibles.`,
    noAdBody: 'Aucune publicité disponible pour le moment. Réessayez plus tard.',
    freezeReadyTitle: 'Gel de série prêt',
    freezeReadyBody: 'Si vous manquez un jour, un gel gardera votre flamme.',
    freezeFullTitle: 'Inventaire plein',
    freezeFullBody: (max: number) => `Vous avez déjà ${max} gels de série.`,
  },

  progress: {
    title: 'Progrès',
    meta: (streak: number, best: number, freezes: number) =>
      `🔥 série de ${streak} jours · record ${best} · ${freezes} gel${freezes > 1 ? 's' : ''}`,
    thisWeek: 'Cette semaine',
    dayGoalMet: 'objectif atteint',
    dayFrozen: 'gel de série utilisé',
    dayMissed: 'objectif manqué',
    dayA11y: (date: string, status: string) => `${date} : ${status}`,
    level: (level: number, into: number, total: number) => `Niveau ${level} · ${into}/${total} XP`,
    xpLine: (xp: number, gems: number) => `${xp} XP au total · 💎 ${gems} gemmes`,
    freezeCta: '❄️ Regarder une pub pour un gel de série',
    freezeA11y: 'Regarder une publicité pour un gel de série',
    achievements: 'Succès',
    badgeA11y: (title: string, description: string, unlocked: boolean) =>
      `${title} : ${description}. ${unlocked ? 'Débloqué' : 'Verrouillé'}`,
  },

  hydration: {
    title: 'Hydratation',
    header: (ml: string, goal: string) => `${ml} / ${goal}`,
    footer: (total: string, average: string, met: number, days: number) =>
      `${total} sur ${days} jours · ${average} par jour · objectif atteint ${met}/${days}`,
    allTime: (total: string, days: number) =>
      `Depuis le début · ${total} sur ${days} jour${days > 1 ? 's' : ''}`,
    allTimeEmpty: 'Historique complet',
    seeAll: 'Tout voir →',
    cardA11y: "Historique de l'eau : ouvrir le graphique complet",
    barA11y: (date: string, ml: string, goal: string, met: boolean) =>
      `${date} : ${ml} sur ${goal}${met ? ', objectif atteint' : ''}`,
  },

  waterHistory: {
    ranges: { '7d': '7J', '30d': '30J', '1y': '1A', all: 'Tout' },
    rangeA11y: {
      '7d': '7 derniers jours',
      '30d': '30 derniers jours',
      '1y': 'Année écoulée',
      all: 'Depuis le début',
    },
    dailyAverage: 'Moyenne par jour',
    percentOfGoal: (percent: number) => `${percent} % de l'objectif`,
    bucketDay: 'Un point par jour',
    bucketWeek: 'Un point par semaine — moyenne par jour',
    bucketMonth: 'Un point par mois — moyenne par jour',
    legendGoal: (goal: string) => `Objectif ${goal}`,
    legendAverage: 'Votre moyenne',
    chartA11y: (bucket: string, average: string, goal: string) =>
      `Graphique de consommation d'eau. ${bucket}. Moyenne de ${average} par jour pour un objectif de ${goal}.`,
    daysOnGoal: 'Jours réussis',
    daysOnGoalHint: (percent: number) => `${percent} % des jours`,
    totalVolume: 'Volume total',
    totalVolumeHint: (days: number) => `${days} jour${days > 1 ? 's' : ''} enregistré${days > 1 ? 's' : ''}`,
    bestDay: 'Meilleur jour',
    bestDayEmpty: 'Aucune eau enregistrée',
    trackingSince: 'Suivi depuis',
    trackingSinceHint: (days: number) => `${days} jours d'historique`,
    emptyTitle: "Rien d'enregistré",
    emptyBody:
      "Ajoutez de l'eau depuis l'onglet Aujourd'hui et ce graphique se remplira. Les totaux quotidiens sont conservés indéfiniment : vous les retrouverez dans des années.",
    footnote:
      "Chaque gorgée est gardée 90 jours ; le total de chaque journée est gardé pour toujours, donc la vue Tout s'allonge année après année.",
  },

  settings: {
    title: 'Réglages',
    appearance: 'Apparence',
    appearanceSystem: (current: string) =>
      `Suit votre téléphone — actuellement ${current}. Choisissez Clair ou Sombre pour garder HabitFlow sur un seul thème quoi que fasse votre téléphone.`,
    appearanceFixed: (choice: string) =>
      `HabitFlow reste en mode ${choice} même quand votre téléphone change.`,
    themeSystem: '⚙️ Système',
    themeLight: '☀️ Clair',
    themeDark: '🌙 Sombre',
    schemeLight: 'clair',
    schemeDark: 'sombre',
    themeA11y: (choice: string) => `Apparence : ${choice}`,
    language: 'Langue',
    languageSystem: (current: string) =>
      `Suit votre téléphone — actuellement ${current}. Choisissez une langue pour garder HabitFlow dedans quoi que fasse votre téléphone.`,
    languageFixed: (current: string) => `HabitFlow reste en ${current}.`,
    languageSystemChip: '⚙️ Système',
    languageA11y: (choice: string) => `Langue : ${choice}`,
    dailyGoal: 'Objectif du jour',
    dailyGoalHelpWater:
      "Terminez ce nombre de tâches pour garder votre flamme. Votre objectif d'eau en compte comme une.",
    dailyGoalHelp:
      "Terminez ce nombre d'habitudes pour garder votre flamme. Si vous avez moins d'habitudes, l'objectif s'ajuste.",
    goalCasual: 'Tranquille · 1',
    goalRegular: 'Régulier · 2',
    goalSerious: 'Sérieux · 3',
    goalEverything: 'Tout',
    goalA11y: (label: string) => `Objectif du jour : ${label}`,
    waterIsATask: "L'eau compte comme une tâche du jour",
    waterIsATaskHelp:
      "Activé : atteindre votre objectif d'eau coche une de vos tâches du jour. Désactivé : l'eau ne rapporte que de l'XP bonus.",
    waterGoal: "Objectif d'eau quotidien",
    waterGoalA11y: (goal: string) => `Objectif d'eau ${goal}`,
    reminders: "Rappels d'eau",
    waterOff: "Le suivi de l'eau est désactivé. Réactivez-le depuis l'onglet Habitudes.",
    privacy: 'Confidentialité',
    privacyBody:
      'HabitFlow garde vos habitudes, vos gorgées et votre série uniquement sur cet appareil. Rien n’est envoyé à un serveur. Les publicités sont diffusées par Google AdMob.',
    privacyPolicy: 'Politique de confidentialité',
    adPrivacy: 'Options de confidentialité des publicités',
    eraseData: 'Effacer toutes mes données',
    eraseTitle: 'Effacer toutes les données HabitFlow ?',
    eraseBody:
      'Vos habitudes, votre historique de gorgées, votre série, votre XP et vos gemmes ne sont stockés que sur ce téléphone. Ils seront définitivement supprimés et HabitFlow repartira de zéro. Votre langue et votre apparence sont conservées.',
    about: 'À propos',
    version: (version: string) => `HabitFlow ${version}`,
    contactSupport: 'Contacter le support',
  },

  habitForm: {
    newTitle: 'Nouvelle habitude',
    editTitle: "Modifier l'habitude",
    name: 'Nom',
    namePlaceholder: 'ex. Zéro sucre',
    nameA11y: "Nom de l'habitude",
    icon: 'Icône',
    iconA11y: (emoji: string) => `Icône ${emoji}`,
    saveNew: "Enregistrer l'habitude",
    saveEdit: 'Enregistrer les modifications',
    nameRequiredTitle: 'Nom requis',
    nameRequiredBody: 'Donnez un nom court à cette habitude.',
    limitTitle: "Limite d'habitudes atteinte",
    limitBody:
      "Regardez une publicité récompensée depuis l'onglet Habitudes pour débloquer plus d'emplacements.",
    limitBodyHabitsTab:
      "Regardez une courte publicité depuis l'onglet Habitudes pour débloquer plus d'emplacements.",
  },

  celebration: {
    titleStreak: 'Bravo !',
    titleReward: 'Vous avez gagné une récompense',
    dailyGoal: (streak: number) => `Objectif du jour atteint · série de ${streak} jours`,
    perfectDay: 'Bonus journée parfaite',
    levelUp: (level: number) => `Niveau supérieur ! Vous atteignez le niveau ${level}`,
    xp: (xp: number) => `+${xp} XP`,
    gems: (gems: number) => `+${gems} gemmes`,
    keepGoing: 'Continuer',
  },

  achievements: {
    first_goal: { title: 'Première victoire', description: 'Atteindre son objectif du jour' },
    streak_3: { title: 'Bien lancé', description: 'Atteindre une série de 3 jours' },
    streak_7: { title: 'Semaine parfaite', description: 'Atteindre une série de 7 jours' },
    streak_14: { title: 'Flamme de deux semaines', description: 'Atteindre une série de 14 jours' },
    streak_30: { title: 'Légende du mois', description: 'Atteindre une série de 30 jours' },
    streak_100: { title: 'Centurion', description: 'Atteindre une série de 100 jours' },
    first_perfect: {
      title: 'Journée parfaite',
      description: "Terminer toutes ses habitudes et son eau",
    },
    level_5: { title: 'Niveau 5', description: 'Atteindre le niveau 5' },
    level_10: { title: 'Niveau 10', description: 'Atteindre le niveau 10' },
    hydrate_7: {
      title: 'Semaine hydratée',
      description: "Atteindre son objectif d'eau 7 jours d'affilée",
    },
  },

  notifications: {
    channel: 'Rappels HabitFlow',
    waterTitle: "C'est l'heure de boire",
    waterBody: 'Un verre rapide garde votre série HabitFlow en vie.',
    streakTitle: (days: number) =>
      days > 0 ? `Votre série de ${days} jours est en danger` : 'Votre série est en danger',
    streakBody: 'Terminez votre objectif du jour pour garder la flamme.',
  },
};
