import {InjectionKey} from 'vue'

export const setSearch = Symbol() as InjectionKey<(criteria: string) => void>
