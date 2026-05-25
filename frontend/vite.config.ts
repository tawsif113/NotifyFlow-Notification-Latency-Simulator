import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const stripTrailingSlash = (value: string) => value.replace(/\/$/, '');

const toOrigin = (value: string) => {
  try {
    const parsed = new URL(value);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return value;
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiBaseUrl = env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';
  const wsBaseUrl = env.VITE_WS_BASE_URL ?? 'http://localhost:8080/ws';
  const apiOrigin = toOrigin(apiBaseUrl);
  const wsOrigin = toOrigin(wsBaseUrl);
  const apiBasePath = new URL(apiBaseUrl, apiOrigin).pathname;
  const wsBasePath = new URL(wsBaseUrl, wsOrigin).pathname;

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      proxy: {
        [apiBasePath]: {
          target: apiOrigin,
          changeOrigin: true,
          secure: false
        },
        [wsBasePath]: {
          target: wsOrigin,
          changeOrigin: true,
          secure: false,
          ws: true
        }
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '1.0.0')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  };
});
