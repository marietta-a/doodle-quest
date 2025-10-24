// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  
  // ADD THIS SERVER CONFIGURATION BLOCK
  server: {
    port: 5173, // You can specify a port if you want
    strictPort: true, // Throws an error if the port is already in use
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 5173, // This port must match the server's port
    },
  },
  // Required for story.html to be a separate entry point
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        story: 'result.html'
      }
    }
  }
})