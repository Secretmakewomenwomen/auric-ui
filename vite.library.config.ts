import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
const at=(path:string)=>fileURLToPath(new URL(path,import.meta.url));
export default defineConfig({
 publicDir:false,
 plugins:[react(),tailwindcss()],
 resolve:{alias:{'@studio':at('./src/studio'),'@engine':at('./src/engine'),'@chat':at('./src/chat'),'@':at('./src')}},
 build:{outDir:'packages/auricui/dist',emptyOutDir:true,minify:false,lib:{entry:{samples:at('./src/library/samples.ts'),index:at('./src/library/index.ts'),studio:at('./src/library/studio.ts'),chat:at('./src/library/chat.ts'),agent:at('./src/library/agent.ts')},formats:['es'],fileName:(_format,name)=>`${name}.mjs`,cssFileName:'styles'},rollupOptions:{external:id=>/^(react|react-dom|lucide-react|lexical|@lexical\/react|yjs)(\/|$)/.test(id),output:{chunkFileNames:'chunks/[name]-[hash].mjs'}}},
});
