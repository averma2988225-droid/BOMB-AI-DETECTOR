# Local Development Setup Guide

This guide helps you run the SENTINEL AI Threat Detection System locally in Visual Studio Code.

## Prerequisites

- Node.js 18+ installed
- Deno installed (for edge functions)
- An OpenAI API key with GPT-4 Vision access

## Quick Start

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=https://fhppxcyvqkjqgdmdgvcf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZocHB4Y3l2cWtqcWdkbWRndmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5ODA1NTgsImV4cCI6MjA4MTU1NjU1OH0.bz1tXpwC60HSzr0pztwv0DVE00kI_u8tB8syH7TOLEo
```

### 3. Run the Frontend

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## Running Edge Functions Locally (For AI Analysis)

### Option A: Use Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Set your OpenAI API key:
```bash
# Windows PowerShell (temporary)
$env:OPENAI_API_KEY="sk-your-openai-key-here"

# Windows CMD (temporary)
set OPENAI_API_KEY=sk-your-openai-key-here

# Windows (persistent)
setx OPENAI_API_KEY "sk-your-openai-key-here"

# Mac/Linux
export OPENAI_API_KEY="sk-your-openai-key-here"
```

3. Start edge functions locally:
```bash
supabase functions serve analyze-threat --env-file .env.local
```

4. Update `src/lib/threatAnalysisApi.ts` to use local endpoint:
```typescript
// Change line 91 from:
const { data, error } = await supabase.functions.invoke...

// To use local endpoint for testing:
const response = await fetch('http://localhost:54321/functions/v1/analyze-threat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ imageBase64, isXray })
});
const data = await response.json();
```

### Option B: Run Edge Function Directly with Deno

```bash
cd supabase/functions/analyze-threat
deno run --allow-net --allow-env index.ts
```

---

## Getting an OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Ensure your account has access to GPT-4 Vision (gpt-4o model)

---

## Project Structure

```
├── src/
│   ├── components/       # React UI components
│   ├── lib/
│   │   ├── threatAnalysisApi.ts    # API client for AI analysis
│   │   └── threatClassification.ts # Classification logic
│   └── pages/
│       └── Index.tsx     # Main application page
├── supabase/
│   └── functions/
│       └── analyze-threat/
│           └── index.ts  # AI analysis edge function
└── LOCAL_SETUP.md        # This file
```

---

## Hackathon Demo Tips

1. **Pre-upload test images** to avoid live scanning delays
2. **Use the demo scenarios** for quick demonstrations
3. **X-ray mode** provides more dramatic results for threats
4. The system supports both **real-time uploads** and **demo data**

---

## Troubleshooting

### "AI service not configured" error
- Ensure `OPENAI_API_KEY` is set in your environment
- Restart the terminal/IDE after setting the variable

### CORS errors
- Make sure you're running the edge function with CORS headers enabled
- Use Supabase CLI for proper CORS handling

### Image not analyzing
- Check browser console for errors
- Ensure image is under 4MB
- Try different image formats (JPG, PNG)

---

## Support

For issues specific to this project, check the GitHub repository issues.
