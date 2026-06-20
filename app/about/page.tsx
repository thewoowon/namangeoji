import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/common/page-shell";

export const metadata: Metadata = {
  title: "소개",
  description: "나만거지지수는 한국 사회의 생활형 불안과 FOMO를 실시간에 가깝게 시각화하는 사회심리 대시보드입니다.",
};

export default function AboutPage() {
  return (
    <PageShell title="나만거지지수란?" description="오늘의 벼락거지 날씨.">
      <div className="space-y-5 text-[13.5px] leading-relaxed text-text-secondary">
        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <p className="text-[15px] font-semibold text-text-primary">
            “오늘 한국인은 무엇 때문에 나만 뒤처지는 것 같다고 느끼는가?”
          </p>
          <p className="mt-3">
            나만거지지수는 한국 사람들이 지금 집단적으로 체감하는 자산, 주거, 고용, 노후, 물가, 기술 변화 관련
            생활형 불안과 FOMO를 데이터 기반 지수로 보여주는 모바일 퍼스트 대시보드입니다.
          </p>
        </section>

        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <h2 className="mb-2 text-[14px] font-bold text-text-primary">이 서비스가 하는 것</h2>
          <p>
            경제지표 서비스도, 뉴스 큐레이션도, 투자 서비스도 아닙니다. 한국 사회의 생활형 불안과 FOMO를
            관측해 이름을 붙이고, 왜 그런 점수가 나왔는지 납득할 수 있게 분해해 보여줍니다.
          </p>
        </section>

        <section className="rounded-2xl border border-border-base bg-bg-surface p-5">
          <h2 className="mb-2 text-[14px] font-bold text-text-primary">이 서비스가 하지 않는 것</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>매수·매도 신호나 수익률 예측을 제공하지 않습니다.</li>
            <li>특정 집단·세대·지역·성별을 조롱하거나 혐오를 지수화하지 않습니다.</li>
            <li>개인 자산·소득 기반 진단을 하지 않습니다.</li>
          </ul>
        </section>

        <div className="flex flex-wrap gap-2">
          <Link href="/methodology" className="rounded-xl bg-bg-elevated px-4 py-2.5 text-[13px] font-semibold text-text-primary hover:opacity-90">
            방법론 보기
          </Link>
          <Link href="/data-room" className="rounded-xl bg-bg-elevated px-4 py-2.5 text-[13px] font-semibold text-text-primary hover:opacity-90">
            데이터룸 보기
          </Link>
          <Link href="/today" className="rounded-xl bg-accent px-4 py-2.5 text-[13px] font-bold text-black hover:opacity-90">
            오늘의 포비아
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
