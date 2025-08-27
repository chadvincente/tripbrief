# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3001)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run linting with auto-fix
npm run lint:fix

# Type checking
npm run type-check

# Pre-build checks (linting + type checking)
npm run prebuild
```

## Project Architecture

TripBrief is a Next.js 15 application that generates comprehensive travel briefs using the Anthropic API. The architecture follows these key patterns:

### Core Structure

- **App Router**: Uses Next.js 15 app directory structure (`src/app/`)
- **API Routes**: Server-side API endpoints in `src/app/api/`
- **TypeScript**: Fully typed with strict TypeScript configuration
- **Tailwind CSS**: Utility-first CSS framework for styling

### Key Directories

- `src/app/`: Next.js app router pages and layouts
- `src/app/api/`: API route handlers
- `src/components/`: Reusable React components
- `src/lib/`: Utility functions and shared logic

### API Integration

The application integrates with Anthropic's Claude API to generate travel briefs:

- **Primary endpoint**: `POST /api/generate-brief`
- **Model**: Uses `claude-sonnet-4-20250514`
- **Environment**: Requires `ANTHROPIC_API_KEY` in `.env.local`

### Data Flow

1. User submits destination and travel dates via frontend form
2. Frontend sends POST request to `/api/generate-brief`
3. API route constructs comprehensive prompt for Claude
4. Claude generates structured travel brief covering:
   - Transportation and getting around
   - Attractions and photo spots
   - Food and dining recommendations
   - Neighborhoods and city layout
   - Events and cultural information
   - Practical travel information
5. Response is formatted and displayed to user

## Environment Setup

Copy `.env.local.example` to `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Deployment

### Vercel (Recommended)

The application is optimized for Vercel deployment:

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables**:
   - `ANTHROPIC_API_KEY` (required)
   - Optional: `RATE_LIMIT_REQUESTS_PER_MINUTE` and `RATE_LIMIT_REQUESTS_PER_HOUR`
3. **Deploy** - Vercel handles the build automatically

### Rate Limiting

Production includes IP-based rate limiting to protect against excessive API costs:

- 3 requests per minute per IP
- 10 requests per hour per IP
- Automatic cleanup of expired rate limit entries
- Graceful error handling with retry information

### Analytics & Monitoring

- **Vercel Analytics**: Page views, performance metrics, custom events
- **Umami Analytics**: Privacy-focused analytics without cookies
- **Speed Insights**: Core Web Vitals and performance monitoring
- API requests are logged with destination and IP for monitoring
- Rate limit violations are tracked
- Response times and errors are logged

### Cost Protection

Each travel brief generation costs approximately $0.01-0.03 in Anthropic API usage. The rate limiting provides protection against unexpected costs from high usage.

## Development Notes

- The application uses TypeScript with strict mode enabled
- Tailwind CSS is configured with dark mode support
- ESLint is configured with Next.js recommended rules
- The Anthropic SDK is pre-configured in `src/lib/anthropic.ts`
