import { HeroHeader } from '@/components/header'
import Features from '@/components/features'
import IntegrationsSection from '@/components/integrations'
import FooterSection from '@/components/footer'

export default function FeaturesPage() {
    return (
        <div>
            <HeroHeader />
            <div className="pt-24">
                <Features />
                <IntegrationsSection />
            </div>
            <FooterSection />
        </div>
    )
}
