// github.ts
import { Octokit } from "octokit";

export type GetReadmeParams = {
  owner: string;
  repo: string;
  ref?: string; // branch/tag/commit
  token?: string; // 비공개 레포/레이트리밋 완화 시 권장
};

/**
 * 레포의 대표 README를 Markdown 원문으로 반환한다.
 */
export async function getRepoReadmeRaw({
  owner,
  repo,
  ref,
  token,
}: GetReadmeParams): Promise<string> {
  const octokit = new Octokit(token ? { auth: token } : {});

  const res = await octokit.request("GET /repos/{owner}/{repo}/readme", {
    owner,
    repo,
    ref,
    headers: { Accept: "application/vnd.github.raw+json" }, // 원문 바로 받기
  });

  // raw 수신 시: res.data가 string
  if (typeof res.data === "string") {
    return res.data;
  }

  const maybe = res.data as unknown as { content?: string; encoding?: string };
  if (maybe?.content && maybe?.encoding === "base64") {
    return Buffer.from(maybe.content, "base64").toString("utf-8");
  }

  throw new Error("README를 문자열로 파싱할 수 없습니다.");
}
