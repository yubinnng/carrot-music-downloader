/**
 * @author xue chen
 * @since 2020/3/28
 */

const {createProxyMiddleware} = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(createProxyMiddleware('/api/download', {
    target: 'http://localhost:8765',
    changeOrigin: true
  }));
  app.use(createProxyMiddleware('/api/search', {
    target: 'http://localhost:8765',
    changeOrigin: true
  }))
};