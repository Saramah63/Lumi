# Lumi

Lumi is a project workspace for design assets and frontend configuration.

## Voice + TTS Environment

Server-side TTS uses Finnish-only synthesis (`fi-FI`) with mode-aware voice output:
`baseline | listening | firm | warm`.

Set these environment variables in local and Vercel:

- `ELEVENLABS_API_KEY` (primary high-quality TTS)
- `ELEVENLABS_VOICE_ID` (optional default voice id)
- `ELEVENLABS_VOICE_ID_BASELINE` (optional)
- `ELEVENLABS_VOICE_ID_LISTENING` (optional)
- `ELEVENLABS_VOICE_ID_FIRM` (optional)
- `ELEVENLABS_VOICE_ID_WARM` (optional)
- `OPENAI_API_KEY` (fallback TTS provider)
- `OPENAI_TTS_MODEL` (optional, default `gpt-4o-mini-tts`)
- `DATABASE_URL` (optional Postgres cache; otherwise `/tmp` cache is used)
- `LUMI_BASE_URL` (optional absolute URL helper)

## TTS API

`POST /api/tts`

Body:

```json
{
  "text": "Pysähdy. Tämä ei ole turvallista.",
  "mode": "firm",
  "lang": "fi-FI"
}
```

Response:

```json
{
  "audioUrl": "/api/tts/<hash>",
  "cacheHit": true
}
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the project (if scripts are defined in `package.json`):

```bash
npm run dev
```

## Repository

GitHub: https://github.com/Saramah63/Lumi
