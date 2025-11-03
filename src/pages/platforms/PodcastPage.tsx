import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';

export const PodcastPage: FC = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <div className="platform-page-content">
                <section className="platform-hero">
                    <div className="platform-hero-container">
                        <div className="platform-badge">Podcast</div>
                        <h1>Podcast Cover Designer</h1>
                        <p>Create professional podcast covers that stand out in any directory</p>
                        <Link to="/signup" className="cta-button primary">Start Creating Free</Link>
                    </div>
                </section>

                <section className="platform-features">
                    <div className="platform-features-container">
                        <h2>Perfect for Podcasters</h2>
                        <div className="platform-features-grid">
                            <div className="platform-feature-card">
                                <div className="feature-icon">📦</div>
                                <h3>Square Format Optimized</h3>
                                <p>Perfect 3000x3000 pixel covers optimized for Apple Podcasts, Spotify, and all major platforms.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">👁️</div>
                                <h3>Small-Size Visibility</h3>
                                <p>Designs that remain clear and readable even at thumbnail size. Perfect for directory listings.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎨</div>
                                <h3>Brand Integration</h3>
                                <p>Add your logo, podcast name, and brand colors. Maintain consistency across all episodes.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📝</div>
                                <h3>Typography Optimization</h3>
                                <p>AI selects fonts that are bold, readable, and perfect for podcast covers at any size.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎯</div>
                                <h3>Directory Optimization</h3>
                                <p>Designed to stand out in podcast directories. Get more downloads with eye-catching covers.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">✨</div>
                                <h3>Multiple Variations</h3>
                                <p>Generate multiple design options. Test different styles to find what resonates with your audience.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-how-it-works">
                    <div className="platform-how-it-works-container">
                        <h2>Create Your Podcast Cover in Minutes</h2>
                        <div className="platform-steps">
                            <div className="platform-step">
                                <div className="step-number">1</div>
                                <h3>Define Your Brand</h3>
                                <p>Enter your podcast name, upload your logo, and set your brand colors. AI uses this to create consistent designs.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">2</div>
                                <h3>Choose Your Style</h3>
                                <p>Select from modern, classic, bold, or minimalist styles. AI generates designs that match your podcast genre.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">3</div>
                                <h3>Generate Designs</h3>
                                <p>Get multiple square format covers optimized for podcast directories. All designs are 3000x3000 pixels.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">4</div>
                                <h3>Export & Publish</h3>
                                <p>Download high-resolution covers ready for Apple Podcasts, Spotify, Google Podcasts, and more.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-cta">
                    <div className="platform-cta-container">
                        <h2>Design Professional Podcast Covers Today</h2>
                        <p>Stand out in podcast directories with AI-powered designs</p>
                        <Link to="/signup" className="cta-button primary large">Create Your Cover</Link>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};
