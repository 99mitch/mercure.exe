import { SmoothScroll } from '@/components/site/SmoothScroll'
import { Nav } from '@/components/site/Nav'
import { Footer } from '@/components/site/Footer'

/** The loud surface. Motion runtime lives here and nowhere else. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-black text-grey-10">
      <SmoothScroll />
      <Nav />
      {children}
      <Footer />
    </div>
  )
}
