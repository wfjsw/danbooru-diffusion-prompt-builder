import {createApp} from './main'
import {useTagStore} from './stores/tags'
import {usePresetStore} from './stores/presets'
import {useEmbeddingStore} from './stores/embeddings'
import './style.scss'
import 'element-plus/theme-chalk/el-loading.css'
// import '@fortawesome/fontawesome-svg-core/styles.css'

createApp().mount('#app')

const tagStore = useTagStore()
const presetStore = usePresetStore()
const embeddingStore = useEmbeddingStore()
tagStore.load();
presetStore.load();
embeddingStore.load();

const beforeUnloadListener = (event: any) => {
    event.preventDefault();
    return event.returnValue = "Are you sure you want to exit?";
};
window.addEventListener("beforeunload", beforeUnloadListener);
