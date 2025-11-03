import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';

export const TwitterPage: FC = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <div className="platform-page-content">
                <section className="platform-hero">
                    <div className="platform-hero-container">
                        <div className="platform-badge">Twitter / X</div>
                        <h1>Twitter Card Designer</h1>
                        <p>Create eye-catching cards that stand out in fast-moving feeds</p>
                        <Link to="/signup" className="cta-button primary">Start Creating Free</Link>
                    </div>
                </section>

                <section className="platform-features">
                    <div className="platform-features-container">
                        <h2>Perfect for Twitter/X</h2>
                        <div className="platform-features-grid">
                            <div className="platform-feature-card">
                                <div className="feature-icon">📐</div>
                                <h3>Twitter-Optimized Dimensions</h3>
                                <p>1200x675 pixel cards perfect for Twitter. Stand out in timeline and profile previews.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">💬</div>
                                <h3>Feed-Optimized</h3>
                                <p>Designs that grab attention as users scroll. Bold, concise visuals that communicate instantly.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎨</div>
                                <h3>Bold, Concise Designs</h3>
                                <p>AI creates impactful designs with minimal elements. Perfect for Twitter's fast-paced feed.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">⚡</div>
                                <h3>Quick Generation</h3>
                                <p>Create Twitter cards in seconds. Perfect for news, announcements, and content promotion.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📊</div>
                                <h3>Link Preview Optimization</h3>
                                <p>Designs optimized for Twitter's link preview cards. Maximize engagement with better visuals.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🚀</div>
                                <h3>Multi-Format Support</h3>
                                <p>Create cards for Twitter, LinkedIn, Facebook, and other social platforms from one design.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-cta">
                    <div className="platform-cta-container">
                        <h2>Elevate Your Twitter Presence</h2>
                        <p>Create cards that drive clicks and engagement</p>
                        <Link to="/signup" className="cta-button primary large">Get Started</Link>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};
