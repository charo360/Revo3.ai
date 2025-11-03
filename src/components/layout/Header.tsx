import React, { FC, useState } from 'react';
import { Platform } from '../../types';
import { PLATFORM_CONFIGS, PLATFORM_ORDER } from '../../constants';

interface HeaderProps {
    platform: Platform;
    onPlatformChange: (platform: Platform) => void;
}

export const Header: FC<HeaderProps> = ({ platform, onPlatformChange }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const currentPlatform = PLATFORM_CONFIGS[platform];

    return (
        <header className="app-header">
            <div className="header-container">
                {/* Mobile Platform Selector */}
                <div className={`mobile-platform-selector ${mobileMenuOpen ? 'active' : ''}`}>
                    <button
                        className="mobile-platform-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Select platform"
                        aria-expanded={mobileMenuOpen}
                        type="button"
                    >
                        {currentPlatform.icon}
                        <span>{currentPlatform.title}</span>
                        <svg className="dropdown-arrow" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                    {mobileMenuOpen && (
                        <div className="mobile-platform-menu">
                            {PLATFORM_ORDER.map(key => {
                                const config = PLATFORM_CONFIGS[key];
                                return (
                                    <button
                                        key={key}
                                        className={`mobile-platform-item ${key === platform ? 'active' : ''}`}
                                        onClick={() => {
                                            onPlatformChange(key);
                                            setMobileMenuOpen(false);
                                        }}
                                        type="button"
                                    >
                                        {config.icon}
                                        <span>{config.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Desktop Platform Nav */}
                <nav className="platform-nav">
                    {PLATFORM_ORDER.map(key => {
                        const config = PLATFORM_CONFIGS[key];
                        return (
                            <button
                                key={key}
                                className={`platform-nav-btn ${key === platform ? 'active' : ''}`}
                                onClick={() => onPlatformChange(key)}
                                title={config.title}
                                aria-label={config.title}
                                type="button"
                            >
                                {config.icon}
                                <span>{config.title}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
};
