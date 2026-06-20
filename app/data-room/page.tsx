import type { Metadata } from "next";
import { PageShell } from "@/components/common/page-shell";

export const metadata: Metadata = {
  title: "데이터룸",
  description: "나만거지지수가 사용하는 데이터 출처, 용도, 업데이트 주기, MVP 사용 여부를 공개합니다.",
};

const SOURCES: { name: string; use: string; freq: string; status: "사용" | "선택" | "보류" }[] = [
  { name: "네이버 데이터랩 검색어 트렌드", use: "검색 관심도", freq: "일별", status: "사용" },
  { name: "Google Trends", use: "보조 검색 관심도", freq: "일별/주별", status: "선택" },
  { name: "KRX Open API", use: "국내 시장 가격/거래량", freq: "일별/장중", status: "사용" },
  { name: "OpenDART", use: "공시 이벤트", freq: "수시", status: "사용" },
  { name: "한국은행 ECOS", use: "금리·환율·물가·소비심리", freq: "지표별", status: "사용" },
  { name: "한국부동산원/공공데이터", use: "부동산 가격·거래 통계", freq: "지표별", status: "사용" },
  { name: "KOSIS", use: "인구·고용·물가·사회지표", freq: "지표별", status: "사용" },
  { name: "뉴스 검색 API/수집", use: "뉴스량·이슈 키워드", freq: "시간별/일별", status: "사용" },
  { name: "커뮤니티 공개글", use: "생활언어 감지", freq: "시간별", status: "보류" },
];

const STATUS_COLOR: Record<string, string> = {
  사용: "var(--status-stable)",
  선택: "var(--status-caution)",
  보류: "var(--text-muted)",
};

export default function DataRoomPage() {
  return (
    <PageShell
      title="데이터룸"
      description="지수 산출에 쓰이는 데이터 출처와 업데이트 주기입니다. 뉴스 본문은 저장하지 않고 제목·링크·메타만 사용합니다."
    >
      <div className="overflow-hidden rounded-2xl border border-border-base">
        <table className="w-full text-left text-[12.5px]">
          <thead>
            <tr className="bg-bg-elevated text-text-muted">
              <th className="px-3 py-2.5 font-medium">데이터</th>
              <th className="hidden px-3 py-2.5 font-medium sm:table-cell">용도</th>
              <th className="px-3 py-2.5 font-medium">업데이트</th>
              <th className="px-3 py-2.5 text-right font-medium">MVP</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => (
              <tr key={s.name} className="border-t border-border-base">
                <td className="px-3 py-3 font-medium text-text-primary">{s.name}</td>
                <td className="hidden px-3 py-3 text-text-secondary sm:table-cell">{s.use}</td>
                <td className="px-3 py-3 text-text-secondary">{s.freq}</td>
                <td className="px-3 py-3 text-right">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: `color-mix(in srgb, ${STATUS_COLOR[s.status]} 16%, transparent)`, color: STATUS_COLOR[s.status] }}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 space-y-2 rounded-2xl border border-border-base bg-bg-surface p-5 text-[12.5px] leading-relaxed text-text-secondary">
        <h2 className="text-[14px] font-bold text-text-primary">데이터 처리 원칙</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>뉴스 원문 전문은 저장하지 않습니다. 제목·URL·발행시각·언론사·요약 메타만 사용합니다.</li>
          <li>검색 데이터는 절대량이 아니라 상대 지표로 해석합니다.</li>
          <li>시장 휴장일은 직전 거래일 기준 carry-forward 후 별도 플래그를 부여합니다.</li>
          <li>API 장애로 인한 0값은 실제 0이 아닌 missing으로 처리합니다.</li>
        </ul>
      </div>
    </PageShell>
  );
}
