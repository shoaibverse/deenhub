export default function TafsirLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8" aria-busy="true">
      <p className="text-[0.75rem] text-mute">Loading Tafseer · تفسیر لوڈ ہو رہی ہے…</p>
      <div className="skeleton mt-6 h-24 rounded-[14px]" />
      <div className="mt-8 text-center">
        <div className="skeleton mx-auto h-8 w-64" />
        <div className="skeleton mx-auto mt-3 h-4 w-40" />
      </div>
      <div className="mt-8 border-y border-[color:var(--line)] py-7">
        <div className="skeleton ms-auto h-10 w-full" />
        <div className="skeleton mt-5 h-5 w-4/5" />
      </div>
      <div className="surface mt-6 space-y-3 rounded-[14px] p-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className={`skeleton h-4 ${index % 3 === 2 ? "w-3/4" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}
