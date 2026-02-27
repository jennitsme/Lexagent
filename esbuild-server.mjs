import { build } from 'esbuild';

await build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'server.js',
  external: [
    'express',
    'node-telegram-bot-api',
    '@google/genai',
    'openai',
    'vite',
  ],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
  },
});

console.log('Server bundled to server.js');
