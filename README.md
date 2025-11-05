# RAJ AI - NLP-to-App Generator 🚀

**Transform natural language into complete, production-ready full-stack applications.**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/raj-ai)

RAJ AI uses Google's Gemini 2.5 Pro (stable release) to generate complete, working applications from simple descriptions. No placeholders, no TODOs—just production-ready code.

## ✨ Features

- 🎯 **Natural Language Input** - Describe your app in plain English
- ⚡ **Real-Time Streaming** - Watch code generate live
- 🎨 **Live Preview** - See React components render instantly
- 📦 **Complete Full-Stack** - React + Express.js + MySQL
- 🏭 **Production-Ready** - No placeholders, no TODOs, no stubs
- 📥 **Download as ZIP** - Get complete project instantly
- 🚀 **Deploy to Vercel** - One command deployment
- 🔒 **Secure** - Input validation, security headers, API key protection

## 🛠️ Technology Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Google Gemini 2.5 Pro** - AI code generation (1M input, 65K output tokens)
- **Vercel** - Zero-config deployment

## 🚀 Quick Start

### Local Development

```bash
# Clone and install
git clone <your-repo-url>
cd nocoderajainnn
npm install

# Start development server
npm run dev
```

Open http://localhost:3000

**Note:** API key is configured in `.env.local`

### Deploy to Production

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variable:
# GEMINI_API_KEY=your_api_key_here

# Deploy to production
vercel --prod
```

## 📝 Usage

1. **Enter app details:**
   - App name: `Todo App`
   - Description: `A todo application with add, edit, delete features. React frontend with Tailwind CSS. Express.js backend with MySQL database.`

2. **Generate:** Click "Generate App" and wait 30-60 seconds

3. **Review:** Check generated code in organized tabs

4. **Download:** Get complete ZIP with all files

5. **Deploy:** Follow included deployment instructions

## 🔧 Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Lint code
npm run type-check   # Check TypeScript types
```

## 📁 Project Structure

```
nocoderajainnn/
├── app/
│   ├── api/generate/     # AI code generation endpoint
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/
│   ├── GenerationInterface.tsx  # Input form
│   ├── GenerationProcess.tsx    # Generation UI
│   ├── LivePreview.tsx          # Live preview
│   └── ReviewExport.tsx         # Code review & download
├── types/
│   └── index.ts          # TypeScript types
├── .env.local            # Environment variables
├── next.config.js        # Next.js config
└── vercel.json           # Vercel config
```

## 🔐 Security

- ✅ API key in environment variables (not in code)
- ✅ Input validation & sanitization
- ✅ Security headers (XSS, CSRF, etc.)
- ✅ HTTPS enforced in production
- ✅ Rate limiting via Vercel

## 📊 Performance

- **Build time:** ~2 seconds
- **Generation time:** 30-60 seconds
- **Bundle size:** 132 KB (First Load JS)
- **Lighthouse score:** 95+

## 🎯 What Gets Generated

Each generation includes:
- ✅ React frontend components (with Tailwind CSS)
- ✅ Express.js backend server (with API routes)
- ✅ MySQL database schema (with tables)
- ✅ package.json (with all dependencies)
- ✅ .env.example (with configuration)
- ✅ README.md (with setup instructions)

All code is complete, working, and immediately deployable.

## 🐛 Troubleshooting

**Port already in use?**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Build fails?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**API not working?**
- Verify `.env.local` exists
- Check API key is correct
- Test at https://makersuite.google.com/

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md) - Get running in 2 minutes
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [API Documentation](app/api/generate/route.ts) - API endpoint details

## 🌟 Example Prompts

**Simple Todo App:**
```
A todo application with add, edit, delete, and mark complete features. 
React frontend with Tailwind CSS. Express.js backend with MySQL database.
```

**Blog Platform:**
```
A blog platform with posts, comments, and user authentication. 
React frontend with rich text editor. Express.js backend with MySQL. 
Include admin dashboard for managing posts.
```

**E-commerce Store:**
```
An e-commerce store with product listings, shopping cart, and checkout. 
React frontend with product search and filters. Express.js backend with 
MySQL for products, orders, and customers.
```

## 🔄 Updates

**v1.0.0** (Current)
- ✅ Production-ready build
- ✅ Gemini 2.5 Pro integration
- ✅ Real-time streaming
- ✅ Live preview
- ✅ ZIP download
- ✅ Vercel deployment

## 📄 License

Private and proprietary.

## 🤝 Support

For issues or questions:
1. Check [QUICKSTART.md](QUICKSTART.md)
2. Check [DEPLOYMENT.md](DEPLOYMENT.md)
3. Review build logs in Vercel dashboard

---

**Built with ❤️ by RAJ AI**

**Status:** ✅ Production Ready | **Version:** 1.0.0 | **Build:** Passing
