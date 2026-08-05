import { Lock, Unlock } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAdmin?: boolean;
}

export default function Navigation({
  currentView,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
  isAdmin,
}: NavigationProps) {
  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-10 w-full bg-[var(--sidebar-bg)] border-b border-[var(--border-color)] h-16 flex items-center justify-between px-6 transition-colors duration-300">
        <div 
          className="text-xs tracking-[0.2em] uppercase font-sans font-bold text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-color)]"
          onClick={() => onNavigate('home')}
        >
          Regis
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('home')} className={`text-[10px] tracking-widest uppercase font-sans font-bold ${currentView === 'home' || currentView.startsWith('poem-') ? 'text-[var(--text-color)]' : 'text-[var(--text-muted)]'}`}>Work</button>
          <button onClick={() => onNavigate('about')} className={`text-[10px] tracking-widest uppercase font-sans font-bold ${currentView === 'about' ? 'text-[var(--text-color)]' : 'text-[var(--text-muted)]'}`}>About</button>
          <button onClick={() => onNavigate('admin')} className={`flex items-center gap-1 text-[10px] tracking-widest uppercase font-sans font-bold ${currentView === 'admin' ? 'text-[var(--text-color)]' : 'text-[var(--text-muted)]'}`}>
            <span>Admin</span>
            {isAdmin ? <Unlock size={10} /> : <Lock size={10} />}
          </button>
          <button
            onClick={onToggleDarkMode}
            className="w-8 h-4 rounded-full bg-[var(--border-color)] relative focus:outline-none ml-2"
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-[var(--bg-color)] shadow-sm transition-all duration-300 ${isDarkMode ? 'left-[18px]' : 'left-0.5'}`}></div>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-72 border-r border-[var(--border-color)] flex-col h-full bg-[var(--sidebar-bg)] shrink-0 transition-colors duration-300">
        <div className="p-8 flex-1 flex flex-col">
          <h1 
            className="text-xs tracking-[0.2em] uppercase font-sans font-bold mb-10 text-[var(--text-muted)] cursor-pointer hover:text-[var(--text-color)]"
            onClick={() => onNavigate('home')}
          >
            Regis
          </h1>
          <div className="space-y-8 flex-1">
            <section>
              <h2 className="text-[10px] tracking-widest uppercase font-sans font-semibold text-[var(--text-muted)] mb-4 opacity-70">Menu</h2>
              <ul className="space-y-3 font-sans">
                <li>
                  <button onClick={() => onNavigate('home')} className={`text-sm ${currentView === 'home' || currentView.startsWith('poem-') ? 'border-l-2 border-[var(--text-color)] pl-3 font-medium text-[var(--text-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-color)] pl-4'} transition-colors`}>Collection</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('about')} className={`text-sm ${currentView === 'about' ? 'border-l-2 border-[var(--text-color)] pl-3 font-medium text-[var(--text-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-color)] pl-4'} transition-colors`}>About & Contact</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('admin')} className={`text-sm flex items-center justify-between w-full pr-4 ${currentView === 'admin' ? 'border-l-2 border-[var(--text-color)] pl-3 font-medium text-[var(--text-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-color)] pl-4'} transition-colors`}>
                    <span>Admin Panel</span>
                    {isAdmin ? <Unlock size={12} className="opacity-50" /> : <Lock size={12} className="opacity-50" />}
                  </button>
                </li>
              </ul>
            </section>
          </div>
          
          <div className="mt-8 text-[10px] text-[var(--text-muted)] font-sans">
            &copy; {new Date().getFullYear()} Aidoo Noble Abeiku Amos. All rights reserved.
          </div>
        </div>
        <div className="p-8 border-t border-[var(--border-color)] flex items-center justify-between font-sans">
          <span className="text-[10px] tracking-widest uppercase font-bold text-[var(--text-muted)]">Dark Mode</span>
          <button
            onClick={onToggleDarkMode}
            className="w-8 h-4 rounded-full bg-[var(--border-color)] relative focus:outline-none focus:ring-2 focus:ring-[var(--text-muted)]"
            aria-label="Toggle dark mode"
          >
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-[var(--bg-color)] shadow-sm transition-all duration-300 ${isDarkMode ? 'left-[18px]' : 'left-0.5'}`}></div>
          </button>
        </div>
      </nav>
    </>
  );
}
