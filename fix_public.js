const fs = require('fs');
const path = '/Users/ishan/Desktop/Bolt CRM V3/src/app/(public)/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
  [/bg-\[\#111\]/g, 'bg-[var(--bolt-bg-depth-2)]'],
  [/border-white\/10/g, 'border-[var(--bolt-border-color)]'],
  [/border-white\/20/g, 'border-[var(--bolt-border-color)]'],
  [/border-white\/5/g, 'border-[var(--bolt-border-color)]'],
  [/text-white\/70/g, 'text-[var(--bolt-text-secondary)]'],
  [/text-white\/60/g, 'text-[var(--bolt-text-secondary)]'],
  [/text-white\/50/g, 'text-[var(--bolt-text-secondary)]'],
  [/text-white\/40/g, 'text-[var(--bolt-text-secondary)]'],
  [/text-white\/30/g, 'text-[var(--bolt-text-tertiary)]'],
  [/text-white\/20/g, 'text-[var(--bolt-text-tertiary)]'],
  [/text-white/g, 'text-[var(--bolt-text-primary)]'],
  [/hover:bg-white\/10/g, 'hover:bg-[var(--bolt-hover-overlay-md)]'],
  [/hover:bg-white\/5/g, 'hover:bg-[var(--bolt-hover-overlay)]'],
  [/bg-white\/5/g, 'bg-[var(--bolt-bg-depth-3)]'],
  [/bg-white\/10/g, 'bg-[var(--bolt-bg-depth-4)]'],
  [/bg-white\/20/g, 'bg-[var(--bolt-bg-depth-5)]'],
  [/bg-black\/50/g, 'bg-[var(--bolt-bg-depth-1)]\/50'],
  [/bg-black\/40/g, 'bg-[var(--bolt-bg-depth-1)]\/40'],
  [/bg-black\/20/g, 'bg-[var(--bolt-bg-depth-1)]\/20'],
  [/from-black/g, 'from-[var(--bolt-bg-depth-1)]'],
  [/bg-\[\#0a0a0a\]/g, 'bg-[var(--bolt-bg-depth-1)]'],
  [/bg-black/g, 'bg-[var(--bolt-bg-depth-1)]'],
  [/via-black/g, 'via-[var(--bolt-bg-depth-1)]'],
  [/to-black/g, 'to-[var(--bolt-bg-depth-1)]'],
];

replacements.forEach(([regex, replacement]) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed public page.tsx');
