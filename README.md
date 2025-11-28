# Kids Storytelling Bot - Complete Full-Stack Project

A comprehensive full-stack application for creating safe, engaging, and educational stories for children using AI. Features a FastAPI backend with multiple LLM support and a beautiful Next.js frontend.

## 🌟 Project Overview

This project consists of two main components:

### Backend (FastAPI + Python)
- **Multiple LLM Support**: OpenAI, Hugging Face, OpenAI-compatible endpoints
- **Safety Filters**: Moral values, educational, and fun-only content filters
- **Session Management**: Redis or in-memory session storage
- **Production Ready**: Comprehensive logging, error handling, health checks

### Frontend (Next.js + TypeScript)
- **Kid-Friendly UI**: Colorful, animated, responsive design
- **Real-time Chat**: Interactive story continuation interface
- **Mobile Optimized**: Touch-friendly design for all devices
- **Accessible**: Screen reader friendly and keyboard navigable

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn
- (Optional) Redis for production session storage

### 1. Backend Setup

```bash
# Navigate to project root
cd Kids_story

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your API keys and preferences

# Start the backend server
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp env.local.example .env.local
# Default configuration should work with local backend

# Start the frontend server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 3. Test the Complete System

1. **Health Check**: Visit http://localhost:8000/health
2. **API Documentation**: Visit http://localhost:8000/docs
3. **Frontend App**: Visit http://localhost:3000
4. **Run Test Script**: 
   ```bash
   cd Kids_story
   python test_api.py
   ```

## 📁 Project Structure

```
Kids_story/
├── app/                    # Backend FastAPI application
│   ├── core/              # Core functionality
│   │   ├── config.py      # Configuration management
│   │   ├── llm_client.py  # LLM abstraction layer
│   │   ├── session_manager.py # Session management
│   │   └── safety_filter.py   # Content filtering
│   ├── models/            # Pydantic models
│   ├── routers/           # API endpoints
│   ├── services/          # Business logic
│   └── utils/             # Utilities
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React components
│   │   ├── contexts/     # State management
│   │   ├── lib/         # API client
│   │   └── types/       # TypeScript definitions
│   ├── tailwind.config.ts
│   └── package.json
├── requirements.txt       # Python dependencies
├── env.example           # Backend environment template
├── test_api.py          # API test script
└── README.md            # This file
```

## 🔧 Configuration

### Backend Configuration (env.example)

Key settings to configure:

```bash
# LLM Provider (choose one)
LLM_PROVIDER="openai"  # or "huggingface" or "openai_compatible"
OPENAI_API_KEY="your-key-here"

# Content Safety
SAFETY_FILTERS_ENABLED=true
DEFAULT_CONTENT_FILTER="educational"

# Session Storage
SESSION_BACKEND="memory"  # or "redis" for production
```

### Frontend Configuration (.env.local)

```bash
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional API key
NEXT_PUBLIC_API_KEY=your-api-key
```

## 🎯 Features

### Content Filters
- **🌟 Moral Values**: Stories promoting kindness, sharing, honesty
- **📚 Educational**: Learning-focused content with facts and lessons
- **🎉 Fun Only**: Pure entertainment with silly, exciting adventures

### Age Groups
- **🧸 Little Ones (3-5)**: Simple words, basic concepts
- **🎈 Young Readers (6-8)**: Balanced learning and fun
- **📖 Big Kids (9-12)**: Complex stories with deeper meanings

### Story Lengths
- **⚡ Quick Story**: Perfect for short attention spans
- **📝 Medium Adventure**: Ideal for story time
- **📚 Epic Journey**: Longer, immersive experiences

## 🔄 API Endpoints

### Core Endpoints
- `POST /story/start` - Create new story session
- `POST /story/continue` - Continue existing story
- `PUT /story/config` - Update session settings
- `GET /story/session/{id}` - Get session info
- `GET /story/filters` - List available filters
- `GET /health` - Health check

### Example Usage

```bash
# Start a new story
curl -X POST http://localhost:8000/story/start \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A brave little rabbit who wants to learn how to fly",
    "age_group": "6-8",
    "content_filter": "educational"
  }'

# Continue the story
curl -X POST http://localhost:8000/story/continue \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "session-id-here",
    "user_input": "The rabbit meets a wise owl"
  }'
```

## 🛠️ Development

### Backend Development

```bash
# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Format code
black app/

# Lint code
flake8 app/
```

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Lint code
npm run lint
```

## 🚢 Deployment

### Backend Deployment

1. **Environment Setup**
   ```bash
   # Production environment
   cp env.example .env
   # Configure with production settings
   ```

2. **Database/Redis**
   ```bash
   # For production, use Redis
   SESSION_BACKEND="redis"
   REDIS_HOST="your-redis-host"
   ```

3. **Run with Gunicorn**
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

### Frontend Deployment

1. **Build Application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**
   - Connect your repository
   - Set environment variables
   - Deploy automatically

## 🧪 Testing

### Backend Testing
```bash
# Run comprehensive API tests
python test_api.py

# Test individual endpoints
curl http://localhost:8000/health
```

### Frontend Testing
```bash
# Type checking
npm run type-check

# Build test
npm run build
```

## 🔒 Security & Safety

### Content Safety
- Multi-layer content filtering
- Age-appropriate content validation
- Automatic content regeneration for policy violations

### API Security
- Optional API key authentication
- CORS configuration
- Request validation with Pydantic

### Data Privacy
- Session-only memory (no persistent user data)
- Configurable session timeouts
- No personal information storage

## 📱 Mobile Support

The frontend is fully optimized for mobile devices:
- Responsive design for all screen sizes
- Touch-friendly interface elements
- Mobile-specific animations
- Safe area support for modern phones

## 🎨 Customization

### Adding New Content Filters
1. Extend `safety_filter.py` with new filter class
2. Update filter options in frontend
3. Test with various story types

### Supporting New LLM Providers
1. Implement new client in `llm_client.py`
2. Add configuration options
3. Update factory method

### UI Customization
1. Modify `tailwind.config.ts` for colors/themes
2. Update component styles in `/components/ui/`
3. Add new animations in CSS

## 🐛 Troubleshooting

### Common Issues

1. **Backend Won't Start**
   - Check Python version (3.10+)
   - Verify API keys in `.env`
   - Check port 8000 availability

2. **Frontend Connection Error**
   - Ensure backend is running
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Verify CORS settings

3. **Story Generation Fails**
   - Validate API keys
   - Check LLM provider status
   - Review safety filter settings

### Getting Help

1. Check the individual README files in `/` and `/frontend/`
2. Review API documentation at `http://localhost:8000/docs`
3. Run the test script for diagnostics: `python test_api.py`

## 📄 License

This project is provided as-is for educational and development purposes.

## 🤝 Contributing

Contributions are welcome! Please:

1. Follow existing code patterns
2. Add proper TypeScript types
3. Include tests for new features
4. Update documentation
5. Ensure mobile compatibility

---

**Happy Storytelling! ✨📚🎉**
