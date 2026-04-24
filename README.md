# 🎮 Level Up English - Gamified English Learning Platform

A modern, interactive English language learning platform that transforms education into an engaging gaming experience. Users can progress through difficulty levels, earn experience points (XP), unlock badges, and compete on leaderboards.

## ✨ Features

### 📚 Gamified Learning System
- **Three Difficulty Levels**: Easy (🌱), Medium (⚡), Hard (🔥)
- **Progressive Difficulty**: Complete Easy level to unlock Medium, Medium to unlock Hard
- **Adaptive XP System**: Earn more XP as difficulty increases
  - Easy: 10 XP per correct answer
  - Medium: 20 XP per correct answer
  - Hard: 35 XP per correct answer

### 🎯 Game Modes
- **Level-Based Quizzes**: Structured learning paths with timed questions
- **Endless Mode**: Practice indefinitely without level restrictions
- **Timed Challenges**: Race against the clock
  - Easy: 20 seconds per question
  - Medium: 15 seconds per question
  - Hard: 12 seconds per question

### 🏆 Progress Tracking
- **Leaderboard System**: Compete globally with other players
- **Badge System**: Unlock achievements for milestones
- **Experience Points (XP)**: Track total progress and current level
- **Quiz Statistics**: View completion history and performance metrics

### 👤 User Management
- **Secure Authentication**: Supabase-powered OAuth integration
- **Profile System**: Customize display name and avatar
- **Persistent Progress**: All data synced across devices
- **Social Features**: View profiles and compare stats

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality React components
- **React Router v6** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Efficient form handling

### Backend & Database
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth)
- **PostgreSQL** - Relational database
- **Row Level Security (RLS)** - Database-level security
- **Supabase Functions** - Serverless functions for AI question generation

### Developer Tools
- **ESLint** - Code quality
- **Vitest** - Unit testing
- **Bun** - Package manager & runtime

## 📁 Project Structure

```
level-up-english/
├── src/
│   ├── components/
│   │   ├── NavBar.tsx              # Main navigation
│   │   ├── NavLink.tsx             # Navigation links
│   │   └── ui/                     # shadcn/ui components
│   ├── pages/
│   │   ├── Landing.tsx             # Home page
│   │   ├── Auth.tsx                # Authentication page
│   │   ├── Dashboard.tsx           # User dashboard
│   │   ├── Quiz.tsx                # Level-based quiz
│   │   ├── Endless.tsx             # Endless practice mode
│   │   ├── Leaderboard.tsx         # Global rankings
│   │   ├── NotFound.tsx            # 404 page
│   │   └── OAuthCallback.tsx       # OAuth redirect handler
│   ├── hooks/
│   │   ├── useAuth.ts              # Auth state management
│   │   ├── use-mobile.tsx          # Responsive detection
│   │   └── use-toast.ts            # Toast notifications
│   ├── lib/
│   │   ├── auth.ts                 # Auth functions
│   │   ├── certificate.ts          # Completion certificates
│   │   ├── levels.ts               # Level configuration
│   │   └── utils.ts                # Utility functions
│   ├── integrations/
│   │   └── supabase/               # Database client
│   ├── test/                       # Unit tests
│   ├── App.tsx                     # Main app component
│   ├── App.css                     # Global styles
│   ├── index.css                   # Base styles
│   └── main.tsx                    # Entry point
├── supabase/
│   ├── config.toml                 # Supabase config
│   ├── functions/                  # Serverless functions
│   │   └── generate-questions/     # AI question generation
│   └── migrations/                 # Database schema
├── public/                         # Static assets
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.ts              # Tailwind configuration
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🗄 Database Schema

### Tables
- **profiles** - User profile information
  - id, display_name, avatar_url, email, total_xp, current_level, timestamps

- **badges** - Badge definitions
  - id, code, name, description, icon

- **user_badges** - User badge progress
  - user_id, badge_id, earned_at

- **level_completions** - Quiz history
  - user_id, level, score, xp_earned, questions_total, questions_correct, timestamp

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun runtime
- Git
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/level-up-english.git
cd level-up-english
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

4. **Set up Supabase**
- Create a Supabase project at [supabase.com](https://supabase.com)
- Run migrations to set up database schema
- Configure OAuth provider (Google, GitHub, etc.)

5. **Start development server**
```bash
bun run dev
# or
npm run dev
```

The app will be available at `http://localhost:8080`

## 📦 Available Scripts

```bash
# Development
bun run dev              # Start dev server with HMR

# Build
bun run build            # Production build
bun run build:dev        # Development build

# Testing
bun run test             # Run tests once
bun run test:watch       # Watch mode

# Code Quality
bun run lint             # Run ESLint

# Preview
bun run preview          # Preview production build locally
```

## 🎮 Game Mechanics

### Level Progression
- **Easy** → Medium → Hard → Mastery
- Complete all questions correctly to unlock next level
- Level completion is tracked in user profile

### XP System
- Earn points for correct answers
- XP increases with difficulty
- Total XP displayed on leaderboard
- Progression tracked in real-time

### Badge System
- **First Steps** 🎯 - Complete your first quiz
- Additional badges for milestones and achievements
- Badges displayed on user profile

### Leaderboard
- Global rankings by total XP
- Real-time updates
- Level-specific leaderboards (coming soon)
- Weekly/monthly challenges (coming soon)

## 🔐 Authentication

The app uses Supabase authentication with OAuth support. Currently configured for:
- Email/Password (default)
- OAuth providers (Google, GitHub, etc. - setup required)

### Setting Up OAuth

To enable OAuth providers:

1. Go to Supabase dashboard → Auth → Providers
2. Enable desired provider (Google, GitHub, etc.)
3. Add credentials from provider
4. Update allowed redirect URIs
5. Restart dev server

## 🧪 Testing

Run the test suite:
```bash
bun run test
```

Watch mode for development:
```bash
bun run test:watch
```

## 🌐 Deployment

### Vercel (Recommended - Production Ready)

**GrammarQuest is optimized for deployment on Vercel.**

#### Quick Deploy
```bash
npm install -g vercel
vercel
```

#### GitHub Integration (Easiest)
1. Push to GitHub
2. Connect GitHub to Vercel
3. Add environment variables in Vercel dashboard
4. Auto-deploys on every push

**[📖 Complete Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)**

### Environment Variables Required
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-key
```

### Other Platforms
- Netlify - `netlify deploy --prod`
- AWS Amplify - `amplify publish`
- Firebase Hosting - `firebase deploy`

## 📝 API Integration

### Question Generation
Questions are generated dynamically using Supabase Edge Functions:
- `generate-questions` function creates AI-powered questions
- Supports multiple question types (multiple choice, fill-in-blank, etc.)
- Adjusts difficulty based on user level

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] Audio pronunciation exercises
- [ ] Multi-language support
- [ ] AI-powered personalized learning paths
- [ ] Mobile app (React Native)
- [ ] Multiplayer challenges
- [ ] Reading comprehension sections
- [ ] Writing exercises with AI feedback
- [ ] Certificate generation
- [ ] Progress analytics dashboard
- [ ] Spaced repetition algorithm

## 🐛 Known Issues & Troubleshooting

### OAuth 400 Bad Request
**Problem**: Getting 400 error during OAuth sign-in
**Solution**: 
- Ensure OAuth provider is configured in Supabase
- Verify redirect URI matches your app URL
- Check that Client ID and Secret are correct

### Session Not Found After Callback
**Problem**: User is redirected back to auth page after OAuth
**Solution**:
- Wait for Supabase session sync (1-2 seconds)
- Check browser localStorage for auth token
- Verify RLS policies allow profile access

### Questions Not Loading
**Problem**: Quiz shows empty or no questions
**Solution**:
- Check Supabase Edge Function status
- Verify database has question data
- Check browser console for API errors

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Support

For issues, questions, or suggestions:
- Open an GitHub Issue
- Contact: support@levelupenglish.com
- Discord: [Join our community](https://discord.gg/levelup)

## 🙏 Acknowledgments

- Built with [shadcn/ui](https://ui.shadcn.com/)
- Database by [Supabase](https://supabase.com)
- Icons from [Lucide React](https://lucide.dev)
- Powered by [Vite](https://vitejs.dev)

---

**Happy Learning! 🚀** Level up your English skills and climb the leaderboard!
