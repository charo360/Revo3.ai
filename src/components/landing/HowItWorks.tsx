import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const HowItWorks: FC = () => {
    const steps = [
        {
            number: '01',
            title: 'Start with Your Content',
            description: 'Upload images, videos, or paste a YouTube URL. Our AI extracts the best frames and understands your content.',
            icon: '📤'
        },
        {
            number: '02',
            title: 'Configure Your Design',
            description: 'Set your preferences: platform, colors, text, logo placement, and style. Or let AI suggest the best options.',
            icon: '⚙️'
        },
        {
            number: '03',
            title: 'Generate & Refine',
            description: 'Click generate and get multiple design variations in seconds. Use our editor to fine-tune or generate again.',
            icon: '✨'
        },
        {
            number: '04',
            title: 'Export & Publish',
            description: 'Download your designs in high resolution. All designs are ready to use immediately on any platform.',
            icon: '🚀'
        }
    ];

    return (
        <section className="how-it-works-section">
            <div className="how-it-works-container">
                <h2 className="section-title">How It Works</h2>
                <p className="section-subtitle">
                    Creating viral designs has never been easier. Four simple steps from idea to execution.
                </p>
                <div className="steps-grid">
                    {steps.map((step, index) => (
                        <div key={index} className="step-card">
                            <div className="step-number">{step.number}</div>
                            <div className="step-icon">{step.icon}</div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-description">{step.description}</p>
                        </div>
                    ))}
                </div>
                <div className="how-it-works-cta">
                    <Link to="/signup" className="cta-button primary">
                        Start Creating Free
                    </Link>
                </div>
            </div>
        </section>
    );
};
