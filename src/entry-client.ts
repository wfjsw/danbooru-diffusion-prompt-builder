/*******************************************************************************
 * Danbooru Diffusion Prompt Builder
 * Copyright (C) 2022  Jabasukuriputo Wang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 ******************************************************************************/

import {createApp} from './main'
import {useTagStore} from './stores/tags'
import {usePresetStore} from './stores/presets'
import {useEmbeddingStore} from './stores/embeddings'
import {useHypernetworkStore} from './stores/hypernetworks'
import './style.scss'
import 'element-plus/theme-chalk/el-loading.css'

createApp().mount('#app')

const tagStore = useTagStore()
const presetStore = usePresetStore()
const embeddingStore = useEmbeddingStore()
const hypernetworkStore = useHypernetworkStore()
tagStore.load();
presetStore.load();
embeddingStore.load();
hypernetworkStore.load();

if (import.meta.env.PROD) {
    const beforeUnloadListener = (event: any) => {
        event.preventDefault();
        return event.returnValue = "Are you sure you want to exit?";
    };
    window.addEventListener("beforeunload", beforeUnloadListener);
}

