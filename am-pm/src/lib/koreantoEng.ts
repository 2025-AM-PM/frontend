const CHOSEONG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

const JUNGSEONG = [
  "ㅏ",
  "ㅐ",
  "ㅑ",
  "ㅒ",
  "ㅓ",
  "ㅔ",
  "ㅕ",
  "ㅖ",
  "ㅗ",
  "ㅘ",
  "ㅙ",
  "ㅚ",
  "ㅛ",
  "ㅜ",
  "ㅝ",
  "ㅞ",
  "ㅟ",
  "ㅠ",
  "ㅡ",
  "ㅢ",
  "ㅣ",
] as const;

const JONGSEONG = [
  "",
  "ㄱ",
  "ㄲ",
  "ㄳ",
  "ㄴ",
  "ㄵ",
  "ㄶ",
  "ㄷ",
  "ㄹ",
  "ㄺ",
  "ㄻ",
  "ㄼ",
  "ㄽ",
  "ㄾ",
  "ㄿ",
  "ㅀ",
  "ㅁ",
  "ㅂ",
  "ㅄ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const;

// 한글 자모 -> 실제 영어 키보드 키 매핑
const JAMO_TO_KEY: Record<string, string> = {
  // 자음
  ㄱ: "r",
  ㄲ: "R",
  ㄴ: "s",
  ㄷ: "e",
  ㄸ: "E",
  ㄹ: "f",
  ㅁ: "a",
  ㅂ: "q",
  ㅃ: "Q",
  ㅅ: "t",
  ㅆ: "T",
  ㅇ: "d",
  ㅈ: "w",
  ㅉ: "W",
  ㅊ: "c",
  ㅋ: "z",
  ㅌ: "x",
  ㅍ: "v",
  ㅎ: "g",

  // 모음 (단일)
  ㅏ: "k",
  ㅐ: "o",
  ㅑ: "i",
  ㅒ: "O",
  ㅓ: "j",
  ㅔ: "p",
  ㅕ: "u",
  ㅖ: "P",
  ㅗ: "h",
  ㅛ: "y",
  ㅜ: "n",
  ㅠ: "b",
  ㅡ: "m",
  ㅣ: "l",

  // 모음 (복합) -> 실제 눌렀을 키 두 개
  ㅘ: "hk",
  ㅙ: "ho",
  ㅚ: "hl",
  ㅝ: "nj",
  ㅞ: "np",
  ㅟ: "nl",
  ㅢ: "ml",

  // 받침 복합
  ㄳ: "rt",
  ㄵ: "sw",
  ㄶ: "sg",
  ㄺ: "fr",
  ㄻ: "fa",
  ㄼ: "fq",
  ㄽ: "ft",
  ㄾ: "fx",
  ㄿ: "fv",
  ㅀ: "fg",
  ㅄ: "qt",
};

export function koreanToEng(input: string): string {
  let result = "";

  for (const ch of input) {
    const code = ch.charCodeAt(0);

    // 완성형 한글 (가 ~ 힣)
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const choIndex = Math.floor(offset / (21 * 28));
      const jungIndex = Math.floor((offset % (21 * 28)) / 28);
      const jongIndex = offset % 28;

      const cho = CHOSEONG[choIndex];
      const jung = JUNGSEONG[jungIndex];
      const jong = JONGSEONG[jongIndex];

      if (cho) result += JAMO_TO_KEY[cho] ?? "";
      if (jung) result += JAMO_TO_KEY[jung] ?? "";
      if (jong) result += JAMO_TO_KEY[jong] ?? "";
    }
    // 호환 자모(ㄱ,ㅏ 등 단독 자모)
    else if (code >= 0x3131 && code <= 0x318e) {
      result += JAMO_TO_KEY[ch] ?? "";
    }
    // 그 외(영어, 숫자, 특수문자 등)는 그대로 유지
    else {
      result += ch;
    }
  }

  return result;
}
