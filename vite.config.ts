import {resolve} from 'path';
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import preload from 'vite-plugin-preload';
import legacy from "@vitejs/plugin-legacy";

const root = resolve(__dirname, 'src');

export default defineConfig({
    resolve: {alias: {'@': root,},},
    plugins: [
        react(),
        svgr(),
        preload(),
        legacy({
            targets: ['chrome >= 87', 'firefox >= 78', 'safari >= 14', 'edge >= 88'],
            modernPolyfills: true,
            renderLegacyChunks: false,
        })
    ],
})
