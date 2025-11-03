import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';
import { Pricing } from '../components/landing/Pricing';

export const PricingPage: FC = () => {
    const pricingFaqs = [
        {
            question: 'Can I change plans later?',
            answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
        },
        {
            question: 'Do you offer refunds?',
            answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.'
        },
        {
            question: 'What happens if I exceed my plan limits?',
            answer: 'You can upgrade to a higher plan or purchase additional credits. We\'ll notify you before you hit your limit.'
        },
        {
            question: 'Are there any hidden fees?',
            answer: 'No hidden fees. The price you see is what you pay. All plans include the features listed.'
        },
        {
            question: 'Do you offer discounts for annual plans?',
            answer: 'Yes! Save up to 20% when you choose annual billing. The discount is automatically applied.'
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
                        <p>Choose the plan that fits your needs. Start free, scale as you grow.</p>
                    </div>
                </section>

                <Pricing />

                <section className="pricing-comparison">
                    <div className="pricing-comparison-container">
                        <h2>Compare Plans</h2>
                        <div className="comparison-table">
                            <div className="comparison-header">
                                <div className="comparison-feature">Features</div>
                                <div className="comparison-plan">Starter</div>
                                <div className="comparison-plan">Pro</div>
                                <div className="comparison-plan">Enterprise</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">Designs per month</div>
                                <div className="comparison-plan">50</div>
                                <div className="comparison-plan">200</div>
                                <div className="comparison-plan">Unlimited</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">AI Magic Studio</div>
                                <div className="comparison-plan">✅ Limited</div>
                                <div className="comparison-plan">✅ Full</div>
                                <div className="comparison-plan">✅ Full</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">High-res exports</div>
                                <div className="comparison-plan">✅</div>
                                <div className="comparison-plan">✅</div>
                                <div className="comparison-plan">✅</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">Platform support</div>
                                <div className="comparison-plan">All</div>
                                <div className="comparison-plan">All</div>
                                <div className="comparison-plan">All + Custom</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">Team collaboration</div>
                                <div className="comparison-plan">❌</div>
                                <div className="comparison-plan">✅</div>
                                <div className="comparison-plan">✅</div>
                            </div>
                            <div className="comparison-row">
                                <div className="comparison-feature">Priority support</div>
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
