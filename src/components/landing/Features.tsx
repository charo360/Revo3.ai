import React, { FC } from 'react';

export const Features: FC = () => {
    const features = [
        {
            icon: '🎬',
            title: 'YouTube Thumbnail Generator',
            description: 'Improve existing thumbnails or create new ones that drive clicks and engagement.'
        },
        {
            icon: '🎙️',
            title: 'Podcast Cover Designer',
            description: 'Create professional, eye-catching podcast covers that stand out in any directory.'
        },
        {
            icon: '📱',
            title: 'TikTok & Social Media',
            description: 'Generate viral-ready covers for TikTok, Twitter, and other platforms in seconds.'
        },
        {
            icon: '🎨',
            title: 'AI Magic Studio',
            description: 'Edit images with AI-powered tools - add elements, remove backgrounds, upscale quality.'
        },
        {
            icon: '🎯',
            title: 'Smart Color Palettes',
            description: 'AI analyzes your content and suggests perfect color schemes for maximum impact.'
        },
        {
            icon: '⚡',
            title: 'Lightning Fast',
            description: 'Generate multiple design variations in seconds, not hours.'
        }
    ];

    return (
        <section className="features-section">
            <div className="features-container">
                <h2 className="section-title">Everything You Need to Create</h2>
                <p className="section-subtitle">
                    Our AI understands what makes designs work. Just describe what you want, and watch the magic happen.
                </p>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card">
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
