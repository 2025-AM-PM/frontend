// src/lib/uploadRemote.ts
const ENDPOINT = process.env.REACT_APP_UPLOAD_ENDPOINT || "/api/uploads";
const API_KEY = process.env.REACT_APP_UPLOAD_API_KEY;

export async function uploadImageRemote(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);

  const headers: Record<string, string> = {};
  if (API_KEY) headers["Authorization"] = `Bearer ${API_KEY}`;

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      body: fd,
      headers,
      credentials: "omit",
    });
  } catch (e: any) {
    throw new Error(`네트워크 오류: ${e?.message || e}`);
  }

  const raw = await res.text(); // 원문 확보
  if (!res.ok) {
    throw new Error(
      `업로드 실패 ${res.status} ${res.statusText} :: ${raw.slice(0, 200)}`
    );
  }

  let json: any;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(`JSON 파싱 실패 :: ${raw.slice(0, 200)}`);
  }

  if (!json?.url) throw new Error(`응답에 url 없음 :: ${raw.slice(0, 200)}`);
  return json.url as string;
}
