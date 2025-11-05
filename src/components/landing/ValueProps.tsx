import React, { FC } from 'react';

export const ValueProps: FC = () => {
    const props = [
        {
            title: 'Create or Enhance Thumbnails',
            description: 'Generate brand new thumbnails from scratch or enhance your existing ones. AI analyzes what makes thumbnails clickable and creates variations that drive engagement.',
            icon: '🎬'
        },
        {
            title: 'Thumbnail-Optimized AI',
            description: 'Our AI is specifically trained on high-performing thumbnails. It understands color psychology, text placement, and composition that maximizes click-through rates.',
            icon: '📈'
        },
        {
            title: 'Built for Content Creators',
            description: 'Every feature is designed for creators who need thumbnails that perform. Fast generation, multiple variations, and platform-specific optimization.',
            icon: '👥'
        }
    ];

    return (
        <section className="value-props-section">
            <div className="value-props-container">
                <div className="value-props-grid">
                    {props.map((prop, index) => (
                        <div key={index} className="value-prop-card">
                            <div className="value-prop-icon">{prop.icon}</div>
                            <h3 className="value-prop-title">{prop.title}</h3>
                            <p className="value-prop-description">{prop.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
