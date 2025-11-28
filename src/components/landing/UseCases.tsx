import React, { FC } from 'react';

export const UseCases: FC = () => {
    const useCases = [
        {
            title: 'YouTube Creators',
            description: 'Create thumbnails from scratch or enhance existing ones. Boost CTR and grow your channel with AI-powered thumbnails that stand out.',
            features: ['Create thumbnails from scratch', 'Enhance existing thumbnails', 'Generate 10+ variations', 'AI-powered CTR optimization']
        },
        {
            title: 'Podcasters',
            description: 'Create professional podcast covers that capture attention and communicate your brand identity.',
            features: ['Square-optimized designs', 'Small-size legibility', 'Brand integration', 'Multiple format exports']
        },
        {
            title: 'Social Media Managers',
            description: 'Generate consistent, on-brand content across all platforms in minutes, not hours.',
            features: ['Multi-platform support', 'Brand consistency', 'Bulk generation', 'Template library']
        },
        {
            title: 'Content Creators',
            description: 'Repurpose one piece of content into multiple platform-optimized designs instantly.',
            features: ['Content repurposing', 'Platform adaptation', 'Style consistency', 'Quick iterations']
        },
        {
            title: 'Marketing Teams',
            description: 'Create campaign assets that drive engagement and conversion with AI-powered insights.',
            features: ['A/B testing variants', 'Performance tracking', 'Team collaboration', 'Brand guidelines']
        },
        {
            title: 'Small Businesses',
            description: 'Professional designs without the designer price tag. Create marketing materials in minutes.',
            features: ['No design skills needed', 'Affordable pricing', 'Commercial license', 'Quick turnaround']
        }
    ];

    return (
        <section className="use-cases-section">
            <div className="use-cases-container">
                <h2 className="section-title">Create & Enhance Thumbnails for Every Creator</h2>
                <p className="section-subtitle">
                    Whether you're creating thumbnails from scratch or enhancing existing ones, Revo3.ai helps every creator boost clicks and engagement.
                </p>
                <div className="use-cases-list">
                    {useCases.map((useCase, index) => (
                        <div key={index} className="use-case-item">
                            <h3 className="use-case-title">{useCase.title}</h3>
                            <p className="use-case-description">{useCase.description}</p>
                            <ul className="use-case-features">
                                {useCase.features.map((feature, idx) => (
                                    <li key={idx} className="use-case-feature-item">
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
