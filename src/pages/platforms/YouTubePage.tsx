import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';

export const YouTubePage: FC = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <div className="platform-page-content">
                <section className="platform-hero">
                    <div className="platform-hero-container">
                        <div className="platform-badge">YouTube</div>
                        <h1>YouTube Thumbnail Generator</h1>
                        <p>Create clickable thumbnails that drive engagement and boost your CTR</p>
                        <Link to="/signup" className="cta-button primary">Start Creating Free</Link>
                    </div>
                </section>

                <section className="platform-features">
                    <div className="platform-features-container">
                        <h2>Everything You Need for YouTube</h2>
                        <div className="platform-features-grid">
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎯</div>
                                <h3>Improve Existing Thumbnails</h3>
                                <p>Upload your current thumbnail and let AI suggest improvements. Increase click-through rates with optimized designs.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📹</div>
                                <h3>Generate from Video</h3>
                                <p>Paste your YouTube URL or upload a video. AI extracts the best frames and creates multiple thumbnail variations.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎨</div>
                                <h3>AI-Powered Suggestions</h3>
                                <p>Get intelligent recommendations for colors, text placement, and composition based on successful YouTube thumbnails.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">⚡</div>
                                <h3>Multiple Variations</h3>
                                <p>Generate multiple thumbnail options in seconds. A/B test different designs to find what works best.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📐</div>
                                <h3>Perfect Dimensions</h3>
                                <p>Automatically optimized for 1280x720 pixels. All thumbnails are ready to upload to YouTube.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🚀</div>
                                <h3>Boost CTR</h3>
                                <p>Our AI understands what makes thumbnails clickable. Average 40% increase in click-through rates.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-how-it-works">
                    <div className="platform-how-it-works-container">
                        <h2>How It Works</h2>
                        <div className="platform-steps">
                            <div className="platform-step">
                                <div className="step-number">1</div>
                                <h3>Input Your Content</h3>
                                <p>Paste your YouTube video URL or upload images/video. AI automatically extracts the best frames.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">2</div>
                                <h3>Configure Design</h3>
                                <p>Set your preferences: text, colors, style. Or let AI suggest the best options for your content.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">3</div>
                                <h3>Generate Thumbnails</h3>
                                <p>Get multiple thumbnail variations optimized for YouTube. All designs are 1280x720 and ready to use.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">4</div>
                                <h3>Edit & Export</h3>
                                <p>Fine-tune designs in our editor, then export in high resolution. Upload directly to YouTube.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-stats">
                    <div className="platform-stats-container">
                        <div className="platform-stat">
                            <div className="stat-number">40%</div>
                            <div className="stat-label">Average CTR Increase</div>
                        </div>
                        <div className="platform-stat">
                            <div className="stat-number">1280x720</div>
                            <div className="stat-label">Optimized Dimensions</div>
                        </div>
                        <div className="platform-stat">
                            <div className="stat-number">&lt;30s</div>
                            <div className="stat-label">Generation Time</div>
                        </div>
                    </div>
                </section>

                <section className="platform-cta">
                    <div className="platform-cta-container">
                        <h2>Start Creating Better Thumbnails Today</h2>
                        <p>Join thousands of creators using AI to improve their YouTube performance</p>
                        <Link to="/signup" className="cta-button primary large">Get Started Free</Link>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};
