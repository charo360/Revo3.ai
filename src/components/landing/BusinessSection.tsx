import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const BusinessSection: FC = () => {
    const features = [
        {
            title: 'Global security you can trust',
            description: 'Enterprise-grade security and compliance for your team.'
        },
        {
            title: 'Business license for creative freedom',
            description: 'Unlimited commercial use across all your projects.'
        },
        {
            title: 'Multi-user seats for teams of any size',
            description: 'Collaborate seamlessly with your entire team.'
        },
        {
            title: 'Collaboration tools for the way you work',
            description: 'Shared folders, version control, and team management.'
        },
        {
            title: 'Dedicated creative success manager',
            description: 'Personal support to help you achieve your goals.'
        }
    ];

    return (
        <section className="business-section">
            <div className="business-container">
                <div className="business-content">
                    <div className="business-header">
                        <h2 className="section-title">The full power of Revo3.ai built for business</h2>
                        <p className="section-subtitle">
                            Get the most advanced AI design tools and everything your team needs to create anything at scale — fast, secure, and built to transform your process. From idea to execution, nothing is off limits.
                        </p>
                        <Link to="/contact?type=business" className="cta-button primary">
                            Contact Sales
                        </Link>
                    </div>
                    <div className="business-features">
                        {features.map((feature, index) => (
                            <div key={index} className="business-feature-card">
                                <h3 className="business-feature-title">{feature.title}</h3>
                                <p className="business-feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
