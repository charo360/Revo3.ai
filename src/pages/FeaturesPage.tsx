import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';

export const FeaturesPage: FC = () => {
    const features = [
        {
            category: 'AI Design Generation',
            icon: '🎨',
            description: 'Create stunning designs with AI that understands platform requirements',
            items: [
                'Multiple design variations in seconds',
                'Platform-optimized dimensions',
                'AI-powered composition suggestions',
                'Smart color palette generation',
                'Text placement optimization',
                'Brand consistency across designs'
            ]
        },
        {
            category: 'Magic Studio',
            icon: '✨',
            description: 'Edit, enhance, and transform images with AI-powered tools',
            items: [
                'Remove backgrounds automatically',
                'Upscale image quality',
                'Extract faces from images',
                'Add or remove elements',
                'Color correction and adjustment',
                'Smart object removal'
            ]
        },
        {
            category: 'Platform Support',
            icon: '📱',
            description: 'Generate designs optimized for every major platform',
            items: [
                'YouTube thumbnails (1280x720)',
                'Podcast covers (3000x3000)',
                'TikTok verticals (1080x1920)',
                'Twitter cards (1200x675)',
                'Instagram posts and stories',
                'Custom dimensions support'
            ]
        },
        {
            category: 'Video Integration',
            icon: '🎬',
            description: 'Extract frames and generate designs from video content',
            items: [
                'YouTube URL parsing',
                'Video frame extraction',
                'Best frame selection',
                'Automatic transcript analysis',
                'Video trimming and editing',
                'Thumbnail generation from videos'
            ]
        },
        {
            category: 'Smart Editor',
            icon: '🖼️',
            description: 'Full-featured design editor with professional tools',
            items: [
                'Text editing with custom fonts',
                'Shape and element placement',
                'Logo and image overlays',
                'Layer management',
                'Undo/redo functionality',
                'Real-time preview'
            ]
        },
        {
            category: 'AI Assistant',
            icon: '🤖',
            description: 'Get intelligent design recommendations and suggestions',
            items: [
                'Content analysis',
                'Style suggestions',
                'Color palette recommendations',
                'Design improvement tips',
                'Platform-specific guidance',
                'A/B testing recommendations'
            ]
        }
    ];

    return (
        <div className="landing-page">
            <Navbar />
            <div className="features-page-content">
                <section className="features-hero">
                    <div className="features-hero-container">
                        <h1>Powerful Features for Modern Creators</h1>
                        <p>Everything you need to create viral designs that convert</p>
                    </div>
                </section>

                <section className="features-detailed">
                    <div className="features-detailed-container">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-category-card">
                                <div className="feature-category-header">
                                    <div className="feature-category-icon">{feature.icon}</div>
                                    <div>
                                        <h2>{feature.category}</h2>
                                        <p className="feature-category-description">{feature.description}</p>
                                    </div>
                                </div>
                                <ul className="feature-category-items">
                                    {feature.items.map((item, idx) => (
                                        <li key={idx}>
                                            <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="features-cta">
                    <div className="features-cta-container">
                        <h2>Ready to Get Started?</h2>
                        <p>Start creating amazing designs with AI today</p>
                        <div className="features-cta-buttons">
                            <Link to="/signup" className="cta-button primary">Start Free Now</Link>
                            <Link to="/pricing" className="cta-button secondary">View Pricing</Link>
                        </div>
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};
