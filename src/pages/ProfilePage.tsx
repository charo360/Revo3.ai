import React, { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const ProfilePage: FC = () => {
    const { user, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Initialize email when user loads
    React.useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || email === user?.email) return;

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ email });
            if (updateError) {
                toast.error(updateError.message || 'Failed to update email');
            } else {
                toast.success('Email update request sent! Please check your new email for confirmation.');
                setEmail(user?.email || '');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to update email');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) {
                toast.error(updateError.message || 'Failed to update password');
            } else {
                toast.success('Password updated successfully!');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        toast.success('Signed out successfully');
        navigate('/');
    };

    if (authLoading) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="loading-screen">
                        <div className="spinner"></div>
                        <p>Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="profile-error">
                        You must be logged in to view your profile.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header">
                    <h1>Profile Settings</h1>
                    <Link to="/dashboard" className="back-link">
                        ← Back to Dashboard
                    </Link>
                </div>

                <div className="profile-content">
                    {/* Account Info Section */}
                    <section className="profile-section">
                        <h2>Account Information</h2>
                        <div className="profile-info-card">
                            <div className="profile-avatar-large">
                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="profile-info">
                                <div className="profile-info-item">
                                    <label>Email</label>
                                    <div className="profile-value">{user?.email}</div>
                                </div>
                                <div className="profile-info-item">
                                    <label>Account Created</label>
                                    <div className="profile-value-small">
                                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Email Update Section */}
                    <section className="profile-section">
                        <h2>Update Email</h2>
                        <form onSubmit={handleUpdateEmail} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="email">New Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={user?.email || 'your@email.com'}
                                    required
                                />
                            </div>
                            <button type="submit" className="profile-btn primary" disabled={loading || email === user?.email}>
                                {loading ? 'Updating...' : 'Update Email'}
                            </button>
                        </form>
                    </section>

                    {/* Password Update Section */}
                    <section className="profile-section">
                        <h2>Change Password</h2>
                        <form onSubmit={handleUpdatePassword} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="new-password">New Password</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <button type="submit" className="profile-btn primary" disabled={loading || !newPassword || !confirmPassword}>
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    </section>

                    {/* Danger Zone */}
                    <section className="profile-section danger-zone">
                        <h2>Account Actions</h2>
                        <div className="profile-actions">
                            <button
                                className="profile-btn danger"
                                onClick={handleSignOut}
                                type="button"
                            >
                                Sign Out
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

