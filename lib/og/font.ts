/**
 * Satori(next/og)는 woff2를 지원하지 않으므로 Google Fonts에서 TTF 서브셋을 받아온다.
 * `text=`로 실제 렌더링할 글자만 요청해 다운로드 크기를 최소화한다.
 * IE11 User-Agent를 보내면 Google이 woff2 대신 truetype을 내려준다.
 */

const IE_UA = "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko";
const DAY = 60 * 60 * 24;

export async function loadKoreanFont(text: string, weight: 400 | 700): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@${weight}&text=${encodeURIComponent(text)}`;
    const cssRes = await fetch(cssUrl, {
      headers: { "User-Agent": IE_UA },
      next: { revalidate: DAY },
    });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const fontUrl = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
    if (!fontUrl) return null;
    const fontRes = await fetch(fontUrl, { next: { revalidate: DAY } });
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch {
    // 네트워크 실패 시 폰트 없이(degraded) 렌더링하도록 null 반환
    return null;
  }
}

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
}

/** 렌더링할 전체 텍스트로 400/700 두 굵기를 로드 */
export async function loadOgFonts(text: string): Promise<OgFont[]> {
  const [regular, bold] = await Promise.all([
    loadKoreanFont(text, 400),
    loadKoreanFont(text, 700),
  ]);
  const fonts: OgFont[] = [];
  if (regular) fonts.push({ name: "Noto Sans KR", data: regular, weight: 400, style: "normal" });
  if (bold) fonts.push({ name: "Noto Sans KR", data: bold, weight: 700, style: "normal" });
  return fonts;
}
