import Button from "@/components/Button";

export default function MascaCareSection() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-16 py-20 md:py-28 lg:py-32 px-8 md:px-16 lg:px-24 xl:px-32">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <span className="eyebrow text-red-600">student welfare</span>
          <span className="title text-blue-600">If something&apos;s not right, we&apos;re here</span>
        </div>
        <p className="font-secondary text-blue-600 italic">“Reach out — no judgement, no paperwork, no problem too small.”</p>
        <p className="text-caption text-gray-700">Whether it&apos;s visa worries, mental health, accommodation, or just needing a sambal fix on a hard week — your chapter has trained student leaders ready to listen and connect you to help.</p>
        <Button className="self-start mt-4">Get support <span>&rarr;</span></Button>
      </div>

      <div className="flex justify-center lg:justify-end">
        <article className="flex flex-col justify-center w-full max-w-sm min-h-[26rem] md:min-h-[32rem] rounded-xl bg-blue-600 shadow-brand p-6 md:p-8">
          <span className="eyebrow text-yellow-500">masca care</span>
          <h1 className="text-yellow-500 leading-none mt-2">1800 <br/> MASCA</h1>
          <span className="text-caption text-white mt-3">Confidential. Free. Staffed by trained MASCA student leaders.</span>

          <div className="border-t border-blue-100/20 my-6"></div>

          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4">
              <span className="eyebrow text-gray-300/50">email</span>
              <span className="eyebrow text-white">cares@masca.org.au</span>
              <span className="eyebrow text-gray-300/50">walk-in</span>
              <span className="eyebrow text-white">Your nearest chapter office</span>
              <span className="eyebrow text-gray-300/50">Emergency</span>
              <span className="eyebrow text-white">000 first, then us</span>
          </div>
        </article>
      </div>
    </section>
  )
}