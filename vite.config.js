import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import babel from '@rollup/plugin-babel'

export default defineConfig({
  plugins: [
    preact(),
    babel({
      presets: ['@babel/preset-env', '@babel/preset-react']
    })
  ]
})
