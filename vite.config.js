import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        favorites: resolve(__dirname, 'favorites.html'),
        grocery: resolve(__dirname, 'grocery.html'),
        recipe: resolve(__dirname, 'recipe.html')
      }
    }
  }
})
