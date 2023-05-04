import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Naive-Bayes-Classifier/',
  plugins: [vue(),VitePWA({registerType: 'autoUpdate', manifest: {
    "name": "Explorable: Naive Bayes Classifier",
    "icons": [
      {
        "src": "icons/bayes_icon.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }})],
  optimizeDeps: {
    exclude: ['vue-mathjax']
  }
})
