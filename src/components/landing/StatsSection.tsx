import React, { FC } from 'react';

export const StatsSection: FC = () => {
    const stats = [
        {
            number: '30M+',
            label: 'Creators Worldwide',
            description: 'Trusted by creators and businesses globally'
        },
        {
            number: '10M+',
            label: 'Designs Created',
            description: 'Millions of designs generated with AI'
        },
        {
            number: '99.9%',
            label: 'Uptime',
            description: 'Reliable service you can count on'
        },
        {
            number: '24/7',
            label: 'AI Powered',
            description: 'Always available, always learning'
        },
        {
            number: '40%',
            label: 'CTR Increase',
            description: 'Average click-through rate improvement'
        },
        {
            number: '< 30s',
            label: 'Generation Time',
            description: 'Lightning-fast design generation'
        }
    ];

    return (
        <section className="stats-section">
            <div className="stats-container">
                <h2 className="section-title">Thumbnails That Drive Results</h2>
                <p className="section-subtitle">
                    Join millions of creators using Revo3.ai to create and enhance thumbnails that boost clicks and engagement
                </p>
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-number-large">{stat.number}</div>
                            <div className="stat-label-large">{stat.label}</div>
                            <div className="stat-description">{stat.description}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
