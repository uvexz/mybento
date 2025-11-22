![mybento](https://raw.githubusercontent.com/uvexz/mybento/main/public/mybento.png)

# mybento

A personal page builder with a beautiful Bento Grid layout. Create your own corner of the internet to showcase links, social media, and content.

## Features

- 🎨 **Bento Grid Layout** - Drag-and-drop interface to organize content cards
- 👤 **Customizable Profile** - Edit name, bio, avatar, and background
- 🔐 **Secure Authentication** - Email verification, password strength checks, rate limiting
- 📊 **Analytics** - Track card clicks and performance
- 📱 **Responsive Design** - Works great on desktop and mobile
- 🔗 **Short Links** - Create and manage custom short URLs
- 📸 **Image Upload** - Optional Cloudflare R2 integration
- 🌍 **Internationalization** - Multi-language support (English, 中文, 日本語)

## Tech Stack

- [Next.js 16](https://nextjs.org/) - React framework
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe ORM
- [Better Auth](https://www.better-auth.com/) - Modern authentication (migrated from NextAuth)
- [next-intl](https://next-intl-docs.vercel.app/) - Internationalization
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn UI](https://ui.shadcn.com/) - UI components

## Quick Start

1. **Clone and install**
   ```bash
   git clone https://github.com/uvexz/mybento.git
   cd mybento
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL URL and generate a Better Auth secret:
   ```bash
   npx @better-auth/cli@latest secret
   ```

3. **Run database migrations**
   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) and register. The first user becomes admin.

## Optional Configuration

**Community Mode**:
```env
COMMUNITY_MODE=true  # or false
```
- `true`: Multi-user community mode with open registration
- `false` or not set: Single-user mode - registration closes after first user, homepage redirects to user page

**Email Verification** (via [Resend](https://resend.com/)):
```env
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

**Image Uploads** (via Cloudflare R2):
```env
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=mybento
R2_PUBLIC_URL=https://your-public-domain.com
```

## License

WTFPL
