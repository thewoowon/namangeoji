import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-black text-text-muted">404</p>
      <h1 className="mt-3 text-lg font-bold text-text-primary">페이지를 찾을 수 없습니다</h1>
      <p className="mt-1.5 text-[13px] text-text-secondary">
        요청한 지수나 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/today"
        className="mt-5 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-bold text-black hover:opacity-90"
      >
        오늘의 포비아로 가기
      </Link>
    </div>
  );
}
