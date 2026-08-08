import { createApp } from 'vue';
import App from 'src/App.vue';
import { router } from 'src/router';
import './style.css';

createApp(App).use(router).mount('#app');

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}
