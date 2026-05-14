import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '/Goal _Zone',
        short_name: '/Goal_zone',
        description: 'An app that forces you to do your tasks in a limited zone.',
        theme_color: '#00b7db',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/goalzone_icon_192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src:'/goalzone_icon_512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
    }
  })
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})

//-----