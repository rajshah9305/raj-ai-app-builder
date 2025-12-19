# AI App Builder

A production-grade AI-powered application builder that transforms natural language prompts into fully functional web applications using Groq AI.

## Features

- **Natural Language to Code**: Describe your app in English, get production-ready code
- **Multi-Model AI Selection**: Choose from 5 advanced AI models with intelligent fallback
- **Groq AI Integration**: Intelligent code generation via Groq API
- **Live Preview**: Real-time rendering with iframe-based preview
- **Multi-Agent Orchestration**: UI, Backend, Database, and QA agents collaborate
- **Code Editor**: Monaco Editor for viewing and editing generated code
- **Zero Auth Required**: Works completely locally
- **Clean UI**: White background, black text, orange accents

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **AI**: Groq API (Llama 3.3 70B, Llama 4, GPT-OSS, Kimi K2)
- **Editor**: Monaco Editor
- **State**: React Context
- **Storage**: In-memory (easily replaceable)
- **Type Safety**: TypeScript strict mode

## Quick Start

### Prerequisites
- Node.js 18+
- Groq API key (get one at https://console.groq.com/)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ai-app-builder

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## How to Use

1. **Set Environment Variable**: Create a `.env.local` file with your `GROQ_API_KEYS`
2. **Start the App**: Run `npm run dev` and open `http://localhost:3000`
3. **Select AI Models**: Choose one or multiple AI models from the dropdown selector
4. **Enter Prompt**: Describe what you want to build in the input field
5. **Watch AI Generate**: Four agents generate UI, API, database schema, and QA using your selected models
6. **View Results**:
   - Left panel: Generated code in Monaco Editor
   - Right panel: Live preview in iframe
7. **Edit & Iterate**: Modify generated code directly in the editor

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/               # API endpoints
│   │   ├── agents/       # Agent status endpoint
│   │   ├── files/        # File management endpoints
│   │   ├── generate/     # Code generation endpoint
│   │   └── projects/     # Project management endpoints
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── context/              # State management (ProjectContext)
├── hooks/                # Custom hooks (useProject)
├── lib/
│   ├── agents/           # AI orchestration
│   │   └── orchestrator.ts
│   ├── groq-client.ts    # Groq API client
│   ├── storage.ts        # In-memory data storage
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── styles/               # Global CSS (Tailwind)
```

## API Endpoints

### POST `/api/projects`
Create a new project.

```json
{
  "name": "My App",
  "description": "Optional description"
}
```

### POST `/api/generate`
Generate code from a prompt with model selection.

```json
{
  "projectId": "proj_123",
  "prompt": "Create a todo app",
  "models": ["llama-3.3-70b-versatile", "meta-llama/llama-4-maverick-17b-128e-instruct"]
}
```

### GET `/api/projects/[id]`
Get project with files and versions.

### PUT `/api/projects/[id]`
Update project metadata.

### DELETE `/api/projects/[id]`
Delete a project and all its files.

## Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)
```bash
vercel deploy
```

### Deploy to Other Platforms
- Railway
- Render
- AWS
- Any Node.js host

## Environment Variables

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEYS=your_groq_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

See `.env.example` for a template.

## Advanced Groq Features

The application now supports multiple Groq models with advanced features and intelligent model selection:

### Available Models
- **Llama 3.3 70B Versatile** (Recommended): Most capable model for complex code generation and reasoning
- **Llama 4 Maverick 17B**: Advanced reasoning capabilities with efficient performance
- **Llama 4 Scout 17B**: Fast inference with good quality output
- **GPT-OSS 120B**: Open-source GPT model with built-in tools (Web Search, Code Interpreter)
- **Kimi K2 Instruct**: Specialized for coding tasks with excellent accuracy

### Multi-Model Selection
- **Intelligent Fallback**: Select multiple models for enhanced reliability
- **Automatic Retry**: If one model fails, the system automatically tries the next
- **Performance Optimization**: Models are tried in order of selection for best results
- **Visual Model Selector**: Easy-to-use dropdown with model descriptions and features

### Model Features
- **Llama Models**: Excellent for general code generation and complex reasoning
- **GPT-OSS**: Includes built-in tools for web search and code interpretation
- **Kimi K2**: Optimized specifically for coding tasks with high accuracy
- **Large Context**: Support for up to 32K tokens (Llama 3.3 70B)
- **Fast Inference**: Optimized models for quick response times

### Streaming Support
All models support streaming responses for real-time code generation:

```typescript
// Streaming example
const stream = groqClient.generateWithLlama3370bStream(prompt);
for await (const chunk of stream) {
  console.log(chunk.content);
}
```

### Tool Support
GPT-OSS model includes built-in tools:
- **Browser Search**: Search the web for information
- **Code Interpreter**: Execute code and analyze results

## Code Quality

- ✅ Full TypeScript strict mode
- ✅ Zero placeholder text
- ✅ Zero commented-out code
- ✅ Complete error handling
- ✅ Production-ready

## Extending the Application

### Replace In-Memory Storage
The storage layer is abstracted. Replace `src/lib/storage.ts` with:
- Supabase (PostgreSQL)
- Firebase
- MongoDB
- Prisma + SQLite

### Customize AI Prompts
Edit `src/lib/agents/orchestrator.ts` to change how code is generated.

### Add More Agents
Create new agent functions in `orchestrator.ts` and integrate into the workflow.

## Troubleshooting

### Port Already in Use
```bash
npm run dev -- -p 3001
```

### Groq API Key Not Set
Ensure you have set the `GROQ_API_KEYS` environment variable in your `.env.local` file.

### Build Errors
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## License

MIT License - See LICENSE file for details

---

**Production-grade AI app builder with Groq AI integration**
