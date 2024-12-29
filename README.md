# HomeDocs

A web application for documenting and tracking home maintenance tasks, appliances, and important documents.

## Features

- Document and track home maintenance tasks
- Manage multiple homes and rooms
- Track appliances and important documents
- Share homes with other users
- Calendar integration for maintenance schedules
- Dark mode support

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- Docker (for development database)

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/jhofker/homedocs.git
cd homedocs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration.

4. Start the development database:
```bash
npm run docker:db
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run linter
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run docker:dev` - Start all development services with Docker
- `npm run docker:db` - Start only the database service
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Version Management

The project uses semantic versioning. To bump the version:

```bash
# Bump patch version (0.1.9 -> 0.1.10)
npm run release:patch

# Manual version and release
npm version <major|minor|patch>
npm run release
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
