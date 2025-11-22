import React, { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { redirectToCheckout } from '../../services/payments/stripeService';
import { toast } from 'react-toastify';

export const Pricing: FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleBuyCredits = async (plan: typeof plans[0]) => {
        // Free Starter pack - redirect to signup
        if (plan.isFree) {
            navigate('/signup');
            return;
        }

        // Check if user is logged in
        if (!user) {
            toast.info('Please sign in to purchase credits');
            navigate('/signup');
            return;
        }

        // Map plan names to Stripe Price IDs
        const priceIdMap: Record<string, string> = {
            'Starter Pack': 'price_1SWEQdI1WHS4nwXdb9wSvgKl',
            'Pro Pack': 'price_1SWEUAI1WHS4nwXduy1uQkYn',
            'Enterprise Pack': 'price_1SWF5BI1WHS4nwXdQCv58CeN',
        };

        const priceId = priceIdMap[plan.name];
        if (!priceId) {
            toast.error('This pack is not available for purchase. Please contact sales.');
            return;
        }

        try {
            await redirectToCheckout(priceId);
        } catch (error: any) {
            toast.error(error.message || 'Failed to start checkout. Please try again.');
        }
    };

    const plans = [
        {
            name: 'Free Starter',
            price: '$0',
            period: '',
            credits: 10,
            description: 'Perfect for trying out Revo3.ai',
            features: [
                '10 credits',
                'All platform types',
                'Basic AI editing',
                'Standard resolution',
                'Email support'
            ],
            cta: 'Get Started Free',
            popular: false,
            isFree: true
        },
        {
            name: 'Starter Pack',
            price: '$9',
            period: ' one-time',
            credits: 50,
            description: 'Perfect for creators just starting out',
            features: [
                '50 credits',
                'All platform types',
                'Basic AI editing',
                'Standard resolution',
                'Email support'
            ],
            cta: 'Buy Credits',
            popular: false
        },
        {
            name: 'Pro Pack',
            price: '$29',
            period: ' one-time',
            credits: 200,
            description: 'For professional content creators',
            features: [
                '200 credits',
                'All platform types',
                'Advanced AI editing',
                'HD & 4K resolution',
                'Priority support',
                'Custom brand integration',
                'Bulk generation'
            ],
            cta: 'Buy Credits',
            popular: true
        },
        {
            name: 'Enterprise Pack',
            price: '$99',
            period: ' one-time',
            credits: 1000,
            description: 'For teams and agencies',
            features: [
                '1000 credits',
                'All platform types',
                'Premium AI features',
                'Custom resolutions',
                'Dedicated support',
                'Team collaboration',
                'API access',
                'Custom integrations'
            ],
            cta: 'Buy Credits',
            popular: false
        }
    ];

    return (
        <section id="pricing" className="pricing-section">
            <div className="pricing-container">
                <h2 className="section-title">Simple, Transparent Pricing</h2>
                <p className="section-subtitle">
                    Buy credits once, use them anytime. No subscriptions, no monthly fees. All plans include our full suite of AI design tools.
                </p>
                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.isFree ? 'free-pack' : ''}`}>
                            {plan.popular && <div className="popular-badge">Most Popular</div>}
                            {plan.isFree && <div className="free-badge">Free</div>}
                            <div className="pricing-header">
                                <h3 className="plan-name">{plan.name}</h3>
                                <div className="plan-price">
                                    <span className="price-amount">{plan.price}</span>
                                    {plan.period && <span className="price-period">{plan.period}</span>}
                                </div>
                                {plan.credits && (
                                    <div className="plan-credits">
                                        <span className="credits-amount">{plan.credits}</span>
                                        <span className="credits-label">credits</span>
                                    </div>
                                )}
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
                            <button
                                onClick={() => handleBuyCredits(plan)}
                                className={`cta-button ${plan.popular ? 'primary' : plan.isFree ? 'primary' : 'secondary'} pricing-cta`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
