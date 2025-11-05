import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: FC = () => {
    const { user, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="landing-navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-text">Revo3.ai</span>
                </Link>
                
                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <div className="navbar-dropdown">
                        <span className="navbar-link">Platforms</span>
                        <div className="dropdown-menu">
                            <Link to="/platforms/youtube" className="dropdown-item">YouTube Thumbnails</Link>
                            <Link to="/platforms/podcast" className="dropdown-item">Podcast Covers</Link>
                            <Link to="/platforms/tiktok" className="dropdown-item">TikTok & Shorts</Link>
                            <Link to="/platforms/twitter" className="dropdown-item">Twitter Cards</Link>
                            <Link to="/platforms/repurpose" className="dropdown-item">Content Repurpose</Link>
                        </div>
                    </div>
                    <Link to="/features" className="navbar-link">Features</Link>
                    <Link to="/pricing" className="navbar-link">Pricing</Link>
                    <Link to="/business" className="navbar-link">Business</Link>
                    
                    {user ? (
                        <>
                            <Link to="/dashboard" className="navbar-link">Studio</Link>
                            <button onClick={signOut} className="navbar-button secondary">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-link">Sign In</Link>
                            <Link to="/signup" className="navbar-button primary">
                                Start Free Now
                            </Link>
                        </>
                    )}
                </div>
                
                <button 
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
};
