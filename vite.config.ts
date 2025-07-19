import {resolve} from 'path';
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc';
import svgr from 'vite-plugin-svgr';
import preload from 'vite-plugin-preload';
import legacy from "@vitejs/plugin-legacy";

const root = resolve(__dirname, 'src');

export default defineConfig({
    resolve: {alias: {'@': root}},
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
    build: {
        // 让 Vite 自动处理代码分片，它比我们手动配置更智能
        chunkSizeWarningLimit: 1000,
        // 安全性配置
        minify: 'terser',
        terserOptions: {
            compress: {
                // 移除 console 和 debugger
                drop_console: true,
                drop_debugger: true,
                // 移除未使用的代码
                dead_code: true,
                unused: true,
                // 移除特定函数调用
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn', 'console.error'],
            },
            mangle: {
                // 混淆变量名，但保持安全
                toplevel: false,
                reserved: ['exports', 'require', 'module', '__webpack_require__'],
            },
            format: {
                // 移除所有注释
                comments: false,
            },
        },
        // 生成 source map（生产环境建议关闭）
        sourcemap: false,
        // 报告压缩后的文件大小
        reportCompressedSize: true,
        // 移除空的 chunk
        rollupOptions: {
            output: {
                // 更复杂的文件名混淆
                entryFileNames: 'assets/[name]-[hash].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
                // 移除许可证注释
                banner: '',
            },
        },
    }
})
