import { motion } from 'motion/react';
import { useState, Dispatch, SetStateAction } from 'react';
import { Poem } from '../types';
import { Plus, Edit2, Trash2, X, Save, LogOut } from 'lucide-react';

interface AdminProps {
  poems: Poem[];
  setPoems: Dispatch<SetStateAction<Poem[]>>;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export default function Admin({ poems, setPoems, onNavigate, onLogout }: AdminProps) {
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [stanzasText, setStanzasText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [glyph, setGlyph] = useState('');
  const [tagsText, setTagsText] = useState('');

  const handleEdit = (poem: Poem) => {
    setEditingPoem(poem);
    setTitle(poem.title);
    setCategory(poem.category);
    setStanzasText(poem.stanzas.join('\n\n'));
    setImageUrl(poem.imageUrl || '');
    setImagePrompt(poem.imagePrompt || '');
    setGlyph(poem.glyph || '');
    setTagsText(poem.tags ? poem.tags.join(', ') : '');
    setIsAdding(false);
  };

  const handleAdd = () => {
    setEditingPoem(null);
    setTitle('');
    setCategory('');
    setStanzasText('');
    setImageUrl('');
    setImagePrompt('');
    setGlyph('');
    setTagsText('');
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this poem?')) {
      setPoems(poems.filter(p => p.id !== id));
      if (editingPoem?.id === id) {
        cancelEdit();
      }
    }
  };

  const cancelEdit = () => {
    setEditingPoem(null);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!title.trim() || !category.trim() || !stanzasText.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const stanzas = stanzasText.split('\n\n').filter(s => s.trim() !== '');
    const tagList = tagsText.split(',').map(t => t.trim()).filter(t => t !== '');

    if (isAdding) {
      const newPoem: Poem = {
        id: Date.now().toString(),
        title: title.trim(),
        category: category.trim(),
        stanzas,
        imageUrl: imageUrl.trim() || undefined,
        imagePrompt: imagePrompt.trim() || undefined,
        glyph: glyph.trim() || undefined,
        tags: tagList.length > 0 ? tagList : undefined,
      };
      setPoems([...poems, newPoem]);
    } else if (editingPoem) {
      const updatedPoems = poems.map(p => 
        p.id === editingPoem.id 
          ? { ...p, title: title.trim(), category: category.trim(), stanzas, imageUrl: imageUrl.trim() || undefined, imagePrompt: imagePrompt.trim() || undefined, glyph: glyph.trim() || undefined, tags: tagList.length > 0 ? tagList : undefined } 
          : p
      );
      setPoems(updatedPoems);
    }
    
    cancelEdit();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full flex-1 flex flex-col md:flex-row p-6 md:p-12 gap-12"
    >
      {/* Left side: List of poems */}
      <div className="w-full md:w-1/3 flex flex-col border-r border-transparent md:border-[var(--border-light)] md:pr-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-serif italic text-[var(--text-color)]">Poetry Archive</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 text-xs uppercase tracking-widest font-sans font-bold text-[var(--text-color)] hover:text-[var(--text-muted)] transition-colors p-2"
            >
              <Plus size={14} /> New
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-xs uppercase tracking-widest font-sans font-bold text-[var(--text-muted)] hover:text-red-500 transition-colors p-2 border-l border-[var(--border-color)] ml-2 pl-4"
              title="Sign Out"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
        
        <ul className="space-y-4 overflow-y-auto max-h-[60vh] pr-2">
          {poems.map(poem => (
            <li 
              key={poem.id} 
              className={`flex items-center justify-between p-4 border rounded-sm transition-colors ${editingPoem?.id === poem.id ? 'border-[var(--text-color)] bg-[var(--sidebar-bg)]' : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'}`}
            >
              <div className="flex-1 truncate pr-4">
                <h3 className="font-serif text-md truncate text-[var(--text-color)]">{poem.title}</h3>
                <p className="text-[10px] font-sans tracking-widest uppercase text-[var(--text-muted)]">{poem.category}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleEdit(poem)} className="p-2 text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(poem.id)} className="p-2 text-[var(--text-muted)] hover:text-red-500 transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Right side: Editor */}
      <div className="w-full md:w-2/3 flex flex-col max-w-[800px]">
        {(isAdding || editingPoem) ? (
          <div className="flex flex-col h-full bg-[var(--bg-color)]">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--border-light)]">
              <h2 className="text-xl font-serif italic text-[var(--text-color)]">
                {isAdding ? 'Compose New Poem' : 'Editing: ' + editingPoem.title}
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 text-xs uppercase tracking-widest font-sans font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 text-xs uppercase tracking-widest font-sans font-bold bg-[var(--text-color)] text-[var(--bg-color)] px-4 py-2 rounded-sm hover:opacity-80 transition-opacity"
                >
                  <Save size={14} /> Save
                </button>
              </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pb-8">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-semibold text-[var(--text-muted)] mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent border border-[var(--border-color)] p-3 text-[var(--text-color)] font-serif focus:outline-none focus:border-[var(--text-color)] transition-colors"
                  placeholder="e.g. The Quiet Hour"
                />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-semibold text-[var(--text-muted)] mb-2">Theme / Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent border border-[var(--border-color)] p-3 text-[var(--text-color)] font-sans text-sm focus:outline-none focus:border-[var(--text-color)] transition-colors"
                  placeholder="e.g. Nature, Urban, Reflection"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-semibold text-[var(--text-muted)] mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="w-full bg-transparent border border-[var(--border-color)] p-3 text-[var(--text-color)] font-sans text-sm focus:outline-none focus:border-[var(--text-color)] transition-colors"
                  placeholder="e.g. Joy, Resilience, Loss"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-semibold text-[var(--text-muted)] mb-2">Image URL (Optional)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-transparent border border-[var(--border-color)] p-3 text-[var(--text-color)] font-sans text-sm focus:outline-none focus:border-[var(--text-color)] transition-colors"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-semibold text-[var(--text-muted)] mb-2">Depiction Prompt (Optional)</label>
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  className="w-full bg-transparent border border-[var(--border-color)] p-3 text-[var(--text-color)] font-sans text-sm focus:outline-none focus:border-[var(--text-color)] transition-colors"
                  placeholder="A prompt describing the poem's imagery..."
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-sans font-semibold text-[var(--text-muted)] mb-2">Typographic Glyph Art (Optional)</label>
                <input
                  type="text"
                  value={glyph}
                  onChange={(e) => setGlyph(e.target.value)}
                  className="w-full bg-transparent border border-[var(--border-color)] p-3 text-[var(--text-color)] font-serif focus:outline-none focus:border-[var(--text-color)] transition-colors"
                  placeholder="e.g. ≈, §, ❖, ¶, &, ["
                  maxLength={2}
                />
              </div>

              <div className="flex-1 flex flex-col min-h-[400px]">
                <label className="block text-[10px] uppercase tracking-widest font-sans font-semibold text-[var(--text-muted)] mb-2">
                  Stanzas (Separate stanzas with a blank line)
                </label>
                <textarea
                  value={stanzasText}
                  onChange={(e) => setStanzasText(e.target.value)}
                  className="w-full flex-1 bg-transparent border border-[var(--border-color)] p-4 text-[var(--text-color)] font-serif leading-[1.75] resize-y focus:outline-none focus:border-[var(--text-color)] transition-colors"
                  placeholder={`Line one\nLine two\n\nStanza two...`}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Edit2 size={48} className="mb-6 text-[var(--text-muted)]" />
            <h2 className="text-2xl font-serif italic mb-2">Select a poem to edit</h2>
            <p className="text-sm font-sans tracking-widest uppercase text-[var(--text-muted)]">or create a new one</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
