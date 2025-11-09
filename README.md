<div align="center">
  <h1>💰 Finora</h1>
  <p><strong>Smart finance manager to track expenses, plan budgets, and stay in control</strong></p>
  
  ![License](https://img.shields.io/badge/license-MIT-blue.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
  ![Next.js](https://img.shields.io/badge/Next.js-16-black)
  ![Bun](https://img.shields.io/badge/Bun-1.1.43-orange)
</div>

---

## 📖 About

Finora is a comprehensive financial management platform that empowers users to:

- 📊 **Track expenses** - Monitor your spending patterns and financial habits
- 💵 **Plan budgets** - Set and manage budgets across different categories
- 📈 **Stay in control** - Get insights and analytics to make informed financial decisions

Built with modern technologies and best practices, Finora provides a seamless experience for managing your personal or business finances.

---

## 🏗️ Project Structure

This project is organized as a **Turborepo monorepo** with the following structure:

```
Finora/
├── apps/
│   ├── web/          # Main Next.js web application
│   └── docs/         # Documentation site (Next.js)
├── packages/
│   ├── auth/         # Authentication package (Better Auth)
│   ├── database/     # Database schema and client (Prisma)
│   ├── trpc/         # tRPC API setup
│   ├── ui/           # Shared React component library
│   ├── eslint-config/    # Shared ESLint configurations
│   └── typescript-config/ # Shared TypeScript configurations
└── turbo.json        # Turborepo configuration
```

---

## 🚀 Tech Stack

### Frontend

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety

### Backend

- **[tRPC](https://trpc.io/)** - End-to-end typesafe APIs
- **[Prisma](https://www.prisma.io/)** - Database ORM
- **[PostgreSQL](https://www.postgresql.org/)** - Primary database

### Authentication

- **[Better Auth](https://better-auth.com/)** - Modern authentication solution
- Email & Password authentication
- OAuth providers (Google, GitHub)
- Session management

### Development Tools

- **[Turborepo](https://turbo.build/repo)** - Monorepo build system
- **[Bun](https://bun.sh/)** - Fast JavaScript runtime and package manager
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **[Bun](https://bun.sh/)** >= 1.1.43
- **[Node.js](https://nodejs.org/)** >= 18
- **[PostgreSQL](https://www.postgresql.org/)** >= 14
- **[Git](https://git-scm.com/)**

---

## 🛠️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Finora.git
cd Finora
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory and in `apps/web/`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/finora"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

### 4. Set Up the Database

#### a. Create a PostgreSQL database:

```bash
createdb finora
```

#### b. Generate Prisma Client:

```bash
cd packages/database
bun run db:generate
```

#### c. Push the schema to your database:

```bash
bun run db:push
```

#### d. (Optional) Seed the database:

```bash
bun run db:seed
```

### 5. Run the Development Server

From the root directory:

```bash
bun run dev
```

This will start:

- **Web app**: http://localhost:3000
- **Docs**: http://localhost:3001

To run only the web app:

```bash
bun run dev --filter=web
```

---

## 📜 Available Scripts

From the root directory:

```bash
# Development
bun run dev              # Start all apps in development mode
bun run dev --filter=web # Start only the web app

# Build
bun run build            # Build all apps and packages
bun run build --filter=web # Build only the web app

# Code Quality
bun run lint             # Lint all packages
bun run format           # Format code with Prettier
bun run check-types      # Type check all packages
```

### Database Scripts

From `packages/database`:

```bash
bun run db:generate      # Generate Prisma Client
bun run db:push          # Push schema changes (development)
bun run db:migrate       # Create and run migrations (production)
bun run db:studio        # Open Prisma Studio
bun run db:seed          # Seed the database
```

---

## 📦 Package Overview

### `@finora/auth`

Authentication package with email/password and OAuth support. Features:

- 🔐 Email & Password authentication
- 🌐 OAuth providers (Google, GitHub)
- 🔄 Session management
- 🗄️ Database integration

[Read more →](./packages/auth/README.md)

### `@repo/database`

Shared Prisma database client and schema. Features:

- 🗄️ PostgreSQL database
- 🔄 Type-safe database access
- 📊 Database migrations
- 🌱 Database seeding

[Read more →](./packages/database/README.md)

### `@finora/trpc`

End-to-end typesafe API layer. Features:

- 🔒 Type-safe API routes
- 🔄 Server and client setup
- 🎯 React Query integration

[Read more →](./packages/trpc/README.md)

### `@repo/ui`

Shared React component library. Features:

- 🎨 Reusable UI components
- 📱 Responsive design
- ⚡ Optimized performance

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy!

Vercel will automatically detect the Turborepo setup and deploy appropriately.

### Docker (Coming Soon)

Docker support for containerized deployments is planned for a future release.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🔗 Useful Links

### Turborepo

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Better Auth Documentation](https://better-auth.com)

---

<div align="center">
  <p>Made with ❤️ by the Priyank Rajai</p>
  <p>⭐ Star us on GitHub — it helps!</p>
</div>
