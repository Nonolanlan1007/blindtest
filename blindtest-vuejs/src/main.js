import { createApp } from 'vue'
import App from './App.vue'
import store from "@/store/index.js";
import { inject } from '@vercel/analytics';
import Vue3Lottie from "vue3-lottie";

inject({
  debug: false
});

createApp(App)
  .use(store)
  .use(Vue3Lottie, { name: "Vue3Lottie" })
  .mount('#app')
