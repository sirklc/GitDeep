import HeroSection from '@/components/hero-section'
import Features from '@/components/features'
import ContentSection from '@/components/content'
import IntegrationsSection from '@/components/integrations'
import PricingSection from '@/components/pricing'
import FooterSection from '@/components/footer'

export default function HomePage() {
    return (
        <div>
            <HeroSection />
            <div id="features"><Features /></div>
            <div id="solution"><ContentSection /></div>
            <IntegrationsSection />
            <div id="pricing"><PricingSection /></div>
            <FooterSection />
        </div>
    )
}
