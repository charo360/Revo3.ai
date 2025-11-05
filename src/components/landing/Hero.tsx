import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const Hero: FC = () => {
    return (
        <section className="hero-section">
            <div className="hero-container">
                <h1 className="hero-title">
                    Create & Enhance Thumbnails<br />
                    <span className="gradient-text">That Drive Clicks & Engagement</span>
                </h1>
                <p className="hero-description">
                    AI-powered thumbnail generator that creates stunning, clickable thumbnails or enhances your existing ones. 
                    Generate YouTube thumbnails, podcast covers, TikTok covers, and more in seconds. 
                    The choice of creators who want thumbnails that actually perform.
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
                        <div className="stat-label">Thumbnails Created</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">40%</div>
                        <div className="stat-label">Avg CTR Increase</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">30s</div>
                        <div className="stat-label">Generation Time</div>
                    </div>
                </div>
            </div>
        </section>
    );
};
