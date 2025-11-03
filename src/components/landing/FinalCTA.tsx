import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const FinalCTA: FC = () => {
    return (
        <section className="final-cta-section">
            <div className="final-cta-container">
                <h2 className="final-cta-title">Everything you need to create without limits</h2>
                <p className="final-cta-description">
                    Start creating viral designs today. No credit card required.
                </p>
                <Link to="/signup" className="cta-button primary large">
                    Start Free Now
                </Link>
            </div>
        </section>
    );
};
