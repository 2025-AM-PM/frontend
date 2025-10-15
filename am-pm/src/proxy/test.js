const TARGET_URL =
  process.env.TARGET_URL || "http://ampmjbnu.tplinkdns.com/api/students/login"; // 필요시 http로 바꿔 테스트
const DEFAULT_TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 8000); // 아주 단순한 argv 파서
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.split("=");
    return [k.replace(/^--/, ""), v ?? true];
  })
);
const username = args.email || process.env.EMAIL;
const password = args.password || process.env.PASSWORD;
const name = "테스트 사용자"; // timeout 컨트롤러
function withTimeout(ms = DEFAULT_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(new Error("Request timed out")), ms);
  return { signal: ctrl.signal, clear: () => clearTimeout(id) };
}
async function fetchPost(username, password, name) {
  console.log(name);
  const t = withTimeout();
  try {
    const payload = {
      studentNumber: username,
      studentPassword: password,
      // studentName: name,
    };
    const res = await fetch(TARGET_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain;q=0.8, */*;q=0.5",
        "User-Agent": "login-probe/1.0",
      },
      body: JSON.stringify(payload),
      signal: t.signal,
    });
    console.log("POST status:", res.status, res.statusText);
    console.log("POST content-type:", res.headers.get("content-type"));
    console.log("POST set-cookie:", res.headers.get("set-cookie"));
    const ctype = res.headers.get("content-type") || "";
    const body = ctype.includes("application/json")
      ? await res.json().catch(async () => ({ raw: await res.text() }))
      : await res.text();
    console.log("\n--- POST response body ---\n");
    console.dir(body, { depth: 4 });
  } finally {
    t.clear();
  }
}
(async () => {
  // 1) 우선 GET으로 접근성/세션/CSRF여부 확인

  if (username && password) {
    console.log("\n== Trying POST /login ==\n");
    await fetchPost(username, password, name);
  } else {
    console.log(
      "\n(POST 생략: --email, --password 인자를 주면 POST 테스트도 합니다)"
    );
  }
})().catch((err) => {
  console.error("Request failed:", err?.message || err);
  process.exitCode = 1;
});
