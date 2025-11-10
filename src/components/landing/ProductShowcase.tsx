import React, { FC } from 'react';
import { Link } from 'react-router-dom';

const CreateIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
    </svg>
);

const EnhanceIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const VariationsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
);

const PlatformIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
);

export const ProductShowcase: FC = () => {
    const products = [
        {
            title: 'Create Thumbnails',
            subtitle: 'from scratch',
            description: 'Generate stunning, clickable thumbnails from your video content, descriptions, or creative ideas. AI understands what makes thumbnails work.',
            icon: <CreateIcon />,
            color: '#FF0000',
            cta: 'Create Thumbnails',
            link: '/features#create-thumbnails'
        },
        {
            title: 'Enhance Thumbnails',
            subtitle: 'AI-powered improvement',
            description: 'Upload your existing thumbnail and let AI enhance it - better colors, clearer text, more engaging composition, optimized for clicks.',
            icon: <EnhanceIcon />,
            color: '#00d4ff',
            cta: 'Enhance Thumbnails',
            link: '/features#enhance-thumbnails'
        },
        {
            title: 'Thumbnail Variations',
            subtitle: 'multiple options',
            description: 'Generate 10+ thumbnail variations instantly. Test different styles, compositions, and colors to find what drives the most clicks.',
            icon: <VariationsIcon />,
            color: '#ff6b6b',
            cta: 'Explore Variations',
            link: '/features#variations'
        },
        {
            title: 'Platform Optimization',
            subtitle: 'YouTube, TikTok & more',
            description: 'AI creates thumbnails optimized for each platform - YouTube thumbnails that stand out, TikTok covers that grab attention, podcast covers that convert.',
            icon: <PlatformIcon />,
            color: '#4ecdc4',
            cta: 'See Platforms',
            link: '/features#platforms'
        }
    ];

    return (
        <section className="product-showcase-section">
            <div className="product-showcase-container">
                <h2 className="section-title">Create & Enhance Thumbnails That Drive Results</h2>
                <p className="section-subtitle">
                    Whether you're creating thumbnails from scratch or enhancing existing ones, our AI understands what makes thumbnails clickable and engaging.
                </p>
                <div className="product-showcase-grid">
                    {products.map((product, index) => (
                        <div key={index} className="product-showcase-card" style={{ '--product-color': product.color } as React.CSSProperties}>
                            <div className="product-showcase-header">
                                <div className="product-icon">{product.icon}</div>
                                <div className="product-title-group">
                                    <h3 className="product-title">{product.title}</h3>
                                    <p className="product-subtitle">{product.subtitle}</p>
                                </div>
                            </div>
                            <p className="product-description">{product.description}</p>
                            <Link to={product.link} className="product-cta">
                                {product.cta}
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
