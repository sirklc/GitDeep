import HeroSection from '@/components/hero-section'
import Features from '@/components/features'
import ContentSection from '@/components/content'
import IntegrationsSection from '@/components/integrations'
import FooterSection from '@/components/footer'

export default function HomePage() {
    return (
        <div>
            <HeroSection />
            <Features />
            <ContentSection />
            <IntegrationsSection />
            <FooterSection />
        </div>
    )
}
