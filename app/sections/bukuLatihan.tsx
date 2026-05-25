export default function BukuLatihanSection() {
  return (
    <section className="bg-[#FFFEF8]">

      {/* Header */}
      <div
        className="relative w-full h-16 border-b-2 border-[#A8C8E8]"
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent clamp(2rem, 8vw, 6rem), #E89090 clamp(2rem, 8vw, 6rem), #E89090 calc(clamp(2rem, 8vw, 6rem) + 0.125rem), transparent calc(clamp(2rem, 8vw, 6rem) + 0.125rem))",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="flex h-full items-center justify-between pl-10 pr-5 text-sm text-gray-600">

        </div>
      </div>

      {/* Lined area */}
      <div
        className="relative w-full h-75 overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to right, transparent clamp(2rem, 8vw, 6rem), #E89090 clamp(2rem, 8vw, 6rem), #E89090 calc(clamp(2rem, 8vw, 6rem) + 0.125rem), transparent calc(clamp(2rem, 8vw, 6rem) + 0.125rem)), repeating-linear-gradient(transparent, transparent 1.9375rem, #A8C8E8 1.9375rem, #A8C8E8 2rem)",
          backgroundSize: "100% 100%, 100% 2rem",
          backgroundRepeat: "no-repeat, repeat",
        }}
      >
        <div className="pl-30 pr-5 text-base leading-8 text-gray-700" style={{ paddingTop: "2rem" }}>
          1 + 1 = 2
        </div>
      </div>
    </section>
  )
}