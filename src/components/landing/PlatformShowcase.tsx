import React, { FC } from 'react';
import { Link } from 'react-router-dom';

interface Platform {
    name: string;
    icon: string;
    description: string;
    features: string[];
    cta: string;
    color: string;
}

export const PlatformShowcase: FC = () => {
    const platforms: Platform[] = [
        {
            name: 'YouTube Thumbnails',
            icon: '🎬',
            description: 'Create thumbnails that drive clicks and boost CTR. Generate new thumbnails from your video or enhance existing ones with AI-powered optimization.',
            features: ['Create thumbnails from scratch', 'Enhance existing thumbnails', 'Generate from video frames', '10+ variations instantly'],
            cta: 'Create YouTube Thumbnails',
            color: '#FF0000'
        },
        {
            name: 'Podcast Covers',
            icon: '🎙️',
            description: 'Design professional podcast covers that are instantly recognizable and perfectly legible at any size.',
            features: ['Square format optimized', 'Bold, readable typography', 'Custom branding', 'Small-size visibility'],
            cta: 'Explore Podcasts',
            color: '#7B68EE'
        },
        {
            name: 'TikTok & Shorts',
            icon: '📱',
            description: 'Generate viral-ready vertical covers that grab attention in the first second of scrolling.',
            features: ['9:16 vertical format', 'Trendy, bold designs', 'Mobile-optimized', 'Curiosity-driven layouts'],
            cta: 'Explore TikTok',
            color: '#000000'
        },
        {
            name: 'Twitter & Social',
            icon: '🐦',
            description: 'Create eye-catching social media cards that stand out in fast-moving feeds.',
            features: ['Multiple platform formats', 'Bold, concise designs', 'Feed-optimized', 'Quick generation'],
            cta: 'Explore Social',
            color: '#1DA1F2'
        }
    ];

    return (
        <section className="platform-showcase-section">
            <div className="platform-showcase-container">
                <h2 className="section-title">Create & Enhance Thumbnails for Every Platform</h2>
                <p className="section-subtitle">
                    Generate thumbnails from scratch or enhance existing ones. Every thumbnail is optimized for its platform to maximize clicks and engagement.
                </p>
                <div className="platform-grid">
                    {platforms.map((platform, index) => (
                        <div key={index} className="platform-card" style={{ '--platform-color': platform.color } as React.CSSProperties}>
                            <div className="platform-header">
                                <div className="platform-icon">{platform.icon}</div>
                                <h3 className="platform-name">{platform.name}</h3>
                            </div>
                            <p className="platform-description">{platform.description}</p>
                            <ul className="platform-features">
                                {platform.features.map((feature, idx) => (
                                    <li key={idx} className="platform-feature-item">
                                        <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/signup" className="product-cta">
                                {platform.cta}
                                <svg className="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
