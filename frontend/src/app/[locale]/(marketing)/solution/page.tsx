import { HeroHeader } from '@/components/header'
import ContentSection from '@/components/content'
import FooterSection from '@/components/footer'

export default function SolutionPage() {
    return (
        <div>
            <HeroHeader />
            <div className="pt-24">
                <ContentSection />
            </div>
            <FooterSection />
        </div>
    )
}
