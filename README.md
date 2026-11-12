# SchemeSaathi – AI-Powered Government Scheme Assistant

SchemeSaathi is an AI-powered web application designed to help users discover government welfare schemes and understand their eligibility based on their personal and financial information.

The platform aims to make government scheme discovery easier through structured eligibility matching and conversational AI assistance.

## Key Features

- **Eligibility Assessment:** Enter personal, educational, financial, and demographic details to assess scheme eligibility.
- **Scheme Matching:** Discover potentially relevant government schemes based on user-provided information.
- **AI Assistant:** Interact with an AI-powered assistant to explore government schemes through conversational questions.
- **Personalized Guidance:** Get scheme-related information based on individual requirements.
- **Responsive Interface:** Access the application through a user-friendly web interface.

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express.js

**AI Integration**
- Google Gemini API
- OpenRouter API

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

### 3. Start the frontend

```bash
npm run dev
```

### 4. Configure the backend

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

### 5. Start the backend

```bash
npm start
```

## Environment Variables

Keep all API keys and sensitive configuration in environment files.

Never commit `.env` files or expose API keys in public repositories.

## Future Enhancements

- Expand the government scheme database.
- Improve eligibility matching accuracy.
- Add more regional language support.
- Enhance AI-powered scheme recommendations.

## Author

**Vignesh Kumar**

GitHub: https://github.com/VigneshKumar2711

---

*SchemeSaathi – Making government schemes easier to discover and understand.*