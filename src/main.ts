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

import './polyfills/arrayGroup'
import { createApp as createVueApp } from 'vue'
import { ID_INJECTION_KEY } from 'element-plus'
import App from './App.vue'
import { createPinia } from 'pinia'
import { vLoading, ElInfiniteScroll } from 'element-plus'

export function createApp() {
    const pinia = createPinia()
    return createVueApp(App)
        .use(pinia)
        .provide(ID_INJECTION_KEY, {
            prefix: Date.now(),
            current: 0,
        })
        .directive('loading', vLoading)
        .directive('infinite-scroll', ElInfiniteScroll)
}
