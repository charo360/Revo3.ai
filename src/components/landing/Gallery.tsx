import React, { FC } from 'react';

export const Gallery: FC = () => {
    const galleryItems = [
        {
            platform: 'YouTube',
            title: 'Before & After Thumbnail',
            description: '40% CTR increase after AI optimization',
            color: '#FF0000'
        },
        {
            platform: 'Podcast',
            title: 'Professional Podcast Cover',
            description: 'Stand out in podcast directories',
            color: '#7B68EE'
        },
        {
            platform: 'TikTok',
            title: 'Viral TikTok Cover',
            description: 'Mobile-optimized vertical design',
            color: '#000000'
        },
        {
            platform: 'Twitter',
            title: 'Twitter Card Design',
            description: 'Eye-catching feed content',
            color: '#1DA1F2'
        },
        {
            platform: 'Repurpose',
            title: 'Multi-Platform Design',
            description: 'One design, multiple platforms',
            color: '#4ECDC4'
        },
        {
            platform: 'YouTube',
            title: 'Improved Thumbnail',
            description: 'AI-enhanced click-through rates',
            color: '#FF0000'
        }
    ];

    return (
        <section className="gallery-section">
            <div className="gallery-container">
                <h2 className="section-title">See It In Action</h2>
                <p className="section-subtitle">
                    Real designs created by Revo3.ai. See the difference AI makes.
                </p>
                <div className="gallery-grid">
                    {galleryItems.map((item, index) => (
                        <div key={index} className="gallery-item" style={{ '--gallery-color': item.color } as React.CSSProperties}>
                            <div className="gallery-placeholder">
                                <div className="gallery-platform-badge">{item.platform}</div>
                                <div className="gallery-placeholder-content">
                                    <div className="gallery-placeholder-icon">🎨</div>
                                    <p>Design Preview</p>
                                </div>
                            </div>
                            <div className="gallery-item-info">
                                <h3 className="gallery-item-title">{item.title}</h3>
                                <p className="gallery-item-description">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
