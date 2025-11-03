import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';

export const RepurposePage: FC = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <div className="platform-page-content">
                <section className="platform-hero">
                    <div className="platform-hero-container">
                        <div className="platform-badge">Content Repurpose</div>
                        <h1>Repurpose Content Across Platforms</h1>
                        <p>Transform one piece of content into multiple platform-optimized designs</p>
                        <Link to="/signup" className="cta-button primary">Start Creating Free</Link>
                    </div>
                </section>

                <section className="platform-features">
                    <div className="platform-features-container">
                        <h2>One Content, Multiple Platforms</h2>
                        <div className="platform-features-grid">
                            <div className="platform-feature-card">
                                <div className="feature-icon">🔄</div>
                                <h3>Smart Adaptation</h3>
                                <p>Upload one image or video. AI automatically adapts it for YouTube, TikTok, Instagram, Twitter, and more.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎯</div>
                                <h3>Platform-Specific Optimization</h3>
                                <p>Each design is optimized for its platform's dimensions, aspect ratio, and best practices.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">⚡</div>
                                <h3>Batch Generation</h3>
                                <p>Generate designs for all platforms at once. Save hours of manual work.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎨</div>
                                <h3>Style Consistency</h3>
                                <p>Maintain your brand identity across all platforms while optimizing for each format.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📦</div>
                                <h3>Bulk Export</h3>
                                <p>Download all platform variations in one go. Ready to use immediately.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🚀</div>
                                <h3>Time Saving</h3>
                                <p>What used to take hours now takes minutes. Scale your content creation effortlessly.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-how-it-works">
                    <div className="platform-how-it-works-container">
                        <h2>Repurpose Content in 4 Steps</h2>
                        <div className="platform-steps">
                            <div className="platform-step">
                                <div className="step-number">1</div>
                                <h3>Upload Original Content</h3>
                                <p>Upload your main image, video, or paste a YouTube URL. This becomes your source content.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">2</div>
                                <h3>Select Platforms</h3>
                                <p>Choose all the platforms you want to repurpose for: YouTube, TikTok, Instagram, Twitter, etc.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">3</div>
                                <h3>AI Adapts & Optimizes</h3>
                                <p>AI automatically adapts your content for each platform's requirements and best practices.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">4</div>
                                <h3>Export & Publish</h3>
                                <p>Download all variations at once. Each is optimized and ready for its specific platform.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-cta">
                    <div className="platform-cta-container">
                        <h2>Repurpose Your Content Today</h2>
                        <p>Turn one piece of content into designs for every platform</p>
                        <Link to="/signup" className="cta-button primary large">Get Started</Link>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};
