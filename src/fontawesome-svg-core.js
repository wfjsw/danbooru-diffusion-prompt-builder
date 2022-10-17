import {
    register,
    ReplaceElements
} from '@fortawesome/fontawesome-svg-core/plugins'

const api = register([ReplaceElements])

export const {parse, icon, config, text} = api
