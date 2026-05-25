import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var stripTrailingSlash = function (value) { return value.replace(/\/$/, ''); };
var toOrigin = function (value) {
    try {
        var parsed = new URL(value);
        return "".concat(parsed.protocol, "//").concat(parsed.host);
    }
    catch (_a) {
        return value;
    }
};
export default defineConfig(function (_a) {
    var _b;
    var _c, _d, _e;
    var mode = _a.mode;
    var env = loadEnv(mode, process.cwd(), 'VITE_');
    var apiBaseUrl = (_c = env.VITE_API_BASE_URL) !== null && _c !== void 0 ? _c : 'http://localhost:8080/api';
    var wsBaseUrl = (_d = env.VITE_WS_BASE_URL) !== null && _d !== void 0 ? _d : 'http://localhost:8080/ws';
    var apiOrigin = toOrigin(apiBaseUrl);
    var wsOrigin = toOrigin(wsBaseUrl);
    var apiBasePath = new URL(apiBaseUrl, apiOrigin).pathname;
    var wsBasePath = new URL(wsBaseUrl, wsOrigin).pathname;
    return {
        plugins: [react()],
        server: {
            host: '0.0.0.0',
            proxy: (_b = {},
                _b[apiBasePath] = {
                    target: apiOrigin,
                    changeOrigin: true,
                    secure: false
                },
                _b[wsBasePath] = {
                    target: wsOrigin,
                    changeOrigin: true,
                    secure: false,
                    ws: true
                },
                _b)
        },
        define: {
            __APP_VERSION__: JSON.stringify((_e = process.env.npm_package_version) !== null && _e !== void 0 ? _e : '1.0.0')
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        }
    };
});
