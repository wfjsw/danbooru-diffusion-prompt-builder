import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from "@rollup/plugin-yaml"
import ElementPlus from 'unplugin-element-plus/vite'
import {VitePluginRadar} from 'vite-plugin-radar'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        yaml(),
        ElementPlus( { useSource: true } ),
        {
            ...VitePluginRadar({
                analytics: {
                    id: 'G-WYETBX79HJ',
                }
            }),
            apply(config, {command}) {
                return command === 'build' && config.mode === 'production'
            }
        }
    ],
    resolve: {
        alias: {
            '@': '/src',
        }
    }
})
