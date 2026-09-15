# INSA Lyon Public Events

A service that scrapes public events from INSA Lyon's agenda page and exposes them via a simple HTTP API.

## Features

- Scrapes events from https://www.insa-lyon.fr/fr/agenda
- Returns events in JSON format matching the ESUP-Portail provisioning spec
- Filters events based on configurable exclusion words
- Case-insensitive search for exclusion words
- Handles French month abbreviations

## Quick Start

### Using Docker Compose

```bash
# Clone the repository
git clone <repository-url>
cd insa-lyon-public-events

# Copy the sample environment file
cp .env.sample .env

# Optionally edit .env to configure exclusion words

# Start the service
docker compose up -d

# Test the API
curl http://localhost:3021/
```

### Without Docker

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Or build and run in production
npm run build
node dist/index.js
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `EXCLUDE_WORDS` | Comma-separated list of words to exclude from event titles (case-insensitive) | `Soutenance` | No |

### Examples

Exclude thesis defenses:
```bash
EXCLUDE_WORDS=Soutenance
```

Exclude multiple types of events:
```bash
EXCLUDE_WORDS="Soutenance,Concours,Thèse"
```

Disable filtering:
```bash
EXCLUDE_WORDS=""
```

## API Endpoint

**GET /**

Returns a JSON response with the following structure:

```json
{
  "unreadMails": 0,
  "events": [
    {
      "label": "Event title",
      "startDateTime": "2026-09-15T00:00:00.000Z",
      "endDateTime": "2026-09-15T02:00:00.000Z",
      "location": "INSA Lyon"
    }
  ]
}
```

## Docker

### Build

```bash
docker build -t insa-lyon-public-events .
```

### Run

```bash
docker run -p 3000:3000 -e EXCLUDE_WORDS=Soutenance insa-lyon-public-events
```

## Project Structure

- `src/index.ts` - Express server with API endpoint
- `src/scrap.ts` - Scraping logic for INSA Lyon agenda
- `compose.yml` - Docker Compose configuration
- `Dockerfile` - Docker image build instructions
- `.env.sample` - Sample environment configuration

## License

MIT
