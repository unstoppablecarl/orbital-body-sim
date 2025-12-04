import { createApp } from 'vue'
import App from './App.vue'
import { registerViewport } from './lib/register-viewport.ts'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './styles/main.scss'
import 'pixi.js/math-extras';
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

registerViewport()
const app = createApp(App)
app.use(pinia)
app.mount('#app')
