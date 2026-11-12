import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { existsSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const certPath = path.resolve('./cert/localhost.crt')
const keyPath = path.resolve('./cert/localhost.key')
const httpsEnabled = existsSync(certPath) && existsSync(keyPath)

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            name: 'emit-manifest-vite-plugin',
            writeBundle() {
                const manifestContent = {
                    Category: 'Page',
                    Framework: 'React',
                }
                const outputPath = resolve(__dirname, 'dist/manifest.json')
                writeFileSync(outputPath, JSON.stringify(manifestContent, null, 2))
            },
        },
    ],
    base: '',
    build: {
        target: 'es2022',
        outDir: 'dist',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
        host: '0.0.0.0',
        ...(httpsEnabled
            ? {
                  https: {
                      cert: certPath,
                      key: keyPath,
                  },
              }
            : {}),
    },
})
