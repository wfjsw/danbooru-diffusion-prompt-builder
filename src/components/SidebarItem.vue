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

<script setup lang="ts">
import type { CategoryHierarchy } from '../types/data'
import {ElSubMenu, ElMenuItem} from 'element-plus'

withDefaults(
    defineProps<{
        hierarchy: CategoryHierarchy,
        categorySize: Record<string, number>,
        prefix?: string
    }>(),
    {
        prefix: '',
    }
)
</script>

<template>
    <template v-for="(child, category) in hierarchy" :key="category">
        <ElSubMenu
            v-if="child !== true"
            :index="(category as string)">
            <template #title>
                {{ category }}
            </template>
            <SidebarItem
                :hierarchy="child"
                :prefix="`${prefix}${category}/`"
                :category-size="categorySize" />
        </ElSubMenu>
        <ElMenuItem v-else :index="(category as string)">
            <div class="flex">
                <div class="category-name">{{ category }}</div>
                <div class="category-size">
                    {{ categorySize[`${prefix}${category}`] }}
                </div>
            </div>
        </ElMenuItem>
    </template>
</template>

<style scoped>

.flex {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

.category-size {
    font-size: small;
}
</style>
