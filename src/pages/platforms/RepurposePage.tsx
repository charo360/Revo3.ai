import React, { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { RepurposeModule } from '../../features/content-repurpose/components/RepurposeModule';

export const RepurposePage: FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <Navbar />
            <div className="platform-page-content">
                {user ? (
                    // Dashboard view for authenticated users
                    <div className="repurpose-dashboard">
                        <div className="repurpose-dashboard-header">
                            <h1>Content Repurpose</h1>
                            <p>Turn long videos into viral shorts with AI-powered analysis</p>
                        </div>
                        <RepurposeModule onResultsGenerated={(results) => {
                            console.log('Repurpose results:', results);
                            // Handle results (e.g., navigate to results page, show notification)
                        }} />
                    </div>
                ) : (
                    // Landing page view for non-authenticated users
                    <>
                        <section className="platform-hero">
                            <div className="platform-hero-container">
                                <div className="platform-badge">Content Repurpose</div>
                                <h1>Turn Long Videos Into Viral Shorts</h1>
                                <p>AI-powered video clipping that transforms your long-form content into engaging short-form videos. One long video, 10 viral clips. Create 10x faster.</p>
                                <Link to="/signup" className="cta-button primary">Start Creating Free</Link>
                            </div>
                        </section>

                <section className="platform-features">
                    <div className="platform-features-container">
                        <h2>Everything You Need to Create Viral Shorts</h2>
                        <p className="section-subtitle">
                            Our AI analyzes your long videos, identifies the best moments, and automatically creates engaging shorts optimized for maximum views and engagement.
                        </p>
                        <div className="platform-features-grid">
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎬</div>
                                <h3>AI Video Clipping</h3>
                                <p>Drop a video link or upload a long video. AI automatically identifies the most engaging moments and creates viral-worthy clips in seconds.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📱</div>
                                <h3>Multi-Platform Format</h3>
                                <p>Automatically resize videos for YouTube Shorts, TikTok, Instagram Reels, and more. One video, multiple platform-ready formats.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎯</div>
                                <h3>Smart Scene Detection</h3>
                                <p>AI analyzes every frame to find the most engaging moments, perfect transitions, and natural cut points for seamless clips.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">💬</div>
                                <h3>Auto-Generated Captions</h3>
                                <p>Automatically add animated captions with perfect timing. Edit text, style, and position to match your brand.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎨</div>
                                <h3>AI Reframing & Tracking</h3>
                                <p>Intelligent object tracking keeps your subject centered when resizing from horizontal to vertical. Manual tracking available for full control.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">⚡</div>
                                <h3>Batch Generation</h3>
                                <p>Generate 10+ viral clips from one long video in minutes, not hours. Test multiple variations to see what performs best.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎵</div>
                                <h3>Audio Enhancement</h3>
                                <p>AI-powered audio enhancement and voice-over capabilities. Improve audio quality or add narration automatically.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📊</div>
                                <h3>Virality Scoring</h3>
                                <p>Get AI-powered predictions on which clips are most likely to go viral based on engagement patterns and trending content.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-how-it-works">
                    <div className="platform-how-it-works-container">
                        <h2>Create Viral Shorts in 4 Simple Steps</h2>
                        <p className="section-subtitle">
                            From long video to viral shorts in minutes. No editing skills required.
                        </p>
                        <div className="platform-steps">
                            <div className="platform-step">
                                <div className="step-number">1</div>
                                <h3>Upload or Paste Video Link</h3>
                                <p>Upload your long video file or paste a YouTube, Vimeo, Zoom, or other video platform URL. AI supports videos from any source.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">2</div>
                                <h3>AI Analyzes & Identifies Best Moments</h3>
                                <p>Our AI analyzes your video content, transcript, and visual cues to identify the most engaging moments, perfect cuts, and viral-worthy clips.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">3</div>
                                <h3>Generate Multiple Clips Instantly</h3>
                                <p>AI automatically creates 10+ optimized shorts with captions, reframing, transitions, and strong calls-to-action. Each clip is ready to publish.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">4</div>
                                <h3>Edit, Export & Publish</h3>
                                <p>Fine-tune clips with our editor, or export directly. Each clip is optimized for its platform - YouTube Shorts, TikTok, Instagram Reels, and more.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-features">
                    <div className="platform-features-container">
                        <h2>Supported Video Sources</h2>
                        <p className="section-subtitle">
                            Works with videos from any platform. Just paste the link or upload directly.
                        </p>
                        <div className="platform-features-grid">
                            <div className="platform-feature-card">
                                <div className="feature-icon">📺</div>
                                <h3>YouTube</h3>
                                <p>Paste any YouTube video URL. Works with public videos, private links, and even live streams.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">💾</div>
                                <h3>Google Drive</h3>
                                <p>Upload videos from Google Drive. Share a link and we'll process it automatically.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📹</div>
                                <h3>Vimeo & Zoom</h3>
                                <p>Support for Vimeo videos and Zoom recordings. Perfect for repurposing webinars and presentations.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎥</div>
                                <h3>Direct Upload</h3>
                                <p>Upload video files directly from your device. Supports MP4, MOV, AVI, and other common formats.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🔗</div>
                                <h3>Riverside & StreamYard</h3>
                                <p>Import recordings from Riverside, StreamYard, Loom, and other recording platforms.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🌐</div>
                                <h3>Multi-Language Support</h3>
                                <p>Works with videos in English, Spanish, French, German, Portuguese, and 20+ more languages.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-features">
                    <div className="platform-features-container">
                        <h2>Perfect For Every Creator</h2>
                        <p className="section-subtitle">
                            Whether you're a YouTuber, podcaster, marketer, or business owner, turn your long content into viral shorts.
                        </p>
                        <div className="platform-features-grid">
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎬</div>
                                <h3>YouTube Creators</h3>
                                <p>Turn your long-form videos into YouTube Shorts. Increase watch time, reach new audiences, and grow your channel faster.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎙️</div>
                                <h3>Podcasters</h3>
                                <p>Repurpose podcast episodes into viral clips. Share the best moments on TikTok, Instagram, and YouTube to drive traffic back to full episodes.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📊</div>
                                <h3>Marketers</h3>
                                <p>Create multiple short-form content pieces from webinars, presentations, and long-form marketing videos. Scale your content output.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🏢</div>
                                <h3>Businesses</h3>
                                <p>Repurpose training videos, company updates, and product demos into engaging social media content. Maximize your content ROI.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">🎓</div>
                                <h3>Educators</h3>
                                <p>Transform long educational videos into bite-sized learning content. Perfect for social media and micro-learning platforms.</p>
                            </div>
                            <div className="platform-feature-card">
                                <div className="feature-icon">📱</div>
                                <h3>Social Media Managers</h3>
                                <p>Create a month's worth of content from one long video. Schedule and publish across all platforms in one workflow.</p>
                            </div>
                        </div>
                    </div>
                </section>

                        <section className="platform-cta">
                            <div className="platform-cta-container">
                                <h2>Turn Your Long Videos Into Viral Shorts Today</h2>
                                <p>One long video, 10 viral clips. Create 10x faster with AI-powered content repurposing.</p>
                                <Link to="/signup" className="cta-button primary large">Start Creating Free</Link>
                            </div>
                        </section>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};
