import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const Hero: FC = () => {
    return (
        <section className="hero-section">
            <div className="hero-container">
                <h1 className="hero-title">
                    AI-Powered Design Studio<br />
                    <span className="gradient-text">That Creates Viral Content</span>
                </h1>
                <p className="hero-description">
                    Get cutting-edge AI design generation for YouTube, podcasts, TikTok, Twitter, and more. 
                    The choice of 30M+ creators. Generate anything you can imagine with the newest AI tools.
                </p>
                <div className="hero-cta">
                    <Link to="/signup" className="cta-button primary">
                        Start Free Now
                    </Link>
                    <Link to="/pricing" className="cta-button secondary">
                        Pricing
                    </Link>
                </div>
                <div className="hero-stats">
                    <div className="stat-item">
                        <div className="stat-number">10K+</div>
                        <div className="stat-label">Designs Created</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">99%</div>
                        <div className="stat-label">Uptime</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">24/7</div>
                        <div className="stat-label">AI Powered</div>
                    </div>
                </div>
            </div>
        </section>
    );
};
