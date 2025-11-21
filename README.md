# mybento

A personal page builder with a beautiful, customizable Bento Grid layout. Create your own corner of the internet to showcase your links, social media, and content.

## Features

- **Bento Grid Layout**: Drag-and-drop interface to organize your content cards.
- **Customizable Profile**:
  - Edit your name, bio, and avatar.
  - Set a custom background image for your page.
  - Customize the profile section's background color for better readability.
- **Card Types**: Support for various card types including links, social media, and images.
- **Admin Homepage**: The homepage automatically features the content from the site administrator.
- **Secure Authentication**: Powered by NextAuth.js.
- **Responsive Design**: Looks great on desktop and mobile.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: PostgreSQL
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://authjs.dev/) (v5 Beta)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted like Vercel Postgres / Neon)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd mybento
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**

    Copy `.env.example` to `.env` and fill in your values:

    ```bash
    cp .env.example .env
    ```

    **Required Variables:**
    - `POSTGRES_URL`: Your PostgreSQL connection string.
    - `AUTH_SECRET`: A random string for authentication (generate with `openssl rand -base64 32`).
    - `NEXT_PUBLIC_SITE_NAME`: (Optional) Your site's name.
    - `NEXT_PUBLIC_SITE_DESCRIPTION`: (Optional) Your site's description.

4.  **Database Migration:**

    Push the schema to your database:

    ```bash
    npm run db:push
    ```

5.  **Run Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1.  **Register**: Create a new account. The first user created will automatically be assigned the `admin` role.
2.  **Customize**: Go to your dashboard (`/your-username`) to add cards and edit your profile.
3.  **Homepage**: As an admin, your cards will be featured on the main landing page.

## License

WTFPL
