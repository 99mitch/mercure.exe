import { SmoothScroll } from '@/components/site/SmoothScroll'
import { BlobStage } from '@/components/site/BlobStage'
import { Nav } from '@/components/site/Nav'
import { Footer } from '@/components/site/Footer'

/** The loud surface. Motion runtime and the page-wide blob live here and nowhere else. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-transparent text-grey-10">
      <SmoothScroll />
      <BlobStage />
      <Nav />
      {children}
      <Footer />
    </div>
  )
}
