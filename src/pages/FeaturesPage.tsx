import React, { FC, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Footer } from '../components/landing/Footer';

export const FeaturesPage: FC = () => {
    const location = useLocation();
    const createThumbnailsRef = useRef<HTMLDivElement>(null);
    const enhanceThumbnailsRef = useRef<HTMLDivElement>(null);
    const variationsRef = useRef<HTMLDivElement>(null);
    const platformsRef = useRef<HTMLDivElement>(null);

    // Handle hash navigation with scroll offset for fixed navbar
    const scrollToHash = (hash: string, delay: number = 150) => {
        if (!hash) return null;

        // Wait for the DOM to be fully rendered
        const timer = setTimeout(() => {
            let targetElement: HTMLElement | null = null;
            
            switch (hash) {
                case 'create-thumbnails':
                    targetElement = createThumbnailsRef.current;
                    break;
                case 'enhance-thumbnails':
                    targetElement = enhanceThumbnailsRef.current;
                    break;
                case 'variations':
                    targetElement = variationsRef.current;
                    break;
                case 'platforms':
                    targetElement = platformsRef.current;
                    break;
                default:
                    // Try to find element by ID
                    targetElement = document.getElementById(hash);
            }

            if (targetElement) {
                // Calculate navbar height (sticky navbar is approximately 80px on desktop, 64px on mobile)
                const navbar = document.querySelector('.landing-navbar') as HTMLElement;
                const navbarHeight = navbar ? navbar.offsetHeight : 80;
                const offset = navbarHeight + 20; // Add 20px padding

                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, delay);

        return timer;
    };

    // Handle hash changes (when clicking links)
    useEffect(() => {
        const hash = location.hash.slice(1); // Remove the # symbol
        if (!hash) return;
        
        const timer = scrollToHash(hash, 150);
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [location.hash]);

    // Handle initial page load with hash
    useEffect(() => {
        const hash = location.hash.slice(1);
        if (!hash) return;
        
        // Longer delay for initial page load to ensure DOM is ready
        const timer = scrollToHash(hash, 300);
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, []); // Run once on mount

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

                {/* Create Thumbnails Section */}
                <section 
                    id="create-thumbnails" 
                    ref={createThumbnailsRef}
                    className="feature-section"
                >
                    <div className="feature-section-container">
                        <div className="feature-icon-large">🎬</div>
                        <h2 className="feature-section-title">Create Thumbnails from Scratch</h2>
                        <p className="feature-section-description">
                            Generate stunning, clickable thumbnails from your video content, descriptions, or creative ideas. 
                            Our AI understands what makes thumbnails work and creates designs optimized for maximum clicks.
                        </p>
                        <div className="feature-section-details">
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Generate from video content or descriptions</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>AI-powered composition and color selection</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Optimized for click-through rates</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Multiple variations in seconds</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Enhance Thumbnails Section */}
                <section 
                    id="enhance-thumbnails" 
                    ref={enhanceThumbnailsRef}
                    className="feature-section"
                >
                    <div className="feature-section-container">
                        <div className="feature-icon-large">✨</div>
                        <h2 className="feature-section-title">Enhance Existing Thumbnails</h2>
                        <p className="feature-section-description">
                            Upload your existing thumbnail and let AI enhance it - better colors, clearer text, 
                            more engaging composition, optimized for clicks. Transform good thumbnails into great ones.
                        </p>
                        <div className="feature-section-details">
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Color correction and enhancement</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Text clarity and readability improvements</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Better composition and layout</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Background removal and optimization</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Variations Section */}
                <section 
                    id="variations" 
                    ref={variationsRef}
                    className="feature-section"
                >
                    <div className="feature-section-container">
                        <div className="feature-icon-large">📊</div>
                        <h2 className="feature-section-title">Thumbnail Variations</h2>
                        <p className="feature-section-description">
                            Generate 10+ thumbnail variations instantly. Test different styles, compositions, 
                            and colors to find what drives the most clicks and engagement.
                        </p>
                        <div className="feature-section-details">
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Multiple design variations in seconds</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Different styles and color schemes</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>A/B testing ready designs</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Easy comparison and selection</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Platform Optimization Section */}
                <section 
                    id="platforms" 
                    ref={platformsRef}
                    className="feature-section"
                >
                    <div className="feature-section-container">
                        <div className="feature-icon-large">🎯</div>
                        <h2 className="feature-section-title">Platform Optimization</h2>
                        <p className="feature-section-description">
                            AI creates thumbnails optimized for each platform - YouTube thumbnails that stand out, 
                            TikTok covers that grab attention, podcast covers that convert, and more.
                        </p>
                        <div className="feature-section-details">
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>YouTube thumbnails (1280x720)</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>TikTok & Shorts vertical covers</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Podcast covers (3000x3000)</span>
                            </div>
                            <div className="feature-detail-item">
                                <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Twitter cards and social media formats</span>
                            </div>
                        </div>
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
