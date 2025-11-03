import React, { FC } from 'react';

export const Workflow: FC = () => {
    const workflows = [
        {
            step: '01',
            title: 'Start with Content',
            description: 'Upload images, paste a YouTube URL, or upload video files. Our AI extracts the best frames automatically.',
            image: '📤',
            details: [
                'YouTube URL parsing',
                'Video frame extraction',
                'Image upload support',
                'Auto frame selection'
            ]
        },
        {
            step: '02',
            title: 'Configure Your Design',
            description: 'Set your preferences: platform type, colors, text content, logo placement, and style. Or let AI suggest optimal settings.',
            image: '⚙️',
            details: [
                'Platform selection',
                'Color palette tools',
                'Text customization',
                'Logo integration'
            ]
        },
        {
            step: '03',
            title: 'AI Generates Designs',
            description: 'Our AI analyzes your content and generates multiple design variations optimized for your chosen platform.',
            image: '✨',
            details: [
                'Multiple variations',
                'Platform optimization',
                'Smart composition',
                'Color harmony'
            ]
        },
        {
            step: '04',
            title: 'Refine & Export',
            description: 'Use our full-featured editor to fine-tune designs, then export in high resolution ready for any platform.',
            image: '🚀',
            details: [
                'Live editing',
                'Magic Studio AI edits',
                'High-res exports',
                'Multiple formats'
            ]
        }
    ];

    return (
        <section className="workflow-section">
            <div className="workflow-container">
                <h2 className="section-title">Simple Workflow, Powerful Results</h2>
                <p className="section-subtitle">
                    From idea to execution in minutes. No design experience required.
                </p>
                <div className="workflow-timeline">
                    {workflows.map((workflow, index) => (
                        <div key={index} className="workflow-item">
                            <div className="workflow-step-number">{workflow.step}</div>
                            <div className="workflow-content">
                                <div className="workflow-image">{workflow.image}</div>
                                <h3 className="workflow-title">{workflow.title}</h3>
                                <p className="workflow-description">{workflow.description}</p>
                                <ul className="workflow-details">
                                    {workflow.details.map((detail, idx) => (
                                        <li key={idx}>{detail}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
