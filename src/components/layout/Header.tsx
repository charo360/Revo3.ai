import React, { FC, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Platform } from '../../types';
import { PLATFORM_CONFIGS, PLATFORM_ORDER } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
    platform: Platform;
    onPlatformChange: (platform: Platform) => void;
}

export const Header: FC<HeaderProps> = ({ platform, onPlatformChange }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const userMenuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const currentPlatform = PLATFORM_CONFIGS[platform];

    // Close user menu when clicking outside
    useEffect(() => {
        if (!userMenuOpen) return;
        
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        };
        
        // Use a small delay to prevent immediate closure
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 100);
        
        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [userMenuOpen]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <header className="app-header">
            <div className="header-container">
                <div className="header-left">
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

                {/* User Menu */}
                {user && (
                    <div 
                        className="user-menu-wrapper" 
                        ref={userMenuRef} 
                        style={{ 
                            position: 'relative', 
                            marginLeft: 'auto', 
                            zIndex: 9999, 
                            flexShrink: 0 
                        }}
                    >
                        <button
                            ref={buttonRef}
                            className="user-menu-trigger"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('User menu clicked, current state:', userMenuOpen);
                                
                                // Calculate position for dropdown
                                if (buttonRef.current) {
                                    const rect = buttonRef.current.getBoundingClientRect();
                                    setMenuPosition({
                                        top: rect.bottom + 12,
                                        right: window.innerWidth - rect.right,
                                    });
                                }
                                
                                setUserMenuOpen(!userMenuOpen);
                            }}
                            aria-label="User menu"
                            aria-expanded={userMenuOpen}
                            type="button"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '50%',
                                padding: '4px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative',
                                zIndex: 9999,
                            }}
                        >
                            <div 
                                className="user-avatar-button"
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                }}
                            >
                                {user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </button>
                        {userMenuOpen && (
                            <div 
                                className="user-menu-dropdown"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    position: 'fixed',
                                    top: `${menuPosition.top}px`,
                                    right: `${menuPosition.right}px`,
                                    backgroundColor: 'var(--surface-1)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--border-radius)',
                                    minWidth: '280px',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                                    overflow: 'hidden',
                                    zIndex: 99999,
                                    animation: 'fadeIn 0.15s ease-out',
                                }}
                            >
                                {/* User Info Header */}
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: 'var(--surface-2)',
                                    borderBottom: '1px solid var(--border-color)',
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary), var(--primary-hover))',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '18px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                        }}>
                                            {user.email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                color: 'var(--text-primary)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}>
                                                {user.email}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: 'var(--text-secondary)',
                                                marginTop: '2px',
                                            }}>
                                                Account
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div style={{ padding: '8px 0' }}>
                                    <Link
                                        to="/profile"
                                        className="user-menu-item-link"
                                        onClick={() => {
                                            console.log('Profile clicked');
                                            setUserMenuOpen(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            textDecoration: 'none',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                                            e.currentTarget.style.color = 'var(--primary)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                        }}
                                    >
                                        <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                        <span>Profile Settings</span>
                                    </Link>
                                    
                                    <div style={{
                                        height: '1px',
                                        backgroundColor: 'var(--border-color)',
                                        margin: '4px 16px',
                                    }}></div>
                                    
                                    <button
                                        className="user-menu-item-button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            console.log('Sign out clicked');
                                            setUserMenuOpen(false);
                                            handleSignOut();
                                        }}
                                        type="button"
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            width: '100%',
                                            padding: '12px 16px',
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-primary)',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                                            e.currentTarget.style.color = '#ef4444';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-primary)';
                                        }}
                                    >
                                        <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};
