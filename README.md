# TripBrief 🌍

A comprehensive travel planning tool that generates detailed travel briefs for any destination using AI.

## Features

- **Smart Travel Briefs**: Get comprehensive information about transportation, attractions, food, culture, and practical tips
- **Dual View Modes**: Choose between a visual cheatsheet or detailed text format
- **Rate Limited**: Built-in protection against excessive API usage
- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark Mode Support**: Automatic dark/light mode based on system preference

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **API**: Anthropic Claude AI for travel information generation
- **Deployment**: Vercel (recommended)
- **Rate Limiting**: IP-based rate limiting (3 requests/minute, 10 requests/hour)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Anthropic API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd tripbrief
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Anthropic API key to `.env.local`:
   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open http://localhost:3001** in your browser

## Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/tripbrief)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel dashboard**
   - Go to your project settings
   - Add `ANTHROPIC_API_KEY` with your API key

### Environment Variables for Production

Required:
- `ANTHROPIC_API_KEY`: Your Anthropic API key

Optional:
- `RATE_LIMIT_REQUESTS_PER_MINUTE`: Override default rate limit (default: 3)
- `RATE_LIMIT_REQUESTS_PER_HOUR`: Override default hourly limit (default: 10)

## Rate Limiting

To protect against excessive API costs, the app includes built-in rate limiting:

- **Per IP Limits**: 3 requests per minute, 10 requests per hour
- **Graceful Handling**: Users receive clear messages when limits are exceeded
- **Automatic Reset**: Limits reset after the time window expires

## API Usage

The app uses Claude 3.5 Sonnet for generating travel briefs. Each request costs approximately $0.01-0.03 depending on the response length.

## Project Structure

```
src/
├── app/
│   ├── api/generate-brief/     # API route for travel brief generation
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page
├── components/
│   ├── TravelBriefCheatsheet.tsx  # Visual cheatsheet view
│   └── TravelBriefText.tsx        # Text format view
└── lib/
    ├── anthropic.ts            # Anthropic API client and types
    └── rate-limit.ts           # Rate limiting logic
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub Issues page.