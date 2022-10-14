import {createApp} from 'vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.scss'
import App from './App.vue'
import {createPinia} from "pinia";

const pinia = createPinia()

createApp(App)
    .use(pinia)
    .mount('#app')

const beforeUnloadListener = (event: any) => {
    event.preventDefault();
    return event.returnValue = "Are you sure you want to exit?";
};

window.addEventListener("beforeunload", beforeUnloadListener);
