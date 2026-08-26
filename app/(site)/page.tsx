import { Hero } from '@/components/site/Hero'
import { HowItWorks } from '@/components/site/HowItWorks'
import { Markets } from '@/components/site/Markets'
import { SigningSpecimen } from '@/components/site/SigningSpecimen'

export default function SitePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Markets />
      <SigningSpecimen />
    </main>
  )
}
