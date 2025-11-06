import React, { FC, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: FC = () => {
    const { user, signOut } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [platformsDropdownOpen, setPlatformsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside on mobile
    useEffect(() => {
        if (!platformsDropdownOpen) return;

        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            const target = event.target as HTMLElement;
            if (window.innerWidth < 769 && dropdownRef.current && !dropdownRef.current.contains(target)) {
                setPlatformsDropdownOpen(false);
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [platformsDropdownOpen]);

    const handlePlatformsToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPlatformsDropdownOpen(!platformsDropdownOpen);
    };

    const handlePlatformClick = () => {
        setPlatformsDropdownOpen(false);
        setMobileMenuOpen(false);
    };

    return (
        <nav className="landing-navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
                    <span className="logo-text">Revo3.ai</span>
                </Link>
                
                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                    <div 
                        ref={dropdownRef}
                        className={`navbar-dropdown ${platformsDropdownOpen ? 'active' : ''}`}
                        onMouseEnter={() => {
                            if (window.innerWidth >= 769) {
                                setPlatformsDropdownOpen(true);
                            }
                        }}
                        onMouseLeave={() => {
                            if (window.innerWidth >= 769) {
                                setPlatformsDropdownOpen(false);
                            }
                        }}
                    >
                        <button 
                            className="navbar-link platforms-toggle"
                            onClick={handlePlatformsToggle}
                            aria-expanded={platformsDropdownOpen}
                            aria-haspopup="true"
                        >
                            Platforms
                            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 4.5L6 7.5L9 4.5"/>
                            </svg>
                        </button>
                        <div className={`dropdown-menu ${platformsDropdownOpen ? 'open' : ''}`}>
                            <Link to="/platforms/youtube" className="dropdown-item" onClick={handlePlatformClick}>
                                <span>YouTube Thumbnails</span>
                            </Link>
                            <Link to="/platforms/podcast" className="dropdown-item" onClick={handlePlatformClick}>
                                <span>Podcast Covers</span>
                            </Link>
                            <Link to="/platforms/tiktok" className="dropdown-item" onClick={handlePlatformClick}>
                                <span>TikTok & Shorts</span>
                            </Link>
                            <Link to="/platforms/twitter" className="dropdown-item" onClick={handlePlatformClick}>
                                <span>Twitter Cards</span>
                            </Link>
                            <Link to="/platforms/repurpose" className="dropdown-item" onClick={handlePlatformClick}>
                                <span>Content Repurpose</span>
                            </Link>
                        </div>
                    </div>
                    <Link to="/features" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Features</Link>
                    <Link to="/pricing" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                    <Link to="/business" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Business</Link>
                    
                    {user ? (
                        <>
                            <Link to="/dashboard" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Studio</Link>
                            <button onClick={() => {
                                signOut();
                                setMobileMenuOpen(false);
                            }} className="navbar-button secondary">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                            <Link to="/signup" className="navbar-button primary" onClick={() => setMobileMenuOpen(false)}>
                                Start Free Now
                            </Link>
                        </>
                    )}
                </div>
                
                <button 
                    className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
                    onClick={() => {
                        setMobileMenuOpen(!mobileMenuOpen);
                        if (!mobileMenuOpen) {
                            setPlatformsDropdownOpen(false);
                        }
                    }}
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
};
