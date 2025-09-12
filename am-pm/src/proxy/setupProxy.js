// CRA 전용 프록시
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/login"], // 필요한 엔드포인트 배열로 확장 가능: ["/login", "/api", "/auth"]
    createProxyMiddleware({
      target: "https://ampm-test.duckdns.org",
      changeOrigin: true,
      secure: false, // 서버 인증서가 완전하지 않을 때만 임시 사용(운영 비권장)
      // cookieDomainRewrite: "localhost", // 필요 시 쿠키 도메인 재작성
      // pathRewrite: { "^/api": "" },      // 경로가 다르면 사용
    })
  );
};
