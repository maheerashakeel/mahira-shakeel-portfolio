// All site text and project data lives here. Change it and the whole site follows.
// Phone number is intentionally NOT included (public site).

export type Mood =
  | 'happy'
  | 'curious'
  | 'excited'
  | 'proud'
  | 'thinking'
  | 'playful'
  | 'celebrate'
  | 'shy'
  | 'working'
  | 'listening'
  | 'confused'
  | 'surprised'
  | 'sad'

export const moods: Mood[] = ['happy', 'proud', 'excited', 'curious', 'thinking', 'playful', 'working', 'listening', 'shy', 'surprised']

export type Project = {
  id: string
  title: string
  summary: string
  credit: string // who the work was for, shown under the summary
  stack: string[]
  say: string // what the guide explains when this project is clicked
  mood: Mood
  url: string
  linkLabel?: string // defaults to Visit <title>
  shot: string // screenshot shown in the frame, also the poster while a video loads
  world: string // soft backdrop behind it
  frame: 'monitor' | 'phone'
  video?: string // silent demo: plays in the frame, or opens on click for phone apps
  tagline?: string // one short line under a phone app in the Mobile apps row
}

export type Job = { id: string; date: string; title: string; role: string; say: string }
export type SkillGroup = { id: string; title: string; items: string; say: string }

export type SiteContent = {
  seo: { title: string; description: string }
  nav: { name: string; work: string; workSay: string; about: string; aboutSay: string; contact: string; contactSay: string }
  hero: {
    greeting: string
    summary: string
    cta: string
    ctaSay: string
    cvLabel: string
    city: string
    status: string
    photo: string
  }
  buddy: { greeting: string; tip: string }
  projects: Project[]
  about: { heading: string; headingSay: string; note: string; noteSay: string }
  jobs: Job[]
  skills: SkillGroup[]
  contact: {
    heading: string
    lead: string
    nameLabel: string
    emailLabel: string
    messageLabel: string
    button: string
    note: string
    sentNote: string
    footer: string
  }
  links: { email: string; linkedin: string; github: string; repo: string; cv: string }
}

export const defaultContent: SiteContent = {
  seo: {
    title: 'Mahira Shakeel | Full-Stack Developer',
    description:
      'Mahira Shakeel is a full-stack developer in Karachi who builds software that helps people learn: a school system in production, an AI learning platform, a kids money app and an app for flower growers.',
  },
  nav: {
    name: 'Mahira Shakeel',
    work: 'Work',
    workSay: 'Products Mahira built. Scroll and each one comes to you.',
    about: 'About',
    aboutSay: 'A short intro, her jobs, and the tools she uses.',
    contact: 'Contact',
    contactSay: 'The form is at the bottom. I will wait next to it.',
  },
  hero: {
    greeting: "Hi, I'm Mahira.",
    summary:
      "Full-stack developer and Computer Science graduate from Bahria University Karachi. I work as an Associate Full-Stack Developer at Knowfinity on a live .NET project, and I've built and shipped production apps with PHP, Next.js and React Native.",
    cta: 'View my work',
    ctaSay: "This takes you to Mahira's products. Keep scrolling, I will come along.",
    cvLabel: 'Download CV',
    city: 'Karachi',
    status: 'Open to full-stack roles',
    photo: '/img/mahira.webp',
  },
  buddy: {
    greeting: 'Hi! Click anything and I will come over and explain it.',
    tip: 'Click anything on the page and I will fly over and explain it.',
  },
  projects: [
    {
      id: 'isims',
      title: 'iSIMS',
      summary:
        'One system that runs a whole school, from admission to ID card. Many schools share it, it has its own Flutter app, and real schools use it every day.',
      credit: "A Knowfinity.ai product. I built the full stack as part of my work there, and it is shown here with the company's permission.",
      stack: ['PHP', 'MySQL / MariaDB', 'Flutter', 'Ubuntu + nginx'],
      say: 'iSIMS runs a whole school, from admission to ID card, and many schools share one system. It is live on a real server right now, not a demo.',
      mood: 'proud',
      url: 'https://isims.knowfinity.ai',
      shot: '/img/work/isims.webp',
      world: '/img/world/isims.webp',
      frame: 'monitor',
    },
    {
      id: 'ilmify',
      title: 'ilmiFy',
      summary:
        'Record a lecture and get back a transcript, notes, slides and a quiz. Students can learn on their own, and schools get a full LMS for students, faculty and admins.',
      credit: "A Knowfinity.ai product. I built the full stack as part of my work there, and it is shown here with the company's permission.",
      stack: ['Next.js', 'Expo / React Native', 'NestJS', 'Prisma', 'PostgreSQL'],
      say: 'Drop in a recorded lecture and ilmiFy hands back notes, slides and a quiz. Students and faculty each get their own portal.',
      mood: 'excited',
      url: 'https://ilmify.knowfinity.ai',
      shot: '/img/work/ilmify.webp',
      world: '/img/world/ilmify.webp',
      frame: 'monitor',
    },
    {
      id: 'haven',
      title: 'Haven',
      summary:
        'Kids learn money by practising it. Families share one account with allowances, spending limits and parent approvals, and an AI coach adds short tips along the way.',
      credit: "A Spark Tank startup project by Beaconhouse students. I designed and built the MVP. Currently hosted on the Knowfinity website.",
      stack: ['React Native / Expo', 'Next.js', 'Supabase', 'Gemini'],
      say: 'Haven lets a family share one account. Kids get an allowance and limits, parents approve, and an AI coach adds short tips.',
      mood: 'happy',
      url: 'https://knowfinity.ai/haven',
      shot: '/img/work/haven.webp',
      world: '/img/world/haven.webp',
      frame: 'monitor',
    },
    {
      id: 'native-blooms',
      title: 'Native Blooms',
      summary:
        'For flower growers in Pakistan, in English and Urdu. Take a photo of a plant and it checks the plant, reads the weather and soil, and says what to plant and when.',
      credit: "A Spark Tank startup project by Beaconhouse students. I designed and built the MVP. Currently hosted on the Knowfinity website.",
      stack: ['PHP', 'MySQL', 'Gemini', 'Android'],
      say: 'Growers take a photo of a plant, and the app reads it, checks weather and soil, and says when to plant. It works in English and Urdu.',
      mood: 'curious',
      url: 'https://knowfinity.ai/nativeblooms/',
      shot: '/img/work/nativeblooms.webp',
      world: '/img/world/nativeblooms.webp',
      frame: 'monitor',
    },
    {
      id: 'fitpulse',
      title: 'FitPulse',
      summary:
        'A fitness tracking app with activity rings, a workout library, a live session timer and progress charts drawn by hand in Flutter. The video is the real app in use.',
      credit: "Personal project.",
      stack: ['Flutter', 'Dart', 'Provider'],
      say: 'This is the real app running. Watch it go from the home screen to a live workout, then progress charts and profile.',
      mood: 'excited',
      url: '',
      shot: '/img/work/fitpulse.webp',
      world: '/img/world/fitpulse.webp',
      frame: 'phone',
      video: '/video/fitpulse.mp4',
      tagline: 'Workouts, live sessions and progress in one fitness app.',
    },
    {
      id: 'fridge2recipe',
      title: 'Fridge2Recipe',
      summary:
        'Take a photo of your fridge and AI lists the ingredients. Pick a cuisine and a meal, get a recipe made from what you have, and save it on your phone.',
      credit: 'Personal project.',
      stack: ['React Native', 'Expo', 'Gemini', 'Pexels'],
      say: 'This is the real app running: a fridge photo goes in, AI lists the ingredients, and a recipe comes out.',
      mood: 'excited',
      url: '',
      shot: '/img/work/fridge2recipe.webp',
      world: '/img/world/fridge2recipe.webp',
      frame: 'phone',
      video: '/video/fridge2recipe.mp4',
      tagline: 'Snap your fridge, get a recipe from what you have.',
    },
    {
      id: 'haven-app',
      title: 'Haven',
      summary:
        'Kids learn money by practising it. Families share one account with allowances, spending limits and parent approvals, and an AI coach adds short tips along the way.',
      credit: 'A Spark Tank startup project by Beaconhouse students. I designed and built the MVP. Currently hosted on the Knowfinity website.',
      stack: ['React Native / Expo', 'Next.js', 'Supabase', 'Gemini'],
      say: 'Haven lets a family share one account. Kids get an allowance and limits, parents approve, and an AI coach adds short tips.',
      mood: 'happy',
      url: 'https://knowfinity.ai/haven',
      shot: '/img/work/haven-app.webp',
      world: '/img/world/haven-app.webp',
      frame: 'phone',
      video: '/video/haven.mp4',
      tagline: 'A family money app with parent and kid modes.',
    },
    {
      id: 'tomato',
      title: 'Tomato',
      summary:
        'A food ordering website. Browse the menu by category, add dishes to the cart, change quantities, and fill in delivery details with the total worked out for you.',
      credit: "Personal project.",
      stack: ['React', 'React Router', 'Context API', 'Vite'],
      say: 'Tomato is a food ordering front end: menu filters, a working cart and a checkout form. It has no backend yet.',
      mood: 'happy',
      url: 'https://tomato-fooddeliveryweb.netlify.app',
      shot: '/img/work/food-delivery.webp',
      world: '/img/world/food-delivery.webp',
      frame: 'monitor',
    },
  ],
  about: {
    heading: 'I like owning a feature from the database to the last pixel, then watching real people use it.',
    headingSay: 'Mahira finished her degree in January 2026, and most of this work is from the last two years.',
    note: 'I speak Urdu, English and a little Chinese. Outside code: throwball, cricket, journaling and bedazzling.',
    noteSay: 'She speaks Urdu at home, works in English, and is learning Chinese.',
  },
  jobs: [
    {
      id: 'knowfinity',
      date: 'Feb 2026 – Present',
      title: 'Knowfinity',
      role: 'Associate Full-Stack Developer, remote',
      say: 'Her current job: .NET backend on a live client project, working with a remote team and shipping features to production.',
    },
    {
      id: 'developers-hub',
      date: 'Internship',
      title: 'Developers Hub Corporation',
      role: 'Front-End Development intern, remote',
      say: 'Where the front-end habits started: responsive layouts and reusable UI components with deadlines.',
    },
    {
      id: 'bahria',
      date: 'Jan 2026',
      title: 'BS Computer Science',
      role: 'Graduated, Bahria University Karachi',
      say: 'Degree finished in January 2026 at Bahria University Karachi.',
    },
    {
      id: 'udemy',
      date: 'Course',
      title: 'React Native + Hooks',
      role: 'Udemy certification',
      say: 'The course behind the React Native apps like Haven and Ilmify.',
    },
  ],
  skills: [
    { id: 'languages', title: 'Languages', items: 'C#, C++, Python, JavaScript, PHP, HTML5, CSS3', say: 'C# for .NET work at her job, PHP and JavaScript for most of the products here.' },
    { id: 'frameworks', title: 'Frameworks', items: '.NET / ASP.NET, React, React Native (Expo), Next.js, NestJS, Tailwind CSS', say: 'Backend with .NET, NestJS and PHP. Front end and mobile with React, Next.js and React Native.' },
    { id: 'databases', title: 'Databases', items: 'SQL Server, MySQL / MariaDB, PostgreSQL, Supabase', say: 'Relational databases across the board: SQL Server at work, MySQL and Postgres in the products.' },
    { id: 'tools', title: 'Tools', items: 'Git / GitHub, Figma, Prisma, Postman, MS Office', say: 'Figma to read designs, Postman for APIs, Prisma as the ORM, Git for everything.' },
  ],
  contact: {
    heading: "Building something that helps people learn? I'd love to hear about it.",
    lead: 'Hiring, a project, or just a hello. Write here, or email me at',
    nameLabel: 'Name',
    emailLabel: 'Email',
    messageLabel: 'Message',
    button: 'Send message',
    note: 'Opens your email app with this ready to send.',
    sentNote: 'Your email app should be open. Press send there.',
    footer: 'Mahira Shakeel, Karachi',
  },
  links: {
    email: 'Mahira16124@gmail.com',
    linkedin: 'https://www.linkedin.com/in/mahira-shakeel-544a94292',
    github: 'https://github.com/maheerashakeel',
    repo: '',
    cv: '',
  },
}
