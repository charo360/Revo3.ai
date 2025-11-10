import React, { FC } from 'react';
import { Link } from 'react-router-dom';

interface Platform {
    name: string;
    icon: React.ReactNode;
    description: string;
    features: string[];
    cta: string;
    color: string;
}

const YouTubeIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-2.3,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"></path>
    </svg>
);

const PodcastIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"></path>
    </svg>
);

const TikTokIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 1 1 12.29 10a4.278 4.278 0 0 1 4.31-4.18V2.41a6.669 6.669 0 0 0-4.31 1.37v6.4a2.14 2.14 0 1 1-2.14-2.14h2.14V5.82z"></path>
    </svg>
);

const TwitterIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.22-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.01-.06C3.8 20.34 6.28 21 8.98 21c7.17 0 11.08-5.93 11.08-11.08v-.5C21.16 8.55 21.89 7.33 22.46 6z"></path>
    </svg>
);

export const PlatformShowcase: FC = () => {
    const platforms: Platform[] = [
        {
            name: 'YouTube Thumbnails',
            icon: <YouTubeIcon />,
            description: 'Create thumbnails that drive clicks and boost CTR. Generate new thumbnails from your video or enhance existing ones with AI-powered optimization.',
            features: ['Create thumbnails from scratch', 'Enhance existing thumbnails', 'Generate from video frames', '10+ variations instantly'],
            cta: 'Create YouTube Thumbnails',
            color: '#FF0000'
        },
        {
            name: 'Podcast Covers',
            icon: <PodcastIcon />,
            description: 'Design professional podcast covers that are instantly recognizable and perfectly legible at any size.',
            features: ['Square format optimized', 'Bold, readable typography', 'Custom branding', 'Small-size visibility'],
            cta: 'Explore Podcasts',
            color: '#7B68EE'
        },
        {
            name: 'TikTok & Shorts',
            icon: <TikTokIcon />,
            description: 'Generate viral-ready vertical covers that grab attention in the first second of scrolling.',
            features: ['9:16 vertical format', 'Trendy, bold designs', 'Mobile-optimized', 'Curiosity-driven layouts'],
            cta: 'Explore TikTok',
            color: '#000000'
        },
        {
            name: 'Twitter & Social',
            icon: <TwitterIcon />,
            description: 'Create eye-catching social media cards that stand out in fast-moving feeds.',
            features: ['Multiple platform formats', 'Bold, concise designs', 'Feed-optimized', 'Quick generation'],
            cta: 'Explore Social',
            color: '#1DA1F2'
        }
    ];

    return (
        <section className="platform-showcase-section">
            <div className="platform-showcase-container">
                <h2 className="section-title">Optimized for Every Platform</h2>
                <p className="section-subtitle">
                    Platform-specific thumbnails that maximize engagement. Each design is tailored to perform best on YouTube, TikTok, Podcasts, and more.
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
