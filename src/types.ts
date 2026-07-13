export interface Poem {
  id: string;
  title: string;
  category: string;
  stanzas: string[];
  imageUrl?: string;
  imagePrompt?: string;
  glyph?: string;
}
