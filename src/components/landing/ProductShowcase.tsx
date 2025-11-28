import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const ProductShowcase: FC = () => {
    const products = [
        {
            title: 'Create Thumbnails',
            subtitle: 'from scratch',
            description: 'Generate stunning, clickable thumbnails from your video content, descriptions, or creative ideas. AI understands what makes thumbnails work.',
            cta: 'Create Thumbnails',
            link: '/features#create-thumbnails'
        },
        {
            title: 'Enhance Thumbnails',
            subtitle: 'AI-powered improvement',
            description: 'Upload your existing thumbnail and let AI enhance it - better colors, clearer text, more engaging composition, optimized for clicks.',
            cta: 'Enhance Thumbnails',
            link: '/features#enhance-thumbnails'
        },
        {
            title: 'Thumbnail Variations',
            subtitle: 'multiple options',
            description: 'Generate 10+ thumbnail variations instantly. Test different styles, compositions, and colors to find what drives the most clicks.',
            cta: 'Explore Variations',
            link: '/features#variations'
        },
        {
            title: 'Platform Optimization',
            subtitle: 'YouTube, TikTok & more',
            description: 'AI creates thumbnails optimized for each platform - YouTube thumbnails that stand out, TikTok covers that grab attention, podcast covers that convert.',
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
                <div className="product-showcase-list">
                    {products.map((product, index) => (
                        <div key={index} className="product-item">
                            <div className="product-header">
                                <h3 className="product-title">{product.title}</h3>
                                <span className="product-subtitle">{product.subtitle}</span>
                            </div>
                            <p className="product-description">{product.description}</p>
                            <Link to={product.link} className="product-cta">
                                {product.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
