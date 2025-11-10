import React, { FC } from 'react';
import { Link } from 'react-router-dom';

const UploadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
);

const SettingsIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3m15.364 6.364l-4.243-4.243m-4.242 0L5.636 17.364M18.364 6.636l-4.243 4.243m-4.242 0L5.636 6.636"></path>
    </svg>
);

const SparklesIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
);

export const HowItWorks: FC = () => {
    const steps = [
        {
            number: '01',
            title: 'Upload Video or Existing Thumbnail',
            description: 'Paste a YouTube URL or upload your video. Want to enhance an existing thumbnail? Just upload it. AI extracts frames and analyzes your content.',
            icon: <UploadIcon />
        },
        {
            number: '02',
            title: 'Choose: Create or Enhance',
            description: 'Create a new thumbnail from scratch or enhance your existing one. Set preferences for colors, text, style - or let AI optimize automatically.',
            icon: <SettingsIcon />
        },
        {
            number: '03',
            title: 'Generate Thumbnail Variations',
            description: 'Get 10+ thumbnail variations in seconds. Each optimized for clicks and engagement. Use our editor to fine-tune or generate more variations.',
            icon: <SparklesIcon />
        },
        {
            number: '04',
            title: 'Download & Boost CTR',
            description: 'Download your optimized thumbnails in high resolution. Ready to upload and watch your click-through rates improve.',
            icon: <DownloadIcon />
        }
    ];

    return (
        <section className="how-it-works-section">
            <div className="how-it-works-container">
                <h2 className="section-title">How to Create & Enhance Thumbnails</h2>
                <p className="section-subtitle">
                    Create thumbnails from scratch or enhance existing ones. Four simple steps to thumbnails that drive clicks and engagement.
                </p>
                <div className="steps-grid">
                    {steps.map((step, index) => (
                        <div key={index} className="step-card">
                            <div className="step-number">{step.number}</div>
                            <div className="step-icon">{step.icon}</div>
                            <h3 className="step-title">{step.title}</h3>
                            <p className="step-description">{step.description}</p>
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
