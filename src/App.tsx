import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Home from './components/Home';
import About from './components/About';
import PoemReader from './components/PoemReader';
import Admin from './components/Admin';
import { poems as initialPoems } from './data';
import { Poem } from './types';
import { auth, googleProvider } from './lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, signOut } from 'firebase/auth';

export default function App() {
  // Simple state-based router ('home', 'about', 'poem-ID', 'admin')
  const [currentView, setCurrentView] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Load poems and favorites from localStorage
    const savedPoems = localStorage.getItem('regis_poems_v5');
    if (savedPoems) {
      try {
        setPoems(JSON.parse(savedPoems));
      } catch (e) {
        setPoems(initialPoems);
      }
    } else {
      setPoems(initialPoems);
      localStorage.setItem('regis_poems_v5', JSON.stringify(initialPoems));
    }

    const savedFavorites = localStorage.getItem('regis_favorites_v5');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {}
    }
    setIsInitialized(true);
  }, []);

  // Save poems when they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('regis_poems_v5', JSON.stringify(poems));
    }
  }, [poems, isInitialized]);

  // Save favorites when they change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('regis_favorites_v5', JSON.stringify(favorites));
    }
  }, [favorites, isInitialized]);

  // Initialize dark mode based on system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Sync dark mode state with HTML class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const toggleFavorite = (poemId: string) => {
    setFavorites(prev => 
      prev.includes(poemId) ? prev.filter(id => id !== poemId) : [...prev, poemId]
    );
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const isAdmin = user?.email === 'nobleaidoo5@gmail.com';

  const renderContent = () => {
    if (!isInitialized) return null;

    if (currentView === 'home') {
      return <Home onNavigate={setCurrentView} poems={poems} favorites={favorites} toggleFavorite={toggleFavorite} />;
    }
    if (currentView === 'about') {
      return <About />;
    }
    if (currentView === 'admin') {
      if (!isAdmin) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-serif italic mb-6">Restricted Access</h2>
            <p className="mb-8 font-sans text-sm text-[var(--text-muted)]">You do not have permission to view this page.</p>
            {user ? (
              <button onClick={handleLogout} className="px-6 py-2 border border-[var(--border-color)] font-sans text-xs uppercase tracking-widest hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors">Sign Out</button>
            ) : (
              <button onClick={handleLogin} className="px-6 py-2 border border-[var(--border-color)] font-sans text-xs uppercase tracking-widest hover:bg-[var(--text-color)] hover:text-[var(--bg-color)] transition-colors">Admin Sign In</button>
            )}
          </div>
        );
      }
      return <Admin poems={poems} setPoems={setPoems} onNavigate={setCurrentView} onLogout={handleLogout} />;
    }
    if (currentView.startsWith('poem-')) {
      const poemId = currentView.split('poem-')[1];
      return <PoemReader poemId={poemId} onNavigate={setCurrentView} poems={poems} favorites={favorites} toggleFavorite={toggleFavorite} onToggleDarkMode={handleToggleDarkMode} />;
    }
    return <Home onNavigate={setCurrentView} poems={poems} favorites={favorites} toggleFavorite={toggleFavorite} />;
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[var(--bg-color)] text-[var(--text-color)] font-serif overflow-hidden selection:bg-[var(--text-muted)] selection:text-[var(--bg-color)] transition-colors duration-300">
      <Navigation
        currentView={currentView}
        onNavigate={setCurrentView}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        isAdmin={isAdmin}
      />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {(() => {
          const currentPoem = currentView.startsWith('poem-') 
            ? poems.find(p => p.id === currentView.split('poem-')[1]) 
            : null;
            
          if (currentPoem?.imageUrl) {
            return (
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img 
                  src={currentPoem.imageUrl} 
                  alt={currentPoem.imagePrompt || currentPoem.title} 
                  className="w-full h-full object-cover opacity-40 dark:opacity-30" 
                />
                <div className="absolute inset-0 bg-[var(--bg-color)]/80 dark:bg-[var(--bg-color)]/85 backdrop-blur-[2px]"></div>
              </div>
            );
          }
          return null;
        })()}
        
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 w-full flex flex-col">
          <header className="h-20 shrink-0 flex items-center justify-between px-8 md:px-12 border-b border-transparent hidden md:flex">
            <div className="text-[10px] md:text-xs font-sans tracking-widest uppercase text-[var(--text-muted)] font-semibold">
              {currentView === 'home' ? 'Selected Works' : currentView === 'about' ? 'About' : currentView === 'admin' ? 'Administration' : 'Reading Room'}
            </div>
          </header>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
