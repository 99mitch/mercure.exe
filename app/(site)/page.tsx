import { Hero } from '@/components/site/Hero'
import { Ticker } from '@/components/site/Ticker'
import { Stats } from '@/components/site/Stats'
import { HowItWorks } from '@/components/site/HowItWorks'
import { Sentence } from '@/components/site/Sentence'
import { Markets } from '@/components/site/Markets'
import { Manifesto } from '@/components/site/Manifesto'
import { SigningSpecimen } from '@/components/site/SigningSpecimen'

export default function SitePage() {
  return (
    <main>
      <Hero />
      <Ticker />
      <Stats />
      <HowItWorks />
      <Sentence />
      <Markets />
      <Manifesto />
      <SigningSpecimen />
    </main>
  )
}
