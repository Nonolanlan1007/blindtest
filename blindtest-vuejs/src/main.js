import { createApp } from 'vue'
import App from './App.vue'
import store from "@/store/index.js";
import { inject } from '@vercel/analytics';

inject({
  debug: false
});

createApp(App)
  .use(store)
  .mount('#app')
