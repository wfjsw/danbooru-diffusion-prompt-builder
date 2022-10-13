import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import yaml from "@rollup/plugin-yaml"
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), yaml(), ElementPlus( { useSource: true } )],
  resolve: {
    alias: {
        '@': '/src',
    }
  }
})
