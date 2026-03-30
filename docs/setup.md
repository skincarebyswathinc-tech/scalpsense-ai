# ScalpSense Project Setup

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Backend**: Lovable Cloud (Supabase)
- **Auth**: Email/password + Google OAuth
- **Database**: PostgreSQL (via Supabase)
- **Edge Functions**: Deno (Supabase Edge Functions)
- **Animations**: Framer Motion

## Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── dashboard/      # Dashboard widgets
│   ├── landing/        # Landing page sections
│   ├── quiz/           # Quiz flow components
│   └── ui/             # shadcn/ui components
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Auth context & provider
│   └── useSubscription.tsx
├── integrations/
│   └── supabase/       # Auto-generated Supabase client
├── lib/                # Utilities
│   └── scoreCalculator.ts
├── pages/              # Route pages
│   ├── AdminDashboard.tsx
│   ├── AdminProducts.tsx
│   ├── AdminQuizzes.tsx
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── Profile.tsx
│   └── ...
└── App.tsx             # Router setup

supabase/
├── functions/          # Edge functions
│   ├── generate-quiz/  # AI quiz generation
│   └── create-admin/   # Admin user creation (utility)
├── migrations/         # DB schema migrations
└── config.toml         # Supabase config

docs/                   # Project documentation
public/                 # Static assets + PWA manifest
```

## Database Tables
- `profiles` - User profiles with soft delete
- `scalp_assessments` - Quiz/assessment responses
- `user_reports` - Generated reports
- `products` - Product catalog
- `product_kits` - Bundled product kits
- `subscriptions` - User subscription plans
- `referrals` - Referral tracking
- `daily_habits` - User habit tracking
- `quizzes` / `quiz_questions` - Admin-managed quizzes
- `user_roles` - Role-based access (admin, moderator, user)

## Environment Variables
Auto-configured by Lovable Cloud:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## PWA Support
- Manifest at `public/manifest.json`
- Icons at `public/icon-192.png` and `public/icon-512.png`
- Add service worker for offline caching as needed

## Authentication
- Email/password with validation (8+ chars, uppercase, lowercase, number, special char)
- Google OAuth via Lovable Cloud Auth
- Password reset flow via email
