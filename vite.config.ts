import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from "@rollup/plugin-yaml"
import ElementPlus from 'unplugin-element-plus/vite'
import {VitePluginRadar} from 'vite-plugin-radar'
import { visualizer } from "rollup-plugin-visualizer";

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
        },
        visualizer(),
    ],
    resolve: {
        alias: {
            '@': '/src',
        }
    },
    build: {
        rollupOptions: {
            treeshake: 'recommended',
            output: {
                compact: true,
                manualChunks(id) {
                    if (id.includes('node_modules/vue')
                        || id.includes('node_modules/@vue')
                        || id.includes('node_modules/lodash')) {
                        return 'vendor-1'
                    }
                    if (id.includes('node_modules/element-plus')
                        || id.includes('node_modules/@fortawesome')) {
                        return 'vendor-2'
                    }
                    if (id.includes('node_modules/')) {
                        return 'vendor-3'
                    }
                    if (id.includes('data/')) {
                        return 'data'
                    }
                }
            }
        }
    }
})
