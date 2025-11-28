# Kids Storytelling Bot Frontend

A beautiful, kid-friendly Next.js frontend for the Kids Storytelling Bot. Built with TypeScript, Tailwind CSS, and Framer Motion for delightful animations.

## Features

- 🎨 **Kid-Friendly Design**: Colorful, playful interface with smooth animations
- 📱 **Fully Responsive**: Works perfectly on phones, tablets, and desktops
- ⚡ **Fast & Modern**: Built with Next.js 14+ and TypeScript
- 🎭 **Animated UI**: Delightful animations using Framer Motion
- 🛡️ **Safe Content**: Integrates with backend safety filters
- 🎯 **Accessible**: Follows accessibility best practices

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.local.example .env.local
   # Edit .env.local if needed (default points to localhost:8000)
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Visit http://localhost:3000

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
- `NEXT_PUBLIC_API_KEY`: Optional API key if backend requires authentication

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js 14 App Router
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── StoryCreator.tsx # Story creation interface
│   │   └── StoryChat.tsx   # Story continuation chat
│   ├── contexts/           # React Context providers
│   │   └── StoryContext.tsx # Story state management
│   ├── lib/                # Utilities
│   │   └── api.ts          # API client
│   └── types/              # TypeScript definitions
│       └── story.ts        # Story-related types
├── tailwind.config.ts      # Tailwind configuration
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Development

### Prerequisites

Make sure the backend is running on port 8000:

```bash
# In the root directory
uvicorn app.main:app --reload
```

### Key Components

1. **StoryCreator**: Initial story creation with filters and settings
2. **StoryChat**: Chat-like interface for continuing stories
3. **Context API**: Global state management for story sessions
4. **UI Components**: Reusable components with animations

### Customization

- **Colors**: Edit `tailwind.config.ts` for custom color schemes
- **Animations**: Modify animations in component files or CSS
- **API**: Update `src/lib/api.ts` for API endpoint changes

## Building for Production

```bash
npm run build
npm run start
```

## Mobile Optimization

The frontend is optimized for mobile devices with:

- Touch-friendly button sizes (minimum 44px)
- Responsive layouts for all screen sizes
- Mobile-specific animations and interactions
- Safe area support for modern phones

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast mode support
- Reduced motion preferences respected

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Minimum ES2020 support

## Troubleshooting

### Common Issues

1. **API Connection Error**
   - Check if backend is running on correct port
   - Verify `NEXT_PUBLIC_API_URL` in `.env.local`

2. **Styling Issues**
   - Run `npm run build` to regenerate CSS
   - Check for Tailwind class conflicts

3. **TypeScript Errors**
   - Run `npm run type-check` for detailed errors
   - Ensure all types are properly imported

## Contributing

When adding new features:

1. Follow existing component patterns
2. Add proper TypeScript types
3. Include responsive design considerations
4. Test on mobile devices
5. Maintain accessibility standards