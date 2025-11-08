import React, { FC } from 'react';

export const Integrations: FC = () => {
    const integrations = [
        {
            name: 'YouTube',
            description: 'Connect your YouTube channel to automatically fetch thumbnails and improve CTR',
            icon: '🎬'
        },
        {
            name: 'TikTok',
            description: 'Generate TikTok covers directly from your video content',
            icon: '📱'
        },
        {
            name: 'Podcast Platforms',
            description: 'Export podcast covers optimized for Apple Podcasts, Spotify, and more',
            icon: '🎙️'
        },
        {
            name: 'Social Media',
            description: 'One-click export to Instagram, Twitter, Facebook, and LinkedIn',
            icon: '🌐'
        },
        {
            name: 'Cloud Storage',
            description: 'Save designs to Google Drive, Dropbox, and OneDrive',
            icon: '☁️',
            status: 'Coming Soon'
        },
        {
            name: 'Design Tools',
            description: 'Export to Figma, Canva, and Adobe Creative Suite formats',
            icon: '🎨',
            status: 'Coming Soon'
        }
    ];

    return (
        <section className="integrations-section">
            <div className="integrations-container">
                <h2 className="section-title">Integrations & Workflows</h2>
                <p className="section-subtitle">
                    Connect with your favorite tools and platforms. Export designs seamlessly to where you need them.
                </p>
                <div className="integrations-grid">
                    {integrations.map((integration, index) => (
                        <div key={index} className="integration-card">
                            <div className="integration-header">
                                <div className="integration-icon">{integration.icon}</div>
                                {integration.status && integration.status !== 'Available' && (
                                    <div className="integration-badge">{integration.status}</div>
                                )}
                            </div>
                            <h3 className="integration-name">{integration.name}</h3>
                            <p className="integration-description">{integration.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
