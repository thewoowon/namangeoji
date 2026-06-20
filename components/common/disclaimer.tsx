/** spec §20.1 — 투자 조언 방지 고지 */
export function InvestmentDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`rounded-xl border border-border-base bg-bg-surface/60 px-3.5 py-3 text-[11.5px] leading-relaxed text-text-muted ${className}`}>
      이 지수는 투자 판단을 위한 매수·매도 신호가 아닙니다. 검색량, 뉴스량, 시장 이벤트를 기반으로
      생활형 FOMO 압력을 관측한 참고 지표입니다.
    </p>
  );
}
