import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { compilerOptions } from 'vue3-pixi'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
            return tag === 'Viewport' || tag === 'ParticleContainer' || compilerOptions.isCustomElement(tag)
          },
        },
      },
    }),
  ],
  optimizeDeps: {
    include: ['pixi.js', 'vue3-pixi', 'pixi-viewport'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    target: 'es2020',
  },
  css: {
    preprocessorOptions: {
      scss: {
        // bootstrap still uses deprecated but supported sass features
        silenceDeprecations: ['color-functions', 'global-builtin', 'import'],
      },
    },
  },
})