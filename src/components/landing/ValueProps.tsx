import React, { FC } from 'react';

export const ValueProps: FC = () => {
    const props = [
        {
            title: 'Cutting-edge AI tools',
            description: 'Generate anything you can imagine with the newest AI image and AI video generators, and voiceover your videos with exclusive voices.',
            icon: '🤖'
        },
        {
            title: 'Highest-quality assets',
            description: 'Create standout videos with royalty-free designs, templates, and assets that are always on trend and platform-optimized.',
            icon: '⭐'
        },
        {
            title: 'Built for you',
            description: 'Every tool or asset has been built by creators, for creators, to streamline and simplify your creative process.',
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
