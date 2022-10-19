<script lang="ts" setup>
import {h, computed} from 'vue'
import {ElButton, ElInput, ElSwitch, ElTooltip} from "element-plus";
import {Search as IconSearch} from "@element-plus/icons-vue";
import ExtLinks from './ExtLinks.vue'
import FeatureSwitches from './FeatureSwitches.vue'

const props = defineProps<{
    search: string,
}>()
const emit = defineEmits(['update:search'])

const searchTerms = computed({
    get: () => props.search,
    set: (value: string) => emit('update:search', value)
})

</script>

<template>
    <div class="topbar">
        <div class="left">
            <span class="text-large font-600 mr-3"> Danbooru 标签超市 </span>
        </div>
        <div class="right split">
            <ElInput v-model="searchTerms" :prefix-icon="IconSearch" class="search"
                     placeholder="搜索"/>
            <FeatureSwitches class="switches d-none d-inline-flex-sm"/>
            <ExtLinks class="extlinks d-none d-inline-flex-sm"/>
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

.restricted-switch {
    --el-switch-on-color: var(--el-color-danger);
    --el-switch-off-color: var(--el-color-success);
}

.extlinks {
    margin-right: 0;
}

.switches {
    > * {
        margin-right: 1rem;
    }
}
</style>

