import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';

export const BusinessPage: FC = () => {
    const benefits = [
        {
            title: 'Enterprise Security',
            description: 'Bank-level encryption, SOC 2 compliance, and advanced security controls to keep your data safe.',
            icon: '🔒'
        },
        {
            title: 'Unlimited Commercial License',
            description: 'Use designs across all your projects, campaigns, and clients without restrictions.',
            icon: '✅'
        },
        {
            title: 'Team Collaboration',
            description: 'Shared workspaces, real-time collaboration, and centralized asset management.',
            icon: '👥'
        },
        {
            title: 'Custom Integrations',
            description: 'API access, webhooks, and custom integrations with your existing tools.',
            icon: '🔌'
        },
        {
            title: 'Dedicated Support',
            description: '24/7 priority support with dedicated account manager and SLAs.',
            icon: '💬'
        },
        {
            title: 'Advanced Analytics',
            description: 'Track usage, monitor performance, and get insights into your team\'s design workflow.',
            icon: '📊'
        },
        {
            title: 'White-Label Options',
            description: 'Brand Revo3.ai with your company colors and logo for seamless integration.',
            icon: '🎨'
        },
        {
            title: 'Training & Onboarding',
            description: 'Comprehensive training sessions and resources to get your team up to speed quickly.',
            icon: '🎓'
        }
    ];

    const useCases = [
        {
            title: 'Marketing Agencies',
            description: 'Create client designs at scale with brand consistency and rapid iteration.',
            icon: '📈'
        },
        {
            title: 'E-commerce Brands',
            description: 'Generate product thumbnails, social media content, and promotional designs automatically.',
            icon: '🛒'
        },
        {
            title: 'Content Teams',
            description: 'Streamline design workflows for social media, blog posts, and marketing campaigns.',
            icon: '📝'
        },
        {
            title: 'Video Production',
            description: 'Generate thumbnails and cover art for video content across multiple channels.',
            icon: '🎬'
        }
    ];

    return (
        <div className="landing-page">
            <Navbar />
            <div className="business-page-content">
                <section className="business-hero">
                    <div className="business-hero-container">
                        <h1>Built for Business</h1>
                        <p>Scale your design operations with enterprise-grade AI tools and unlimited creative freedom</p>
                        <Link to="/contact?type=business" className="cta-button primary large">
                            Contact Sales
                        </Link>
                    </div>
                </section>

                <section className="business-benefits">
                    <div className="business-benefits-container">
                        <h2>Enterprise Benefits</h2>
                        <div className="business-benefits-grid">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="business-benefit-card">
                                    <div className="business-benefit-icon">{benefit.icon}</div>
                                    <h3>{benefit.title}</h3>
                                    <p>{benefit.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="business-usecases">
                    <div className="business-usecases-container">
                        <h2>Perfect for Every Business</h2>
                        <div className="business-usecases-grid">
                            {useCases.map((useCase, index) => (
                                <div key={index} className="business-usecase-card">
                                    <div className="business-usecase-icon">{useCase.icon}</div>
                                    <h3>{useCase.title}</h3>
                                    <p>{useCase.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="business-features">
                    <div className="business-features-container">
                        <h2>Enterprise Features</h2>
                        <div className="business-features-content">
                            <div className="business-feature-column">
                                <h3>Security & Compliance</h3>
                                <ul>
                                    <li>SOC 2 Type II certified</li>
                                    <li>GDPR compliant</li>
                                    <li>SSO authentication</li>
                                    <li>Advanced audit logs</li>
                                    <li>Data encryption at rest</li>
                                    <li>IP whitelisting</li>
                                </ul>
                            </div>
                            <div className="business-feature-column">
                                <h3>Team Management</h3>
                                <ul>
                                    <li>Unlimited team seats</li>
                                    <li>Role-based access control</li>
                                    <li>Shared asset libraries</li>
                                    <li>Team analytics dashboard</li>
                                    <li>Workflow automation</li>
                                    <li>Brand guidelines enforcement</li>
                                </ul>
                            </div>
                            <div className="business-feature-column">
                                <h3>Integration & API</h3>
                                <ul>
                                    <li>RESTful API access</li>
                                    <li>Webhook support</li>
                                    <li>Slack integration</li>
                                    <li>Adobe Creative Suite</li>
                                    <li>Custom integrations</li>
                                    <li>Bulk operations</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="business-cta">
                    <div className="business-cta-container">
                        <h2>Ready to Transform Your Design Workflow?</h2>
                        <p>Get a custom quote and see how Revo3.ai can scale with your business</p>
                        <div className="business-cta-buttons">
                            <Link to="/contact?type=business" className="cta-button primary large">
                                Schedule a Demo
                            </Link>
                            <Link to="/pricing" className="cta-button secondary">
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};
