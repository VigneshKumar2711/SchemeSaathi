# SchemeSaathi – AI-Powered Government Scheme Assistant

SchemeSaathi is an AI-powered web application designed to help users discover government welfare schemes and understand their eligibility based on their personal and financial information.

The platform aims to make government scheme discovery easier through structured eligibility matching and conversational AI assistance.

## 🚀 Live Deployment

- **Live Application:** https://schemesaathi.smoky.vercel.app
- **Backend API:** https://schemesaathi-backend-emhw.onrender.com
- **Backend Health Check:** https://schemesaathi-backend-emhw.onrender.com/api/health

## Key Features

- **Eligibility Assessment:** Enter personal, educational, financial, and demographic details to assess scheme eligibility.
- **Scheme Matching:** Discover potentially relevant government schemes based on user-provided information.
- **AI Assistant:** Interact with an AI-powered assistant to explore government schemes through conversational questions.
- **Personalized Guidance:** Get scheme-related information based on individual requirements.
- **Multilingual Support:** Interact with the AI assistant in multiple Indian languages.
- **Real-Time AI Responses:** Receive conversational AI responses through Server-Sent Events (SSE) streaming.
- **Responsive Interface:** Access the application through a user-friendly web interface.

## Technology Stack

**Frontend**
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- React Router
- React Hook Form
- Zod
- Lucide React

**Backend**
- Node.js
- Express.js
- REST API
- Server-Sent Events (SSE)

**AI Integration**
- Google Gemini API
- OpenRouter API

**Deployment**
- Vercel – Frontend Hosting
- Render – Backend Hosting
- GitHub – Version Control

## Project Structure

```text
SchemeSaathi/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .gitignore
├── public/
├── src/
├── package.json
├── vite.config.ts
├── README.md
└── .gitignore
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/VigneshKumar2711/SchemeSaathi.git
cd SchemeSaathi
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Configure frontend environment

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000
```

For production, the frontend uses the deployed backend URL through the `VITE_API_URL` environment variable configured in Vercel.

### 4. Start the frontend

```bash
npm run dev
```

### 5. Configure the backend

Open a separate terminal:

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

Replace the placeholders with your own API keys.

### 6. Start the backend

```bash
npm start
```

The backend will run locally at:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL used by the frontend |
| `GEMINI_API_KEY` | Google Gemini API authentication key |
| `OPENROUTER_API_KEY` | OpenRouter API authentication key |
| `PORT` | Backend server port |

- Keep API keys and sensitive configuration in environment files or hosting-provider environment settings.
- Never commit `.env` files or expose API keys in public repositories.
- Configure `VITE_API_URL` in Vercel and backend API keys in Render.

## Future Enhancements

- Expand the government scheme database.
- Improve eligibility matching accuracy.
- Add more regional language support.
- Enhance AI-powered scheme recommendations.
- Introduce additional accessibility improvements.

## Author

**Vignesh Kumar**

GitHub: https://github.com/VigneshKumar2711

---

*SchemeSaathi – Making government schemes easier to discover and understand.*
