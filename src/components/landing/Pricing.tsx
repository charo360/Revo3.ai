import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const Pricing: FC = () => {
    const plans = [
        {
            name: 'Starter',
            price: '$9',
            period: '/month',
            description: 'Perfect for creators just starting out',
            features: [
                '50 designs per month',
                'All platform types',
                'Basic AI editing',
                'Standard resolution',
                'Email support'
            ],
            cta: 'Get Started',
            popular: false
        },
        {
            name: 'Pro',
            price: '$29',
            period: '/month',
            description: 'For professional content creators',
            features: [
                '200 designs per month',
                'All platform types',
                'Advanced AI editing',
                'HD & 4K resolution',
                'Priority support',
                'Custom brand integration',
                'Bulk generation'
            ],
            cta: 'Get Started',
            popular: true
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: '',
            description: 'For teams and agencies',
            features: [
                'Unlimited designs',
                'All platform types',
                'Premium AI features',
                'Custom resolutions',
                'Dedicated support',
                'Team collaboration',
                'API access',
                'Custom integrations'
            ],
            cta: 'Contact Sales',
            popular: false
        }
    ];

    return (
        <section id="pricing" className="pricing-section">
            <div className="pricing-container">
                <h2 className="section-title">Simple, Transparent Pricing</h2>
                <p className="section-subtitle">
                    Choose the plan that fits your needs. All plans include our full suite of AI design tools.
                </p>
                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                            {plan.popular && <div className="popular-badge">Most Popular</div>}
                            <div className="pricing-header">
                                <h3 className="plan-name">{plan.name}</h3>
                                <div className="plan-price">
                                    <span className="price-amount">{plan.price}</span>
                                    {plan.period && <span className="price-period">{plan.period}</span>}
                                </div>
                                <p className="plan-description">{plan.description}</p>
                            </div>
                            <ul className="plan-features">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="feature-item">
                                        <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to={plan.price === 'Custom' ? '/contact' : '/signup'}
                                className={`cta-button ${plan.popular ? 'primary' : 'secondary'} pricing-cta`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
