import {createApp as createVueApp} from 'vue'
import { ID_INJECTION_KEY } from 'element-plus'
import App from './App.vue'
import {createPinia} from "pinia";
import { vLoading, ElInfiniteScroll } from 'element-plus'

export function createApp() {
    const pinia = createPinia()
    return createVueApp(App)
        .use(pinia)
        .provide(ID_INJECTION_KEY, {
            prefix: Date.now(),
            current: 0
        })
        .directive('loading', vLoading)
        .directive('infinite-scroll', ElInfiniteScroll)
}


