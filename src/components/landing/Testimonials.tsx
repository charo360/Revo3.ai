import React, { FC } from 'react';

interface Testimonial {
    quote: string;
    author: string;
    role: string;
    image?: string;
}

export const Testimonials: FC = () => {
    const testimonials: Testimonial[] = [
        {
            quote: "With Revo3.ai, I can create professional YouTube thumbnails in seconds. The AI understands what makes designs click, and my CTR has improved by 40%.",
            author: "Sam Newton",
            role: "YouTuber"
        },
        {
            quote: "The remarkable quality of their designs has elevated our branded marketing activities to new heights. The custom AI suggestions are a game changer.",
            author: "Albert Mur",
            role: "Senior Graphic Designer"
        },
        {
            quote: "An all-in-one Revo3.ai subscription takes the stress out of creating and lets me focus on what I do best - making videos I love.",
            author: "Peter McKinnon",
            role: "Content Creator"
        },
        {
            quote: "Revo3.ai has enabled us to elevate our content with cinematic quality designs. The platform is extensive and easy to use to find what we need.",
            author: "John Cassaras",
            role: "Director of Video"
        },
        {
            quote: "I've been using Revo3.ai for months. Now that everything I need is in one place, it's literally a one-stop shop for creativity!",
            author: "Dan Mace",
            role: "YouTuber"
        }
    ];

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <h2 className="section-title">Trusted by Creators Worldwide</h2>
                <p className="section-subtitle">
                    Join thousands of creators who use Revo3.ai to create viral content that converts.
                </p>
                <div className="testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="testimonial-quote">
                                <svg className="quote-icon" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                                </svg>
                                <p>"{testimonial.quote}"</p>
                            </div>
                            <div className="testimonial-author">
                                <div className="author-avatar">
                                    {testimonial.author.charAt(0)}
                                </div>
                                <div className="author-info">
                                    <div className="author-name">{testimonial.author}</div>
                                    <div className="author-role">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
