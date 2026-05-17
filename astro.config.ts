import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://csu-worksign.elvislo.tw',
  base: '/',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
