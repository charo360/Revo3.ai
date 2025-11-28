import React, { FC } from 'react';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { ProductShowcase } from '../components/landing/ProductShowcase';
import { ValueProps } from '../components/landing/ValueProps';
import { PlatformShowcase } from '../components/landing/PlatformShowcase';
import { HowItWorks } from '../components/landing/HowItWorks';
import { Gallery } from '../components/landing/Gallery';
import { Features } from '../components/landing/Features';
import { UseCases } from '../components/landing/UseCases';
import { Testimonials } from '../components/landing/Testimonials';
import { Integrations } from '../components/landing/Integrations';
import { BusinessSection } from '../components/landing/BusinessSection';
import { Pricing } from '../components/landing/Pricing';
import { Resources } from '../components/landing/Resources';
import { FAQ } from '../components/landing/FAQ';
import { Newsletter } from '../components/landing/Newsletter';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Footer } from '../components/landing/Footer';

export const LandingPage: FC = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <Hero />
            <ProductShowcase />
            <ValueProps />
            <PlatformShowcase />
            <HowItWorks />
            <Gallery />
            <Features />
            <UseCases />
            <Testimonials />
            <Integrations />
            <BusinessSection />
            <Pricing />
            <Resources />
            <FAQ />
            <Newsletter />
            <FinalCTA />
            <Footer />
        </div>
    );
};
