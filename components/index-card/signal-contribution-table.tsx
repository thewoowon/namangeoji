import type { SignalComponent } from "@/lib/types";

/** spec §6.3.4 신호 분해 — 현재값 / 기준선 대비 σ / 기여도 */
export function SignalContributionTable({ components }: { components: SignalComponent[] }) {
  const maxContribution = Math.max(...components.map((c) => c.contribution));
  return (
    <div className="overflow-hidden rounded-2xl border border-border-base">
      <table className="w-full text-left text-[12.5px]">
        <thead>
          <tr className="bg-bg-elevated text-text-muted">
            <th className="px-3 py-2 font-medium">신호</th>
            <th className="px-3 py-2 text-right font-medium">현재값</th>
            <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">기준선 대비</th>
            <th className="px-3 py-2 text-right font-medium">기여도</th>
          </tr>
        </thead>
        <tbody>
          {components.map((c) => (
            <tr key={c.code} className="border-t border-border-base">
              <td className="px-3 py-2.5">
                <span className={c.pending ? "text-text-muted" : "text-text-primary"}>{c.label}</span>
                {c.pending ? (
                  <span className="ml-1.5 rounded bg-bg-elevated px-1.5 py-0.5 text-[10px] text-text-muted">
                    준비 중
                  </span>
                ) : null}
              </td>
              <td className="tnum px-3 py-2.5 text-right text-text-secondary">{c.currentValue}</td>
              <td className="tnum hidden px-3 py-2.5 text-right text-text-secondary sm:table-cell">
                {c.pending ? "—" : `${c.zScore > 0 ? "+" : ""}${c.zScore.toFixed(1)}σ`}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-end gap-2">
                  <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-bg-elevated sm:block">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${maxContribution ? (c.contribution / maxContribution) * 100 : 0}%`, opacity: c.pending ? 0.3 : 1 }}
                    />
                  </div>
                  <span className="tnum w-9 text-right font-semibold text-text-primary">
                    {Math.round(c.contribution * 100)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
