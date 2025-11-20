import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { Pricing } from '../components/landing/Pricing';

export const PricingPage: FC = () => {
    const pricingFaqs = [
        {
            question: 'How do credits work?',
            answer: 'Credits are used to generate designs and use premium features. Each thumbnail costs 1 credit, content repurposing costs 5 credits, and video generation costs 10 credits. Credits never expire, so you can use them at your own pace.'
        },
        {
            question: 'Do credits expire?',
            answer: 'No! Credits never expire. Buy them once and use them whenever you need. There\'s no rush or pressure to use them within a certain timeframe.'
        },
        {
            question: 'What happens when I run out of credits?',
            answer: 'You can purchase additional credit packs anytime. We\'ll notify you when your balance is low so you can top up before running out.'
        },
        {
            question: 'Are there any hidden fees?',
            answer: 'No hidden fees. The price you see is what you pay. One-time purchase, no subscriptions, no monthly charges.'
        },
        {
            question: 'Can I get a refund?',
            answer: 'Yes! We offer a 30-day money-back guarantee on all credit pack purchases. If you\'re not satisfied, contact us for a full refund.'
        },
        {
            question: 'Can I use designs commercially?',
            answer: 'Absolutely! All designs generated with Revo3.ai can be used commercially. No additional licenses needed.'
        }
    ];

    return (
        <div className="landing-page">
            <Navbar />
            <div className="pricing-page-content">
                <section className="pricing-hero">
                    <div className="pricing-hero-container">
                        <h1>The Perfect Plan for Every Creator</h1>
                        <p>Buy credits once, use them anytime. No subscriptions, no monthly fees. Start free, scale as you grow.</p>
                    </div>
                </section>

                <Pricing />

                <section className="pricing-comparison">
                    <div className="pricing-comparison-container">
                        <h2>Compare Plans</h2>
                        <div className="comparison-table">
                            <div className="comparison-header">
                                <div className="comparison-feature">Features</div>
                                <div className="comparison-plan">Free Starter</div>
                                <div className="comparison-plan">Starter Pack</div>
                                <div className="comparison-plan">Pro Pack</div>
                                <div className="comparison-plan">Enterprise Pack</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">Credits</div>
                                <div className="comparison-plan">10</div>
                                <div className="comparison-plan">50</div>
                                <div className="comparison-plan">200</div>
                                <div className="comparison-plan">1000</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">Price</div>
                                <div className="comparison-plan">Free</div>
                                <div className="comparison-plan">$9</div>
                                <div className="comparison-plan">$29</div>
                                <div className="comparison-plan">$99</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">AI Magic Studio</div>
                                <div className="comparison-plan">✅ Limited</div>
                                <div className="comparison-plan">✅ Full</div>
                                <div className="comparison-plan">✅ Full</div>
                                <div className="comparison-plan">✅ Full</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">High-res exports</div>
                                <div className="comparison-plan">✅</div>
                                <div className="comparison-plan">✅</div>
                                <div className="comparison-plan">✅</div>
                                <div className="comparison-plan">✅</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">Platform support</div>
                                <div className="comparison-plan">All</div>
                                <div className="comparison-plan">All</div>
                                <div className="comparison-plan">All</div>
                                <div className="comparison-plan">All + Custom</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">Team collaboration</div>
                                <div className="comparison-plan">❌</div>
                                <div className="comparison-plan">❌</div>
                                <div className="comparison-plan">✅</div>
                                <div className="comparison-plan">✅</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">Priority support</div>
                                <div className="comparison-plan">❌</div>
                                <div className="comparison-plan">❌</div>
                                <div className="comparison-plan">✅</div>
                                <div className="comparison-plan">✅ 24/7</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pricing-faq-section">
                    <div className="pricing-faq-container">
                        <h2>Frequently Asked Questions</h2>
                        <div className="pricing-faq-list">
                            {pricingFaqs.map((faq, index) => (
                                <div key={index} className="pricing-faq-item">
                                    <h3>{faq.question}</h3>
                                    <p>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="pricing-cta">
                    <div className="pricing-cta-container">
                        <h2>Still have questions?</h2>
                        <p>Our team is here to help you choose the right plan</p>
                        <Link to="/contact" className="cta-button primary">Contact Sales</Link>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};
