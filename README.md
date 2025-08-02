# Audio Summarizer - Enhanced Performance Mode 🎵

> **AI-Powered Audio Processing with Multi-API Load Balancing**

A modern React TypeScript application that provides advanced audio processing capabilities including transcription, summarization, and SRT subtitle generation with Google AI Studio integration.

## ✨ Features

- 🎤 **Audio Transcription** - Convert speech to text with high accuracy
- 📋 **Content Summarization** - Generate concise summaries from audio content  
- 🎬 **SRT Subtitle Generation** - Create subtitle files with language options (Original/Thai)
- ⚡ **Enhanced Performance Mode** - Multi-API load balancing for optimal speed
- 🔄 **Smart Error Handling** - Auto-retry mechanisms with seamless fallback
- 📊 **Real-time Monitoring** - Performance stats and API health tracking
- 🎯 **Comprehensive Logging** - Detailed debugging information

## 🚀 Technologies

- **Frontend**: React 18+ with TypeScript, Vite
- **AI Processing**: Google AI Studio (Gemini API) with multi-key load balancing
- **File Handling**: Audio format support (MP3, WAV, M4A, etc.)
- **UI/UX**: Modern responsive design with real-time progress tracking

## ⚙️ Local Development

### Prerequisites
- Node.js 18+ 
- Google AI Studio API Keys (get from [https://aistudio.google.com/](https://aistudio.google.com/))

### SetupTypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

```bash
# 1. Clone the repository
git clone https://github.com/ryochana/audio-summarize.git
cd audio-summarize

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env and add your Google AI Studio API keys

# 4. Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Required: Google AI Studio API Keys
VITE_GOOGLE_AI_API_KEY=your_primary_api_key
VITE_GOOGLE_AI_API_KEY_2=your_secondary_api_key  
VITE_GOOGLE_AI_API_KEY_3=your_tertiary_api_key

# Optional: AI Model (default: gemini-1.5-flash)
VITE_AI_MODEL=gemini-1.5-flash
```

## 🌐 Vercel Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fryochana%2Faudio-summarize)

### Manual Deployment

1. **Push to GitHub** (if not already done)
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in and click "New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add the following variables:
     ```
     VITE_GOOGLE_AI_API_KEY = your_primary_api_key
     VITE_GOOGLE_AI_API_KEY_2 = your_secondary_api_key
     VITE_GOOGLE_AI_API_KEY_3 = your_tertiary_api_key
     VITE_AI_MODEL = gemini-1.5-flash
     ```

4. **Deploy**: Vercel will automatically build and deploy your app

### CLI Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Or deploy to production directly  
vercel --prod
```

## 📱 Usage

1. **Upload Audio File** - Support multiple formats (MP3, WAV, M4A, etc.)
2. **Choose Processing Type**:
   - 📝 **Transcribe** - Convert speech to text
   - 📋 **Summarize** - Generate content summary
   - 🎬 **SRT Subtitles** - Create subtitle files (Original/Thai)
3. **Monitor Progress** - Real-time updates with performance metrics
4. **Download Results** - Get processed text or SRT files

## 🎯 Performance Features

- **Multi-API Load Balancing** - Automatically distributes requests across multiple API keys
- **Smart Error Recovery** - Seamless failover with retry mechanisms  
- **Real-time Monitoring** - Track API health and performance metrics
- **Parallel Processing** - Handle large files efficiently
- **Comprehensive Logging** - Detailed debug information for troubleshooting

## 🔧 Architecture

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: React Hooks
- **API Integration**: Google AI Studio (Gemini)
- **Build Tool**: Vite with TypeScript
- **Deployment**: Vercel with serverless functions

## 📋 Requirements

- Modern web browser with JavaScript enabled
- Google AI Studio API key(s)
- Internet connection for AI processing

## 🐛 Troubleshooting

- **API Errors**: Check your API keys in environment variables
- **File Upload Issues**: Ensure audio file is under 25MB
- **Performance**: Add multiple API keys for better load balancing
- **Debugging**: Open browser console to see detailed logs

---

Built with ❤️ using React + TypeScript + Google AI Studio

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
