export type ParsedGitUrl = {
  owner: string;
  repo: string;
  ref?: string; // /tree/<ref> 또는 /blob/<ref>/... 인 경우
  path?: string; // /blob/<ref>/<path> 인 경우 파일 경로
};

export function parseGitHubRepoUrl(input: string): ParsedGitUrl {
  // 1) "owner/repo" 같은 짧은 형태도 지원
  if (/^[\w.-]+\/[\w.-]+$/.test(input)) {
    const [owner, repoRaw] = input.split("/");
    const repo = repoRaw.replace(/\.git$/i, "");
    return { owner, repo };
  }

  const u = new URL(input);

  if (!/(^|\.)github\.com$/i.test(u.hostname)) {
    throw new Error("GitHub URL이 아닙니다.");
  }

  const parts = u.pathname.split("/").filter(Boolean); // ["owner","repo",...]
  if (parts.length < 2) {
    throw new Error("owner/repo 형태의 URL이어야 합니다.");
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");

  // /tree/<ref> 혹은 /blob/<ref>/<path> 처리
  if (parts[2] === "tree" && parts[3]) {
    return { owner, repo, ref: parts[3] };
  }
  if (parts[2] === "blob" && parts[3]) {
    const ref = parts[3];
    const path = parts.slice(4).join("/");
    return { owner, repo, ref, path };
  }

  return { owner, repo }; // 기본 (브랜치 지정 없음)
}

export async function getReadMe(userInputUrl: string): Promise<string> {
  const { owner, repo, ref } = parseGitHubRepoUrl(userInputUrl);
  const api = new URL(`https://api.github.com/repos/${owner}/${repo}/readme`);
  if (ref) api.searchParams.set("ref", ref);

  const res = await fetch(api.toString(), {
    headers: { Accept: "application/vnd.github.raw+json" },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.text(); // README.md 원문
}
