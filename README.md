# Modern Dashboard Application

A responsive, modern dashboard application built with Next.js 15.5.2, featuring a clean UI design inspired by auth.thecityflyers.com.

## 🚀 Features

- **Modern Tech Stack**: Built with Next.js 15.5.2, React 18, and TypeScript
- **Responsive Design**: Fully responsive layout with collapsible sidebar
- **Theme Support**: Dark/Light mode with system preference detection
- **Multi-language Support**: Language selector with 12 languages
- **Typography**: Geist Sans font for modern, clean aesthetics
- **Component Library**: Comprehensive UI components using Radix UI
- **Accessible**: Built with accessibility-first principles
- **Performance Optimized**: Server-side rendering and optimized loading

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript 5.2.2
- **Styling**: Tailwind CSS 3.3.3
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Font**: Geist Sans
- **Theme**: next-themes for dark/light mode
- **Build Tools**: PostCSS, Autoprefixer

## 📦 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/babuas25/farmwork.git
   cd farmwork
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── blog/              # Blog page
│   ├── news/              # News page
│   ├── services/          # Services page
│   ├── travel-advisory/   # Travel Advisory page
│   ├── promotions/        # Promotions page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   │   ├── header.tsx    # Main header
│   │   ├── sidebar.tsx   # Collapsible sidebar
│   │   └── main-layout.tsx
│   ├── providers/        # Context providers
│   └── ui/              # UI component library
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── public/             # Static assets
```

## 🎨 Design Features

### Header (56px height)
- Fixed positioning for consistent navigation
- Search functionality
- Language selector with 12 languages
- Dark/Light theme toggle
- Responsive design with mobile menu

### Sidebar (80px collapsed, 256px expanded)
- Smooth collapse/expand animations
- Navigation with icons and labels
- Submenu support for Services
- Chevron indicators (right when collapsed, left when expanded)
- Matches auth.thecityflyers.com design specifications

### Layout
- Responsive grid system
- Smooth transitions and animations
- Optimized for both desktop and mobile devices
- Progressive enhancement for better performance

## 🌟 Key Components

### Navigation Items
- **Home**: Dashboard overview
- **Services**: Expandable menu with submenu options
- **Travel Advisory**: Travel information and updates
- **News**: Latest news and updates
- **Blog**: Blog posts and articles
- **Promotions**: Special offers and promotions

### Theme System
- System preference detection
- Manual light/dark mode toggle
- Smooth theme transitions
- Persistent theme selection

### Language Support
- 12 language options with flag indicators
- Persistent language selection
- Browser language detection
- Ready for i18n integration

## 📱 Responsive Design

- **Desktop**: Full sidebar and header layout
- **Tablet**: Collapsible sidebar with overlay
- **Mobile**: Drawer-style navigation menu
- **Touch-friendly**: Optimized for touch interactions

## 🚀 Performance Features

- **Server-Side Rendering**: Fast initial page loads
- **Code Splitting**: Automatic route-based code splitting
- **Font Optimization**: Optimized Geist Sans loading
- **Image Optimization**: Next.js Image component ready
- **Progressive Enhancement**: Stable hydration without layout shifts

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Development Guidelines

1. **Components**: Use the existing UI component library
2. **Styling**: Utilize Tailwind CSS classes
3. **TypeScript**: Maintain strict type safety
4. **Accessibility**: Follow WCAG guidelines
5. **Performance**: Optimize for Core Web Vitals

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and modern web technologies**
