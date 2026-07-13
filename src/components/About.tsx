import { motion } from 'motion/react';

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      className="w-full flex-1 flex flex-col items-center justify-center py-16 px-6 md:px-12 overflow-y-auto"
    >
      <div className="w-full max-w-[600px] text-left">
        <h1 className="text-3xl md:text-4xl font-normal italic mb-8 leading-tight text-[var(--text-color)]">
          Aidoo Noble Abeiku Amos
        </h1>
        
        <div className="font-sans text-[10px] tracking-widest uppercase text-[var(--text-muted)] font-semibold mb-12 opacity-70">
          Biography & Contact
        </div>

        <div className="font-serif text-[18px] md:text-[20px] leading-[1.75] text-[var(--text-color)] space-y-8 selection:bg-[var(--text-muted)] selection:text-[var(--bg-color)]">
          <p>
            Aidoo Noble Abeiku Amos is a writer and creator focused on the intersection of structure, logic, and creative expression. His poetry navigates the tensions of ambition, the quiet stillness of nature, the complexities of human emotion, and the persistent drive to stand resilient in an unyielding world.
          </p>
          <p>
            Through sharp imagery and structural clarity, his work seeks to capture the enduring sparks of hope hidden within everyday chaos.
          </p>
          <p>
            For inquiries, collaborations, or simply to share a thought, please feel free to reach out.
          </p>
        </div>
        
        <div className="mt-20 pt-8 border-t border-[var(--border-light)] flex justify-start gap-8">
          <a href="#" className="font-sans text-xs tracking-widest uppercase font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors">
            Email
          </a>
          <a href="#" className="font-sans text-xs tracking-widest uppercase font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors">
            Twitter
          </a>
          <a href="#" className="font-sans text-xs tracking-widest uppercase font-bold text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors">
            Instagram
          </a>
        </div>
      </div>
    </motion.div>
  );
}
