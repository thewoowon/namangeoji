import { getToday, getCollectorRuns } from "@/lib/api/client";
import { COLLECTOR_STATUS_META } from "@/lib/admin-data";
import { LEVEL_META } from "@/lib/levels";
import { formatTimeKST } from "@/lib/format";
import { AdminPageHeader, StatCard } from "@/components/admin/admin-page-header";

export default async function AdminDashboardPage() {
  const { composite, topIndices } = await getToday();
  const runs = await getCollectorRuns();
  const failed = runs.filter((r) => r.status === "failed");
  const running = runs.filter((r) => r.status === "running");

  return (
    <div>
      <AdminPageHeader title="대시보드" description="오늘의 수집 상태와 지수 산출 현황입니다." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="종합지수"
          value={`${composite.score}`}
          hint={`${LEVEL_META[composite.level].label} · 신뢰도 ${composite.confidence}`}
        />
        <StatCard label="활성 지수" value={`${topIndices.length}+`} hint="홈 노출 TOP 10" />
        <StatCard label="실패 작업" value={`${failed.length}`} hint={failed.length ? "확인 필요" : "정상"} />
        <StatCard label="실행 중" value={`${running.length}`} hint="진행 중 작업" />
      </div>

      {failed.length ? (
        <div className="mt-4 rounded-xl border px-4 py-3" style={{ borderColor: "#e6483d55" }}>
          <div className="text-[13px] font-bold" style={{ color: "#e6483d" }}>
            실패한 수집 작업 {failed.length}건
          </div>
          <ul className="mt-1.5 space-y-1 text-[12px] text-text-secondary">
            {failed.map((r) => (
              <li key={r.id}>
                <span className="font-mono">{r.collectorName}</span> — {r.errorMessage}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h2 className="mb-3 mt-7 text-[15px] font-bold text-text-primary">수집 작업 로그</h2>
      <div className="overflow-x-auto rounded-2xl border border-border-base">
        <table className="w-full min-w-[760px] text-left text-[12.5px]">
          <thead>
            <tr className="bg-bg-elevated text-text-muted">
              <th className="px-3 py-2.5 font-medium">collector</th>
              <th className="px-3 py-2.5 font-medium">소스</th>
              <th className="px-3 py-2.5 font-medium">상태</th>
              <th className="px-3 py-2.5 text-right font-medium">fetched</th>
              <th className="px-3 py-2.5 text-right font-medium">inserted</th>
              <th className="px-3 py-2.5 text-right font-medium">updated</th>
              <th className="px-3 py-2.5 font-medium">시작</th>
              <th className="px-3 py-2.5 text-right font-medium">지연</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((r) => {
              const meta = COLLECTOR_STATUS_META[r.status];
              return (
                <tr key={r.id} className="border-t border-border-base">
                  <td className="px-3 py-2.5 font-mono text-text-primary">{r.collectorName}</td>
                  <td className="px-3 py-2.5 text-text-secondary">{r.sourceCode}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: `color-mix(in srgb, ${meta.hex} 18%, transparent)`, color: meta.hex }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.hex }} aria-hidden />
                      {meta.label}
                    </span>
                  </td>
                  <td className="tnum px-3 py-2.5 text-right text-text-secondary">{r.recordsFetched.toLocaleString()}</td>
                  <td className="tnum px-3 py-2.5 text-right text-text-secondary">{r.recordsInserted.toLocaleString()}</td>
                  <td className="tnum px-3 py-2.5 text-right text-text-secondary">{r.recordsUpdated.toLocaleString()}</td>
                  <td className="tnum px-3 py-2.5 text-text-muted">{formatTimeKST(r.startedAt)}</td>
                  <td className="tnum px-3 py-2.5 text-right text-text-muted">{r.sourceLatencyMs ? `${r.sourceLatencyMs}ms` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
