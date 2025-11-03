import React, { FC, useState } from 'react';

export const Newsletter: FC = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        // TODO: Integrate with email service
        setSubmitted(true);
        setEmail('');
        setError('');
    };

    if (submitted) {
        return (
            <section className="newsletter-section">
                <div className="newsletter-container">
                    <div className="newsletter-success">
                        <svg className="success-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <h3>Thanks for subscribing!</h3>
                        <p>Check your email for tips, updates, and exclusive content.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="newsletter-section">
            <div className="newsletter-container">
                <h2 className="section-title">Stay Updated</h2>
                <p className="section-subtitle">
                    Get the latest tips, product updates, and exclusive content delivered to your inbox.
                </p>
                <form onSubmit={handleSubmit} className="newsletter-form">
                    {error && <div className="newsletter-error">{error}</div>}
                    <div className="newsletter-input-group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter your email"
                            className="newsletter-input"
                            required
                        />
                        <button type="submit" className="newsletter-button">
                            Subscribe
                        </button>
                    </div>
                    <p className="newsletter-disclaimer">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                </form>
            </div>
        </section>
    );
};
