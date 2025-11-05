import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export const Footer: FC = () => {
    return (
        <footer className="landing-footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4 className="footer-title">Revo3.ai</h4>
                        <p className="footer-description">
                            AI-powered design studio for creating viral content that converts. Everything you need to create without limits.
                        </p>
                    </div>
                    <div className="footer-section">
                        <h5 className="footer-heading">Platforms</h5>
                        <ul className="footer-links">
                            <li><Link to="/platforms/youtube">YouTube Thumbnails</Link></li>
                            <li><Link to="/platforms/podcast">Podcast Covers</Link></li>
                            <li><Link to="/platforms/tiktok">TikTok & Shorts</Link></li>
                            <li><Link to="/platforms/twitter">Twitter Cards</Link></li>
                            <li><Link to="/platforms/repurpose">Content Repurpose</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5 className="footer-heading">Product</h5>
                        <ul className="footer-links">
                            <li><Link to="/features">Features</Link></li>
                            <li><Link to="/pricing">Pricing</Link></li>
                            <li><Link to="/dashboard">Studio</Link></li>
                            <li><Link to="/business">Business</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5 className="footer-heading">Resources</h5>
                        <ul className="footer-links">
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/tutorials">Tutorials</Link></li>
                            <li><Link to="/examples">Examples</Link></li>
                            <li><a href="#faq">FAQ</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5 className="footer-heading">Company</h5>
                        <ul className="footer-links">
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h5 className="footer-heading">Legal</h5>
                        <ul className="footer-links">
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                            <li><Link to="/cookies">Cookie Policy</Link></li>
                            <li><Link to="/licenses">Licenses</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 Revo3.ai. All rights reserved.</p>
                    <div className="footer-social">
                        <a href="#" aria-label="Twitter">Twitter</a>
                        <a href="#" aria-label="LinkedIn">LinkedIn</a>
                        <a href="#" aria-label="Instagram">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
