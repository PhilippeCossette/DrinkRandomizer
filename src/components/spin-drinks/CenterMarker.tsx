// Line with pointers marking where the reel stops (ink line, yellow pointers)
export default function CenterMarker() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
      <div className="h-[0.9rem] w-[1.2rem] bg-accent [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      <div className="w-[0.2rem] flex-1 rounded-full bg-ink" />
      <div className="h-[0.9rem] w-[1.2rem] bg-accent [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
    </div>
  )
}
