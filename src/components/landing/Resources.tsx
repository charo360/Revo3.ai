import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const Resources: FC = () => {
    const resources = [
        {
            type: 'Guide',
            title: 'YouTube Thumbnail Best Practices',
            description: 'Learn how to create thumbnails that drive clicks and boost CTR.',
            icon: '📚',
            link: '/guides/youtube-thumbnails'
        },
        {
            type: 'Tutorial',
            title: 'Getting Started with Revo3.ai',
            description: 'Step-by-step guide to creating your first AI-powered design.',
            icon: '🎓',
            link: '/tutorials/getting-started'
        },
        {
            type: 'Case Study',
            title: 'How We Increased CTR by 40%',
            description: 'Real results from creators using Revo3.ai for their thumbnails.',
            icon: '📊',
            link: '/case-studies/ctr-increase'
        },
        {
            type: 'Blog',
            title: 'Design Trends for 2024',
            description: 'Stay ahead with the latest design trends and platform updates.',
            icon: '📝',
            link: '/blog/design-trends-2024'
        },
        {
            type: 'Video',
            title: 'Platform Overview Video',
            description: 'Watch a walkthrough of all Revo3.ai features and capabilities.',
            icon: '🎥',
            link: '/videos/platform-overview'
        },
        {
            type: 'Template',
            title: 'Design Template Library',
            description: 'Browse our collection of pre-made templates to get started faster.',
            icon: '📋',
            link: '/templates'
        }
    ];

    return (
        <section className="resources-section">
            <div className="resources-container">
                <h2 className="section-title">Resources & Learning</h2>
                <p className="section-subtitle">
                    Everything you need to master AI-powered design and grow your audience.
                </p>
                <div className="resources-grid">
                    {resources.map((resource, index) => (
                        <Link key={index} to={resource.link} className="resource-card">
                            <div className="resource-type">{resource.type}</div>
                            <div className="resource-icon">{resource.icon}</div>
                            <h3 className="resource-title">{resource.title}</h3>
                            <p className="resource-description">{resource.description}</p>
                            <div className="resource-link">
                                Learn More
                                <svg className="arrow-icon" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};
