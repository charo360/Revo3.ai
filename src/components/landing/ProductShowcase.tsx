import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const ProductShowcase: FC = () => {
    const products = [
        {
            title: 'AI Design Generation',
            subtitle: 'built for creators',
            description: 'Generate stunning thumbnails, covers, and social media content with AI that understands platform requirements.',
            icon: '🎨',
            color: '#6a5acd',
            cta: 'Explore AI Design',
            link: '/features#ai-design'
        },
        {
            title: 'Magic Studio',
            subtitle: 'AI-powered editing',
            description: 'Edit, enhance, upscale, and transform images with AI. Remove backgrounds, add elements, or recolor entire compositions.',
            icon: '✨',
            color: '#00d4ff',
            cta: 'Explore Magic Studio',
            link: '/features#magic-studio'
        },
        {
            title: 'Smart Color Palettes',
            subtitle: 'AI-suggested schemes',
            description: 'AI analyzes your content and suggests perfect color combinations for maximum impact and engagement.',
            icon: '🎯',
            color: '#ff6b6b',
            cta: 'Explore Colors',
            link: '/features#colors'
        },
        {
            title: 'Full Canvas Editor',
            subtitle: 'professional control',
            description: 'Complete design control with text, shapes, images, emojis, and more. Export in any resolution.',
            icon: '🖼️',
            color: '#4ecdc4',
            cta: 'Explore Editor',
            link: '/features#editor'
        }
    ];

    return (
        <section className="product-showcase-section">
            <div className="product-showcase-container">
                <h2 className="section-title">Cutting-edge AI tools</h2>
                <p className="section-subtitle">
                    Generate anything you can imagine with the newest AI image and video generators, powered by advanced machine learning.
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
