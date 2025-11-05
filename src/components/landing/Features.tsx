import React, { FC } from 'react';

export const Features: FC = () => {
    const features = [
        {
            icon: '🎬',
            title: 'Create Thumbnails from Scratch',
            description: 'Generate stunning, clickable thumbnails from your video content, descriptions, or ideas. AI understands what makes thumbnails work.'
        },
        {
            icon: '✨',
            title: 'Enhance Existing Thumbnails',
            description: 'Upload your current thumbnail and let AI improve it - better colors, clearer text, more engaging composition, higher CTR.'
        },
        {
            icon: '🎯',
            title: 'YouTube Thumbnail Optimization',
            description: 'AI analyzes top-performing thumbnails and creates variations optimized for maximum clicks and engagement on YouTube.'
        },
        {
            icon: '📊',
            title: 'Multiple Variations Instantly',
            description: 'Generate 10+ thumbnail variations in seconds. Test different styles, colors, and layouts to find what works best.'
        },
        {
            icon: '🎨',
            title: 'AI-Powered Thumbnail Editing',
            description: 'Enhance thumbnails with AI - adjust colors, add text overlays, remove backgrounds, upscale quality, all automatically.'
        },
        {
            icon: '⚡',
            title: 'Fast Thumbnail Generation',
            description: 'Create professional thumbnails in seconds, not hours. No design skills required - just describe what you want.'
        }
    ];

    return (
        <section className="features-section">
            <div className="features-container">
                <h2 className="section-title">Everything You Need to Create Perfect Thumbnails</h2>
                <p className="section-subtitle">
                    Create new thumbnails or enhance existing ones. Our AI understands what makes thumbnails clickable and engaging. 
                    Generate variations, optimize for your platform, and watch your CTR improve.
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
