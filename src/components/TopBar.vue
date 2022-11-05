<!------------------------------------------------------------------------------
  - Danbooru Diffusion Prompt Builder
  - Copyright (C) 2022  Jabasukuriputo Wang
  -
  - This program is free software: you can redistribute it and/or modify
  - it under the terms of the GNU Affero General Public License as published by
  - the Free Software Foundation, either version 3 of the License, or
  - (at your option) any later version.
  -
  - This program is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU Affero General Public License for more details.
  -
  - You should have received a copy of the GNU Affero General Public License
  - along with this program.  If not, see <https://www.gnu.org/licenses/>.
  -
  ----------------------------------------------------------------------------->

<script lang="ts" setup>
import {ref, computed} from 'vue'
import {ElButton, ElInput} from 'element-plus'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {faBars, faCartShopping, faMagnifyingGlass} from '@fortawesome/pro-regular-svg-icons'
import {Search as IconSearch} from '@element-plus/icons-vue'
import ExtLinks from './ExtLinks.vue'
import FeatureSwitches from './FeatureSwitches.vue'

const props = defineProps<{
    search: string,
}>()
const emit = defineEmits([
    'update:search',
    'expandCategory',
    'expandCart'
])
const mobileExpandSearch = ref(false)

const searchTerms = computed({
    get: () => props.search,
    set: (value: string) => emit('update:search', value)
})

</script>

<template>
    <div :class="['topbar', {'is-search-expanded': mobileExpandSearch}]">
        <div class="left">
            <ElButton size="large" text class="category-cascader" @click="emit('expandCategory')">
                <FontAwesomeIcon :icon="faBars" />
            </ElButton>
            <span class="app-title text-large font-600 mr-3">
                Danbooru 标签超市
            </span>
        </div>
        <div class="right split">
            <ElInput v-model="searchTerms" :prefix-icon="IconSearch" class="search"
                     placeholder="搜索" />
            <div class="mobile-topbar-orig-el">
                <FeatureSwitches class="switches" />
                <ExtLinks class="extlinks" />
            </div>
            <ElButton size="large" text class="search-cascader"
                      @click="mobileExpandSearch = !mobileExpandSearch">
                <FontAwesomeIcon :icon="faMagnifyingGlass" />
            </ElButton>
            <ElButton size="large" text class="cart-cascader" @click="emit('expandCart')">
                <FontAwesomeIcon :icon="faCartShopping" />
            </ElButton>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    line-height: 18px;

    .left {
        display: flex;
        align-items: center;
        gap: 2rem;
        font-size: 18px;
        color: var(--el-text-color-primary);
    }
    .right {
        display: flex;
        gap: 2rem;
        align-items: center;
    }

}

.search {
    max-width: 15rem;
    min-width: 8rem;
}

@media (max-width: 768px) {
    .topbar {
        .left {
            gap: 0.5rem;
            width: 100%;
            transition: 1s all;
        }
        .right {
            justify-content: flex-end;
            gap: 0.5rem;
        }
        .search {
            display: none;
        }

        &.is-search-expanded {
            .left {
                width: unset;
            }
            .right {
                width: 100%;
                flex-grow: 1;
            }
            .app-title {
                display: none;
            }
            .search {
                display: block;
                width: 100%;
            }
        }
    }
}

.extlinks {
    margin-right: 0;
}

.switches {
    > * {
        margin-right: 1rem;
    }
}

.category-cascader, .cart-cascader, .search-cascader {
    padding: 12px 15px;
    margin-left: 0;
}

@media screen and (min-width: 1025px) {
    .category-cascader, .cart-cascader {
        display: none;
    }
}

@media screen and (min-width: 768px) {
    .search-cascader {
        display: none;
    }
}
</style>

