import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const FinalCTA: FC = () => {
    return (
        <section className="final-cta-section">
            <div className="final-cta-container">
                <h2 className="final-cta-title">Create & Enhance Thumbnails That Drive Clicks</h2>
                <p className="final-cta-description">
                    Start creating thumbnails from scratch or enhancing existing ones today. No credit card required.
                </p>
                <Link to="/signup" className="cta-button primary large">
                    Start Free Now
                </Link>
            </div>
        </section>
    );
};
