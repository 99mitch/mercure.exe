/** Step 1: what this does, in one plain sentence. One size up from body. Never centered. */
export function TxSentence({ sentence }: { sentence: string }) {
  return (
    <h1 className="text-[1.375rem] leading-[1.35] font-normal tracking-[-0.005em] text-grey-10 measure">
      {sentence}
    </h1>
  )
}
