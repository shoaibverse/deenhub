import { SkeletonLines } from "@/components/ui/primitives";

export default function QuranLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-gold">
        The Quran
      </p>
      <div className="skeleton mt-4 h-9 w-64" />
      <div className="mt-8 flex gap-3">
        <div className="skeleton h-11 flex-1" />
        <div className="skeleton h-11 w-32" />
      </div>
      <div className="mt-10 space-y-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="skeleton h-4 w-8" />
            <div className="flex-1 space-y-2">
              <SkeletonLines lines={2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
