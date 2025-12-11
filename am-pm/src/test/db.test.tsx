import { dbHealthCheck } from "../api/client";

jest.setTimeout(30_000); // 네트워크 호출 여유

describe("/api/db/health 백엔드 API", () => {
  it("DB 헬스 체크가 ok=true로 응답해야 한다", async () => {
    const res = await dbHealthCheck();
    console.log(res);
    expect(res.ok).toBe(true);
    expect(typeof res.cluster_name).toBe("string");
    expect(res.cluster_name.length).toBeGreaterThan(0);
    expect(typeof res.status).toBe("string");
  });
});
