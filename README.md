# torre xplor

A modern React application for exploring Torre's professional network. Search for people, analyze skills, and discover talent from Torre's global community.

## 🚀 Features

- **Real-time Search**: Search through Torre's network of professionals
- **Skills Analysis**: Visualize trending skills and strengths with interactive charts
- **Profile Details**: View detailed user profiles with skills, experience, and education
- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Export & Share**: Export search results and share findings
- **Floating Actions**: Quick access to common actions with floating action button

## 🛠 Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS v4.0
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Build Tool**: Vite

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd torre-xplor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 🌐 API Integration

The application integrates with Torre's API endpoints:

### Backend Architecture

The backend logic is separated into dedicated service files:

## 🎨 Design Features

### Modern UI Components
- Responsive grid layouts
- Smooth hover effects and transitions
- Loading skeletons and states
- Toast notifications for user feedback
- Modal dialogs for detailed views

### Animations
- Page transitions with Framer Motion
- Staggered card animations
- Smooth scroll behaviors
- Interactive button states

### Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly

## 📊 Skills Analysis

The application includes advanced data visualization features:

- **Trending Skills**: Bar charts showing most common skills
- **Strength Analysis**: Visual representation of professional strengths
- **Statistics**: Key metrics and insights from search results
- **Export Functionality**: Download analysis data as JSON

## 🚀 Deployment

The application is production-ready and can be deployed to any static hosting service:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop the `dist` folder
- **GitHub Pages**: Use GitHub Actions for automated deployment

## 🔍 Usage

1. **Search**: Enter a name or skill in the search bar
2. **Browse Results**: View professionals in a responsive grid
3. **View Profiles**: Click on any card to see detailed information
4. **Analyze Skills**: Toggle the skills analysis to see trends
5. **Export Data**: Use the floating action button to export results
6. **Share**: Share search results with others

## 🎯 Key Features Showcase

### Creative Elements
- Interactive skills analysis with data visualization
- Floating action button with expandable menu
- Toast notification system
- Smooth animations and micro-interactions

### Technical Excellence
- Separation of concerns (frontend/backend logic)
- Custom React hooks for state management
- Error handling and loading states
- Responsive design for all devices
- Performance optimized with lazy loading

### User Experience
- Intuitive search interface
- Real-time search with debouncing
- Pagination for large result sets
- Keyboard shortcuts and accessibility
- Export and sharing capabilities

## 📝 Development Notes

### Code Quality
- ESLint configuration for code consistency
- Component-based architecture
- Custom hooks for reusable logic
- Utility functions for data processing

### Performance
- Optimized bundle size with tree shaking
- Lazy loading of components
- Debounced search to reduce API calls
- Efficient re-rendering with React best practices

## LLM/AI Usage

- **Tool Used:** GitHub Copilot (Agent Mode)  
- **Model Used:** Claude Sonnet 4  

### Prompts Used
- "I’m building a project using the Torre API, where I need to display genomes (profiles) from their database. Can you help me implement a recommendations feature that suggests related genomes based on one person’s profile? Ideally, this should look at skills and experiences to find similar matches."  

- "I need to implement a comparison feature that allows users to select two or more genomes and compare their skill sets side by side. How should I structure the data for this in React, and what’s a clean UI layout for presenting the differences and overlaps?"  

- "For styling the site, I’d like to use a consistent theme with the colors `#CDDC39` (lime green) and `#383B40` (dark gray). Can you suggest how to apply these colors in a Tailwind-based setup to create a clean and responsive design that works well on both desktop and mobile?"  

- "I have API keys provided by Torre that need to be used securely for fetching genome data. Can you guide me on how to integrate these keys in the backend (with Node/Express) without hardcoding them, and make sure they still work when deploying to Vercel?"  

- "I want to add search and filtering capabilities to the genome listing page. Users should be able to search by name or skill and filter by different criteria. What’s the best way to structure these filters in the frontend, and how should I call the Torre API to make it efficient?"  

- "Sometimes when I fetch data from the Torre API, I get CORS errors or undefined results. Can you help me debug these issues and show me how to set up a proxy or middleware so the API calls work properly in development and production?"    

- "I want to make sure the app looks polished. Can you suggest responsive UI patterns (like grid layouts or cards) for displaying multiple genomes at once, and also how to handle empty states or loading states so the UX feels smooth?"  

- "What’s the best way to connect my frontend (React + Vite) with the backend API? I want to make sure the environment variables are handled correctly and the API calls remain secure when deployed to Vercel."  

- "How should I handle errors gracefully in the app? For example, if the Torre API returns no results or an error, how can I show a proper error message or fallback UI instead of the site breaking?"  

## 📄 License

This project is created as a technical test for Torre Engineering.

---

Built with ❤️ using React, Tailwind CSS, and Torre API
