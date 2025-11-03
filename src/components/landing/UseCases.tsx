import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const UseCases: FC = () => {
    const useCases = [
        {
            title: 'YouTube Creators',
            description: 'Improve thumbnail CTR and grow your channel with AI-powered designs that stand out in the feed.',
            icon: '🎬',
            features: ['Improve existing thumbnails', 'Analyze video frames', 'Suggest color palettes', 'Generate multiple variations'],
            color: '#FF0000'
        },
        {
            title: 'Podcasters',
            description: 'Create professional podcast covers that capture attention and communicate your brand identity.',
            icon: '🎙️',
            features: ['Square-optimized designs', 'Small-size legibility', 'Brand integration', 'Multiple format exports'],
            color: '#7B68EE'
        },
        {
            title: 'Social Media Managers',
            description: 'Generate consistent, on-brand content across all platforms in minutes, not hours.',
            icon: '📱',
            features: ['Multi-platform support', 'Brand consistency', 'Bulk generation', 'Template library'],
            color: '#000000'
        },
        {
            title: 'Content Creators',
            description: 'Repurpose one piece of content into multiple platform-optimized designs instantly.',
            icon: '🔄',
            features: ['Content repurposing', 'Platform adaptation', 'Style consistency', 'Quick iterations'],
            color: '#1DA1F2'
        },
        {
            title: 'Marketing Teams',
            description: 'Create campaign assets that drive engagement and conversion with AI-powered insights.',
            icon: '📊',
            features: ['A/B testing variants', 'Performance tracking', 'Team collaboration', 'Brand guidelines'],
            color: '#00D4FF'
        },
        {
            title: 'Small Businesses',
            description: 'Professional designs without the designer price tag. Create marketing materials in minutes.',
            icon: '💼',
            features: ['No design skills needed', 'Affordable pricing', 'Commercial license', 'Quick turnaround'],
            color: '#4ECDC4'
        }
    ];

    return (
        <section className="use-cases-section">
            <div className="use-cases-container">
                <h2 className="section-title">Built for Every Creator</h2>
                <p className="section-subtitle">
                    Whether you're a YouTuber, podcaster, social media manager, or business owner, Revo3.ai has you covered.
                </p>
                <div className="use-cases-grid">
                    {useCases.map((useCase, index) => (
                        <div key={index} className="use-case-card" style={{ '--use-case-color': useCase.color } as React.CSSProperties}>
                            <div className="use-case-header">
                                <div className="use-case-icon">{useCase.icon}</div>
                                <h3 className="use-case-title">{useCase.title}</h3>
                            </div>
                            <p className="use-case-description">{useCase.description}</p>
                            <ul className="use-case-features">
                                {useCase.features.map((feature, idx) => (
                                    <li key={idx} className="use-case-feature-item">
                                        <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
