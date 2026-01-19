# Client-Small

这是一个轻量级前端项目，用于访问小说网站服务。

## 配置

项目支持通过环境变量配置后端服务地址：

- `VITE_API_BASE_URL`: 设置后端 API 的基础 URL
  - 如果后端服务部署在其他域名，请设置此变量，例如：`VITE_API_BASE_URL=https://your-api-domain.com/api`
  - 如果后端服务与前端部署在同一域名下，则保持为空

复制 `.env.example` 文件并重命名为 `.env`，然后根据需要修改环境变量。

## 安装和运行

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```