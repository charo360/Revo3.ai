import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';

export const TikTokPage: FC = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <div className="platform-page-content">
                <section className="platform-hero">
                    <div className="platform-hero-container">
                        <div className="platform-badge">TikTok & Shorts</div>
                        <h1>Viral-Ready Vertical Covers</h1>
                        <p>Create thumbnails that grab attention in the first second of scrolling</p>
                        <Link to="/signup" className="cta-button primary">Start Creating Free</Link>
                    </div>
                </section>

                <section className="platform-features">
                    <div className="platform-features-container">
                        <h2>Optimized for Short-Form Video</h2>
                        <div className="platform-features-grid">
                            <div className="platform-feature-card">
                                <div className="feature-icon">📱</div>
                                <h3>9:16 Vertical Format</h3>
                                <p>Perfect 1080x1920 pixel covers optimized for TikTok, YouTube Shorts, Instagram Reels, and more.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🔥</div>
                                <h3>Trendy, Bold Designs</h3>
                                <p>AI understands TikTok trends and creates designs that match what's working on the platform right now.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">👁️</div>
                                <h3>Mobile-First Design</h3>
                                <p>Every element optimized for mobile viewing. Text is large, colors are bold, and layouts are scroll-stopping.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">⚡</div>
                                <h3>Curiosity-Driven</h3>
                                <p>Designs that create intrigue and encourage clicks. AI optimizes for maximum engagement.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎨</div>
                                <h3>Eye-Catching Colors</h3>
                                <p>Vibrant color palettes that stand out in feeds. AI selects colors proven to drive engagement.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🚀</div>
                                <h3>Multiple Variations</h3>
                                <p>Generate several cover options quickly. Test what works and iterate faster than ever.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-how-it-works">
                    <div className="platform-how-it-works-container">
                        <h2>Create Viral Thumbnails in Seconds</h2>
                        <div className="platform-steps">
                            <div className="platform-step">
                                <div className="step-number">1</div>
                                <h3>Upload Your Video</h3>
                                <p>Upload your TikTok video or paste a link. AI extracts the most engaging frame automatically.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">2</div>
                                <h3>Add Your Hook</h3>
                                <p>Enter your video title or hook text. AI optimizes text placement for maximum impact.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">3</div>
                                <h3>Generate Covers</h3>
                                <p>Get multiple vertical thumbnail options. All optimized for TikTok's 9:16 format.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">4</div>
                                <h3>Post & Go Viral</h3>
                                <p>Download and upload to TikTok. Watch your views increase with better thumbnails.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-cta">
                    <div className="platform-cta-container">
                        <h2>Boost Your TikTok Engagement</h2>
                        <p>Create thumbnails that stop the scroll and drive views</p>
                        <Link to="/signup" className="cta-button primary large">Start Creating</Link>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};
