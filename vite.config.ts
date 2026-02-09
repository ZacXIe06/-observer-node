import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 加载环境变量，包括 process.env 和 .env 文件
  // Fixed: Cast process to any to resolve the TypeScript error regarding missing property 'cwd' on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // 满足 @google/genai SDK 对 process.env.API_KEY 的直接调用需求
      'process.env.API_KEY': JSON.stringify(env.API_KEY || (process as any).env.API_KEY)
    }
  };
});
