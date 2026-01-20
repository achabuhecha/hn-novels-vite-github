import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 添加获取当前时间的辅助函数
function getCurrentTime() {
  return new Date().toLocaleString('zh-CN', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'https://novelapi.5257100.xyz:2096',
        changeOrigin: true,
        configure: (proxy, options) => {
          // 输出实际请求地址
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('请求时间：' + getCurrentTime() + '，请求地址：' + proxyReq.protocol + '//' + proxyReq.getHeader('host') + proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // console.log('Received response from:', req.url, 'Status:', proxyRes.statusCode);
          });
        }
      }
    }
  }
})