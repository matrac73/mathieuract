import type { L10n } from "@/lib/i18n";

// Everything personal lives here: edit this file to update the profile pages.
export const site = {
  name: "Mathieu Ract",
  // Lines that take turns under the name on the home page: a person first, not a job title.
  taglines: {
    en: [
      "Between Savoie and Paris.",
      "Between engineering school and business school.",
      "Between alpine passes and Excel sheets.",
      "Between reblochon and quinoa.",
      "Between code and PowerPoint.",
      "Between 2,000 m of climbing and the office lift.",
      "Between artificial intelligence and mountain common sense.",
      "Between serious and slightly mad.",
    ],
    fr: [
      "Entre Savoie et Paris.",
      "Entre école d'ingénieur et école de commerce.",
      "Entre cols alpins et tableurs Excel.",
      "Entre reblochon et quinoa.",
      "Entre code et PowerPoint.",
      "Entre 2 000 m de D+ et l'ascenseur du bureau.",
      "Entre intelligence artificielle et bon sens paysan.",
      "Entre sérieux et brin de folie.",
    ],
  } as Record<"en" | "fr", string[]>,
  url: "https://mathieuract.vercel.app",
  location: "Paris, France",
  contacts: {
    email: "mathieu.ract@gmail.com",
    github: "https://github.com/matrac73",
    linkedin: "", // TODO: paste your LinkedIn URL — hidden while empty
    strava: "", // TODO: paste your Strava profile URL — hidden while empty
  },
};

// Professional summary, shown on the printable CV only.
export const summary: Record<"en" | "fr", string[]> = {
  en: [
    "I trained as an engineer at CentraleSupélec, with a focus on artificial intelligence, then added a business degree at ESSEC, split between Singapore and Paris. I like the place where those two worlds meet: turning a technical possibility into something a team actually uses on a Monday morning.",
    "I learned to build at Safran, where I spent three years on data science and computer vision for landing systems; to structure a problem with BCG X; and to ship generative AI at scale at Onepoint, as tech lead of an internal copilot and right hand to the Chief AI Officer.",
    "Since October 2024 I have been part of Adagia Partners, a private equity firm, as Associate Tech & AI — building the tools and the habits that let an investment team work with AI every day.",
  ],
  fr: [
    "Ingénieur diplômé de CentraleSupélec, spécialisé en intelligence artificielle, j'ai complété mon parcours par le programme Grande École de l'ESSEC, entre Singapour et Paris. J'aime l'endroit où ces deux mondes se rencontrent : transformer une possibilité technique en un outil qu'une équipe utilise vraiment le lundi matin.",
    "J'ai appris à construire chez Safran, pendant trois ans de data science et de vision par ordinateur sur les trains d'atterrissage ; à structurer un problème avec BCG X ; et à déployer l'IA générative à l'échelle chez Onepoint, comme tech lead d'un copilote interne et bras droit du Chief AI Officer.",
    "Depuis octobre 2024, je fais partie d'Adagia Partners, société de private equity, en tant qu'Associate Tech & AI : j'y construis les outils et les réflexes qui permettent à une équipe d'investissement de travailler avec l'IA au quotidien.",
  ],
};

// [WIP] personal note for the Personal page — to be rewritten in your own words.
export const about: Record<"en" | "fr", string[]> = {
  en: ["Away from the screen, I run and I ride. Long distances, preferably uphill. The adventures below are where those days end up."],
  fr: ["Loin de l'écran, je cours et je roule. Longtemps, et de préférence en montée. Les aventures ci-dessous sont l'endroit où ces journées finissent."],
};

type Item = { org: string; role: L10n; place: string; from: string; to: string | null; bullets: Record<"en" | "fr", string[]>; wip?: boolean };

export const experience: Item[] = [
  {
    org: "Adagia Partners",
    role: { en: "Associate Tech & AI", fr: "Associate Tech & AI" },
    place: "Paris",
    from: "Oct 2024",
    to: null,
    wip: true,
    bullets: {
      en: [
        "Design, build and run the firm's internal AI tools, from deal origination to due diligence",
        "Lead tech & AI topics for the investment team and support portfolio companies on their own AI roadmap",
      ],
      fr: [
        "Conception, développement et exploitation des outils d'IA internes, de l'origination aux due diligences",
        "Pilotage des sujets tech & IA pour l'équipe d'investissement et accompagnement des participations sur leur feuille de route IA",
      ],
    },
  },
  {
    org: "Onepoint — Data.IA",
    role: { en: "Apprenticeship (with ESSEC)", fr: "Alternance (avec l'ESSEC)" },
    place: "Paris",
    from: "Sept 2023",
    to: "Sept 2024",
    bullets: {
      en: [
        "Right hand to the Chief AI Officer: executive reports, AI events, presenting AI innovations to consultants",
        "Led Data.AI activities: commercial development, consultant staffing, client and partner engagement",
        "Tech lead for Neo: developed and integrated a secure generative AI copilot for consultants and clients",
        "Responsible AI: shaped Onepoint's environmental strategy and positions for AI, in light of the AI Act",
      ],
      fr: [
        "Bras droit du Chief AI Officer : reportings exécutifs, événements IA, présentation des innovations IA aux consultants",
        "Animation de l'activité Data.IA : développement commercial, staffing, relation clients et partenaires",
        "Tech lead de Neo : développement et intégration d'un copilote d'IA générative sécurisé pour les consultants et les clients",
        "IA responsable : stratégie environnementale et convictions IA de Onepoint, à la lumière de l'AI Act",
      ],
    },
  },
  {
    org: "Boston Consulting Group — X",
    role: { en: "End-of-studies project (CentraleSupélec)", fr: "Projet de fin d'études (CentraleSupélec)" },
    place: "Paris",
    from: "Sept 2021",
    to: "Jun 2022",
    bullets: {
      en: [
        "Initiated and developed the BCG Greener IT project within an experienced consulting team",
        "Applied analytical and problem-solving methods from strategy consulting",
      ],
      fr: [
        "Lancement et développement du projet BCG Greener IT au sein d'une équipe de consultants expérimentés",
        "Mise en pratique des méthodes d'analyse et de résolution de problèmes du conseil en stratégie",
      ],
    },
  },
  {
    org: "Safran — Landing Systems",
    role: { en: "Apprenticeship (with CentraleSupélec)", fr: "Apprentissage (avec CentraleSupélec)" },
    place: "Vélizy-Villacoublay",
    from: "Sept 2019",
    to: "Jun 2022",
    bullets: {
      en: [
        "Built data science algorithms to improve the efficiency of the world's #2 aircraft equipment supplier",
        "Designed and implemented a computer vision algorithm using big data and machine learning",
      ],
      fr: [
        "Développement d'algorithmes de data science pour améliorer l'efficacité du n°2 mondial des équipements aéronautiques",
        "Conception et mise en œuvre d'un algorithme de vision par ordinateur, à base de big data et de machine learning",
      ],
    },
  },
];

export const education: Item[] = [
  {
    org: "ESSEC Business School",
    role: { en: "Master in Management — Grande École programme", fr: "Master in Management — programme Grande École" },
    place: "Singapore · Cergy",
    from: "2022",
    to: "2024",
    bullets: {
      en: ["Track: Business Management in Asia", "Finance, accounting & reporting, strategy & management, negotiation, AI for business"],
      fr: ["Parcours : Business Management in Asia", "Finance, comptabilité & reporting, stratégie & management, négociation, IA pour le business"],
    },
  },
  {
    org: "CentraleSupélec — Université Paris-Saclay",
    role: { en: "Master of Engineering", fr: "Diplôme d'ingénieur" },
    place: "Rennes · Gif-sur-Yvette",
    from: "2019",
    to: "2022",
    bullets: {
      en: ["Digital and computer science track, with a strong focus on artificial intelligence", "Optimisation, algorithms & complexity, advanced statistics, deep learning"],
      fr: ["Filière numérique et informatique, avec une forte dominante intelligence artificielle", "Optimisation, algorithmique & complexité, statistiques avancées, deep learning"],
    },
  },
  {
    org: "Lycée La Martinière Monplaisir",
    role: { en: "Preparatory classes (CPGE), science track", fr: "Classes préparatoires scientifiques (CPGE)" },
    place: "Lyon",
    from: "2017",
    to: "2019",
    bullets: {
      en: ["Intensive programme in mathematics, physics and computer science"],
      fr: ["Programme intensif en mathématiques, physique et informatique"],
    },
  },
];

export const extras: Item[] = [
  {
    org: "Raid CentraleSupélec",
    role: { en: "Race opening manager", fr: "Responsable ouverture de course" },
    place: "Gif-sur-Yvette",
    from: "2020",
    to: "2021",
    bullets: {
      en: ["Part of the core team organising Europe's leading student adventure race; led the 3-person race-opening unit"],
      fr: ["Membre de l'équipe d'organisation du premier raid étudiant d'Europe ; responsable du pôle ouverture (3 personnes)"],
    },
  },
  {
    org: "BCG X Data Challenge",
    role: { en: "Team lead — BCG Gamma × CentraleSupélec case", fr: "Chef d'équipe — cas BCG Gamma × CentraleSupélec" },
    place: "Paris",
    from: "Dec 2021",
    to: "Dec 2021",
    bullets: {
      en: ["Led a team of 4 on a client case: optimised a delivery company's fleet strategy with mathematical and deep learning techniques"],
      fr: ["Pilotage d'une équipe de 4 sur un cas client : optimisation de la stratégie de flotte d'un livreur par des méthodes mathématiques et de deep learning"],
    },
  },
];

export const skills: { label: L10n; items: string[] }[] = [
  { label: { en: "Generative AI", fr: "IA générative" }, items: ["LLM apps & agents", "RAG", "OpenAI", "Mistral AI", "Claude", "LangChain", "Evaluation"] },
  { label: { en: "Data science", fr: "Data science" }, items: ["Python", "pandas", "scikit-learn", "Deep learning", "Computer vision", "Time series"] },
  { label: { en: "Engineering & cloud", fr: "Ingénierie & cloud" }, items: ["Azure", "AWS", "GCP", "TypeScript", "React / Next.js", "Git", "CI/CD"] },
  { label: { en: "Business", fr: "Business" }, items: ["Strategy & problem structuring", "Private equity workflows", "Project management", "PowerPoint", "Excel"] },
];

export const languages: { name: L10n; level: L10n }[] = [
  { name: { en: "French", fr: "Français" }, level: { en: "Native", fr: "Langue maternelle" } },
  { name: { en: "English", fr: "Anglais" }, level: { en: "Fluent — IELTS 7.5, Cambridge C1+", fr: "Courant — IELTS 7,5, Cambridge C1+" } },
  { name: { en: "Spanish", fr: "Espagnol" }, level: { en: "Intermediate", fr: "Intermédiaire" } },
  { name: { en: "Chinese", fr: "Chinois" }, level: { en: "Beginner — HSK 2", fr: "Débutant — HSK 2" } },
];

export const interests: { label: L10n; text: L10n; cvOnly?: boolean }[] = [
  {
    label: { en: "Running", fr: "Course à pied" },
    text: {
      en: "Paris Marathon 2021; Angkor Wat and Paris half-marathons 2022; French championships 2017.",
      fr: "Marathon de Paris 2021 ; semi-marathons d'Angkor Wat et de Paris 2022 ; championnats de France 2017.",
    },
  },
  {
    label: { en: "Road cycling", fr: "Cyclisme sur route" },
    text: {
      en: "L'Étape du Tour 2023 and 2024; crossing the Alps from Zurich to Albertville in 2026.",
      fr: "Étape du Tour 2023 et 2024 ; traversée des Alpes de Zurich à Albertville en 2026.",
    },
  },
  {
    label: { en: "Skiing", fr: "Ski" },
    text: { en: "Competitive skiing; French championships 2013.", fr: "Ski de compétition ; championnats de France 2013." },
  },
  {
    cvOnly: true,
    label: { en: "Sustainability", fr: "Durabilité" },
    text: {
      en: "Volunteer with the DataForGood collective, estimating the environmental footprint of generative AI.",
      fr: "Bénévole au sein du collectif DataForGood, sur l'estimation de l'empreinte environnementale de l'IA générative.",
    },
  },
];

export type Project = { name: string; desc: L10n; lang: string; url: string; live?: string; updated: string };
const gh = (n: string) => `https://github.com/matrac73/${n}`;
export const projects: Project[] = [
  { name: "daily-builds", lang: "JavaScript", url: gh("daily-builds"), live: "https://matrac73.github.io/daily-builds/", updated: "2026-11",
    desc: { en: "One small app shipped every day by an autonomous coding agent, with a live showcase.", fr: "Une petite application livrée chaque jour par un agent de code autonome, avec une vitrine en ligne." } },
  { name: "wisprMR", lang: "Python", url: gh("wisprMR"), updated: "2026-10",
    desc: { en: "Local, offline push-to-talk dictation for Windows and macOS: streaming faster-whisper transcription with optional Ollama polishing.", fr: "Dictée push-to-talk locale et hors ligne pour Windows et macOS : transcription faster-whisper en continu, reformulation Ollama en option." } },
  { name: "case-me-now", lang: "Python", url: gh("case-me-now"), updated: "2026-10",
    desc: { en: "AI sparring partner for consulting case interviews: a Mistral-powered interviewer with retrieval and voice in/out.", fr: "Partenaire d'entraînement IA pour les entretiens de cas : un intervieweur propulsé par Mistral, avec recherche documentaire et voix." } },
  { name: "xlsx_analyser_llm", lang: "Python", url: gh("xlsx_analyser_llm"), updated: "2026-10",
    desc: { en: "Upload an Excel workbook, get an LLM-written analysis: map-reduce summarisation with LangChain and Azure OpenAI.", fr: "Déposez un classeur Excel, recevez une analyse rédigée par un LLM : synthèse map-reduce avec LangChain et Azure OpenAI." } },
  { name: "siteweb_creator", lang: "TypeScript", url: gh("siteweb_creator"), live: "https://sitewebcreator.vercel.app", updated: "2026-10",
    desc: { en: "Premium showcase website for an interior-design studio, built with Next.js, TypeScript and Framer Motion.", fr: "Site vitrine haut de gamme pour un studio d'architecture d'intérieur, en Next.js, TypeScript et Framer Motion." } },
  { name: "APAC_cleaner", lang: "TypeScript", url: gh("APAC_cleaner"), updated: "2026-10",
    desc: { en: "Interactive carbon-footprint dashboard (energy, waste, water, travel) built with React and Chart.js.", fr: "Tableau de bord interactif d'empreinte carbone (énergie, déchets, eau, déplacements) en React et Chart.js." } },
  { name: "Projet_DL", lang: "C++ / Python", url: gh("Projet_DL"), updated: "2026-10",
    desc: { en: "Detecting and transcribing serial numbers on aircraft parts with deep learning (EAST text detection + OCR).", fr: "Détection et transcription de numéros de série sur des pièces d'avion par deep learning (détection EAST + OCR)." } },
  { name: "Drinking_Water_Potability", lang: "Jupyter", url: gh("Drinking_Water_Potability"), updated: "2026-10",
    desc: { en: "Predicting drinking-water potability from physico-chemical measurements: EDA, model benchmark and tuning.", fr: "Prédiction de la potabilité de l'eau à partir de mesures physico-chimiques : EDA, comparaison de modèles et tuning." } },
  { name: "Projet_SMA", lang: "Python", url: gh("Projet_SMA"), updated: "2026-10",
    desc: { en: "Prey–predator multi-agent simulation (wolves, sheep, grass) built with Mesa, with a browser visualisation.", fr: "Simulation multi-agents proies–prédateurs (loups, moutons, herbe) avec Mesa et visualisation dans le navigateur." } },
  { name: "everybody-codes", lang: "Python", url: gh("everybody-codes"), updated: "2026-11",
    desc: { en: "My Everybody Codes puzzle solutions.", fr: "Mes solutions aux énigmes Everybody Codes." } },
  { name: "card-memory-game", lang: "JavaScript", url: gh("card-memory-game"), live: "https://matrac73.github.io/card-memory-game/", updated: "2026-10",
    desc: { en: "Timed n×n card-matching memory game in vanilla JS, with 3D flips, difficulty levels and persistent stats.", fr: "Jeu de memory n×n chronométré en JavaScript pur, avec retournements 3D, niveaux de difficulté et statistiques." } },
  { name: "game-suggestion-app", lang: "Python", url: gh("game-suggestion-app"), updated: "2026-10",
    desc: { en: "Terminal polls where friends suggest and vote for the next game to play, with ranked results.", fr: "Sondages en terminal où des amis proposent et votent pour le prochain jeu, avec classement." } },
];

// ---------------------------------------------------------------------------
// The path, drawn as a two-lane timeline on the Pro / Academic page:
// an academic lane above the time axis, a professional lane below; periods overlap.
// `level` = height of the block (1–3), `row` = 1 for a period stacked on another one.
// [WIP] the first three periods (dates, wording) are assumptions to confirm.
// ---------------------------------------------------------------------------
export type Stage = { id: string; lane: "acad" | "pro"; start: string; end: string | null; level: number; row?: number; short: string; title: L10n; place: L10n; text: L10n; slug?: string; wip?: boolean };
export const life: Stage[] = [
  { id: "ugine", lane: "acad", start: "2013-09", end: "2015-06", level: 1, short: "UGINE", wip: true,
    title: { en: "High school in Savoie", fr: "Lycée en Savoie" }, place: { en: "Ugine, Savoie", fr: "Ugine, Savoie" },
    text: { en: "High school at the foot of the slopes. The skis are never far from the school bag.", fr: "Le lycée au pied des pistes. Les skis ne sont jamais loin du cartable." } },
  { id: "usa", lane: "acad", start: "2015-08", end: "2016-06", level: 1, short: "USA", wip: true,
    title: { en: "United States", fr: "États-Unis" }, place: { en: "United States", fr: "États-Unis" },
    text: { en: "Off to the United States: high school in its original version.", fr: "Cap sur les États-Unis : le lycée en version originale." } },
  { id: "lyon", lane: "acad", start: "2016-09", end: "2017-06", level: 1, short: "LYON", wip: true,
    title: { en: "Final year of high school", fr: "Terminale" }, place: { en: "Lyon", fr: "Lyon" },
    text: { en: "Back in France for the final year, in Lyon. One target: the baccalauréat.", fr: "Retour en France pour la terminale, à Lyon. Un objectif : le bac." } },
  { id: "prepa", lane: "acad", start: "2017-09", end: "2019-06", level: 2, short: "PRÉPA", slug: "prepa",
    title: { en: "Preparatory classes", fr: "Classes préparatoires" }, place: { en: "La Martinière Monplaisir, Lyon", fr: "La Martinière Monplaisir, Lyon" },
    text: { en: "Two years of maths, physics and computer science — and oral exams at the blackboard.", fr: "Deux ans de maths, de physique et d'informatique — et de khôlles au tableau." } },
  { id: "cs", lane: "acad", start: "2019-09", end: "2022-06", level: 3, short: "CENTRALESUPÉLEC", slug: "centralesupelec",
    title: { en: "CentraleSupélec", fr: "CentraleSupélec" }, place: { en: "Rennes · Gif-sur-Yvette", fr: "Rennes · Gif-sur-Yvette" },
    text: { en: "Engineering school, digital track, with a strong focus on artificial intelligence.", fr: "École d'ingénieur, filière numérique, forte dominante intelligence artificielle." } },
  { id: "essec", lane: "acad", start: "2022-09", end: "2024-09", level: 3, short: "ESSEC", slug: "essec",
    title: { en: "ESSEC Business School", fr: "ESSEC Business School" }, place: { en: "Singapore · Cergy", fr: "Singapour · Cergy" },
    text: { en: "Business after engineering, between Singapore and Paris.", fr: "Le business après l'ingénierie, entre Singapour et Paris." } },
  { id: "safran", lane: "pro", start: "2019-09", end: "2022-06", level: 2, short: "SAFRAN", slug: "safran",
    title: { en: "Safran Landing Systems", fr: "Safran Landing Systems" }, place: { en: "Vélizy-Villacoublay", fr: "Vélizy-Villacoublay" },
    text: { en: "Three years as an apprentice: data science and computer vision for landing gear.", fr: "Trois ans d'apprentissage : data science et vision par ordinateur pour les trains d'atterrissage." } },
  { id: "bcg", lane: "pro", start: "2021-09", end: "2022-06", level: 1, row: 1, short: "BCG X", slug: "bcg-x",
    title: { en: "BCG X", fr: "BCG X" }, place: { en: "Paris", fr: "Paris" },
    text: { en: "End-of-studies project with a consulting team: BCG Greener IT.", fr: "Projet de fin d'études au sein d'une équipe de consultants : BCG Greener IT." } },
  { id: "onepoint", lane: "pro", start: "2023-09", end: "2024-09", level: 2, short: "ONEPOINT", slug: "onepoint",
    title: { en: "Onepoint", fr: "Onepoint" }, place: { en: "Paris", fr: "Paris" },
    text: { en: "Tech lead of Neo, a generative AI copilot, and right hand to the Chief AI Officer.", fr: "Tech lead de Neo, copilote d'IA générative, et bras droit du Chief AI Officer." } },
  { id: "adagia", lane: "pro", start: "2024-10", end: null, level: 3, short: "ADAGIA", slug: "adagia",
    title: { en: "Adagia Partners", fr: "Adagia Partners" }, place: { en: "Paris", fr: "Paris" },
    text: { en: "Associate Tech & AI in a private equity firm: AI tools an investment team uses every day.", fr: "Associate Tech & AI dans une société de private equity : des outils d'IA qu'une équipe d'investissement utilise au quotidien." } },
];

// Reverse-chronological career, scrolled through under the timeline. `scene` picks the cube illustration;
// `slug` is the address of the detail page (/experience/<slug>) — its long text lives in content/experiences/<slug>.<locale>.md
export type CareerItem = Item & { slug: string; scene: string; start: string; end: string | null }; // start/end as YYYY-MM, used to place articles
const withScene = (it: Item, slug: string, scene: string, start: string, end: string | null): CareerItem => ({ ...it, slug, scene, start, end });
export const career: CareerItem[] = [
  withScene(experience[0], "adagia", "bars", "2024-10", null),
  withScene(experience[1], "onepoint", "chat", "2023-09", "2024-09"),
  withScene(education[0], "essec", "skyline", "2022-09", "2023-08"),
  withScene(experience[2], "bcg-x", "matrix", "2021-09", "2022-06"),
  withScene(extras[0], "raid", "mountain", "2020-09", "2021-08"),
  withScene(experience[3], "safran", "plane", "2019-09", "2022-06"),
  withScene(education[1], "centralesupelec", "pyramid", "2019-09", "2022-06"),
  withScene(education[2], "prepa", "books", "2017-09", "2019-06"),
];