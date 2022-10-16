import {createApp} from 'vue'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.scss'
import App from './App.vue'
import {createPinia} from "pinia";
import {useTagStore} from "./stores/tags";
import {usePresetStore} from "./stores/presets";

const pinia = createPinia()

createApp(App)
    .use(pinia)
    .mount('#app')

const tagStore = useTagStore()
const presetStore = usePresetStore()
tagStore.load();
presetStore.load();

const beforeUnloadListener = (event: any) => {
    event.preventDefault();
    return event.returnValue = "Are you sure you want to exit?";
};

window.addEventListener("beforeunload", beforeUnloadListener);
