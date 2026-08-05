import { motion } from 'motion/react';
import { useState } from 'react';
import { Poem } from '../types';
import { Star } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string) => void;
  poems: Poem[];
  favorites: string[];
  toggleFavorite: (poemId: string) => void;
}

export default function Home({ onNavigate, poems, favorites, toggleFavorite }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPoems = poems.filter(poem => 
    poem.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    poem.stanzas.some(stanza => stanza.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (poem.tags && poem.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Group poems by category
  const groupedPoems = filteredPoems.reduce((acc, poem) => {
    if (!acc[poem.category]) {
      acc[poem.category] = [];
    }
    acc[poem.category].push(poem);
    return acc;
  }, {} as Record<string, typeof poems>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full flex-1 flex flex-col items-center py-12 px-6 md:px-12"
    >
      <div className="w-full max-w-[600px]">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-normal italic mb-6 text-left leading-tight text-[var(--text-color)]">
            Selected Works
          </h1>
          <input
            type="text"
            placeholder="Search poems by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--border-color)] pb-2 text-[var(--text-color)] font-sans text-sm focus:outline-none focus:border-[var(--text-color)] transition-colors placeholder:text-[var(--text-muted)]"
          />
        </header>

        {Object.keys(groupedPoems).length === 0 ? (
          <p className="text-[var(--text-muted)] font-serif italic">No poems found matching your search.</p>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedPoems).map(([category, categoryPoems]) => (
              <section key={category}>
                <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-sans font-semibold mb-6 opacity-70">
                  {category}
                </h2>
                <ul className="space-y-3">
                  {categoryPoems.map((poem) => (
                    <li key={poem.id} className="group flex items-center justify-between border-l border-transparent hover:border-[var(--text-color)] pl-4 hover:pl-6 transition-all duration-300">
                      <button
                        onClick={() => onNavigate(`poem-${poem.id}`)}
                        className="flex flex-col items-start text-left focus:outline-none flex-1"
                      >
                        <span className="font-serif text-lg md:text-xl text-[var(--text-muted)] group-hover:text-[var(--text-color)] transition-colors duration-300">
                          {poem.title}
                        </span>
                      </button>
                      <button
                        onClick={() => toggleFavorite(poem.id)}
                        className={`ml-4 p-2 focus:outline-none transition-colors ${favorites.includes(poem.id) ? 'text-yellow-500' : 'text-[var(--border-color)] hover:text-[var(--text-muted)]'}`}
                        aria-label={favorites.includes(poem.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star size={16} fill={favorites.includes(poem.id) ? "currentColor" : "none"} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
