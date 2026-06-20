import type { CompositeIndex } from "@/lib/types";
import { LEVEL_META } from "@/lib/levels";
import { ScoreGauge } from "@/components/charts/score-gauge";
import { Sparkline } from "@/components/charts/sparkline";
import { DeltaBadge } from "@/components/common/badges";
import { ShareButton } from "@/components/share/share-button";
import { formatDateKST, formatTimeKST } from "@/lib/format";

export function CompositeHeroCard({ composite }: { composite: CompositeIndex }) {
  const meta = LEVEL_META[composite.level];
  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-border-base bg-bg-surface p-5 md:p-7"
      style={{ boxShadow: `inset 0 1px 0 0 color-mix(in srgb, ${meta.colorVar} 12%, transparent)` }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: `color-mix(in srgb, ${meta.colorVar} 22%, transparent)` }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="flex items-center gap-2 text-[12px] text-text-muted">
            <span>오늘의 나만거지지수</span>
            <span className="tnum">{formatDateKST(composite.date)}</span>
          </div>
          <ScoreGauge score={composite.score} size={196} />
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <DeltaBadge delta={composite.delta1d} suffix="전일" />
            <DeltaBadge delta={composite.delta7d} suffix="7일" />
          </div>
          <p className="mt-3 text-center text-[15px] font-semibold leading-relaxed text-text-primary md:text-left md:text-base">
            “{composite.summary}”
          </p>
          <p className="mt-1.5 text-center text-[12.5px] text-text-secondary md:text-left">
            {meta.tone}
          </p>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-bg-elevated px-3 py-2.5">
            <div className="text-[11px] text-text-muted">
              <div>가장 큰 상승 기여</div>
              <div className="mt-0.5 text-[12.5px] font-semibold text-text-secondary">{composite.primaryDriver}</div>
            </div>
            <Sparkline data={composite.sparkline} color={meta.colorVar} width={88} height={30} />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-text-muted">
              {formatTimeKST(composite.updatedAt)} 기준 · 신뢰도 {composite.confidence}
            </span>
            <ShareButton
              title={`오늘의 나만거지지수 ${composite.score}점`}
              text={composite.summary}
              path="/today"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
