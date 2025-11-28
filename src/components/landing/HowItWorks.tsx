import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const HowItWorks: FC = () => {
    const steps = [
        {
            number: '01',
            title: 'Upload Video or Existing Thumbnail',
            description: 'Paste a YouTube URL or upload your video. Want to enhance an existing thumbnail? Just upload it. AI extracts frames and analyzes your content.'
        },
        {
            number: '02',
            title: 'Choose: Create or Enhance',
            description: 'Create a new thumbnail from scratch or enhance your existing one. Set preferences for colors, text, style - or let AI optimize automatically.'
        },
        {
            number: '03',
            title: 'Generate Thumbnail Variations',
            description: 'Get 10+ thumbnail variations in seconds. Each optimized for clicks and engagement. Use our editor to fine-tune or generate more variations.'
        },
        {
            number: '04',
            title: 'Download & Boost CTR',
            description: 'Download your optimized thumbnails in high resolution. Ready to upload and watch your click-through rates improve.'
        }
    ];

    return (
        <section className="how-it-works-section">
            <div className="how-it-works-container">
                <h2 className="section-title">How to Create & Enhance Thumbnails</h2>
                <p className="section-subtitle">
                    Create thumbnails from scratch or enhance existing ones. Four simple steps to thumbnails that drive clicks and engagement.
                </p>
                <div className="steps-list">
                    {steps.map((step, index) => (
                        <div key={index} className="step-item">
                            <div className="step-number">{step.number}</div>
                            <div className="step-content">
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-description">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="how-it-works-cta">
                    <Link to="/signup" className="cta-button primary">
                        Create Thumbnails for Free
                    </Link>
                </div>
            </div>
        </section>
    );
};
