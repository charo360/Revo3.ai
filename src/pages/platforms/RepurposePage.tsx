import React, { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/landing/Navbar';
import { Footer } from '../../components/landing/Footer';
import { useAuth } from '../../contexts/AuthContext';

export const RepurposePage: FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="landing-page">
            <Navbar />
            <div className="platform-page-content">
                <section className="platform-hero">
                    <div className="platform-hero-container">
                        <div className="platform-badge">Content Repurpose</div>
                        <h1>Turn Long Videos Into Viral Campaigns</h1>
                        <p>Find the best hooks, style them for every platform, and publish from one studio workspace.</p>
                        <div className="platform-hero-actions">
                            {user ? (
                                <button
                                    type="button"
                                    className="cta-button primary"
                                    onClick={() => navigate('/dashboard?view=repurpose')}
                                >
                                    Open in Studio
                                </button>
                            ) : (
                                <>
                                    <Link to="/signup" className="cta-button primary">Start Repurposing Free</Link>
                                    <button
                                        type="button"
                                        className="cta-button secondary"
                                        onClick={() => navigate('/login')}
                                    >
                                        Have access? Sign in
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                <section className="repurpose-benefits">
                    <div className="repurpose-benefits-container">
                        <h2>Built for High-Volume Short-Form Teams</h2>
                        <p className="section-subtitle">
                            Repurpose lives inside Revo Studio, so your brand controls, assets, and team workflows never leave the same workspace.
                        </p>
                        <div className="repurpose-benefit-columns">
                            <div className="repurpose-benefit-column">
                                <div className="repurpose-benefit-header">
                                    <h3>Automated Production</h3>
                                    <p>Let AI handle the heavy lifting while your editors focus on finishing touches.</p>
                                </div>
                                <ul>
                                    <li>🎬 AI highlight detection maps emotional peaks and quotable soundbites automatically.</li>
                                    <li>🎞️ Instant format switching outputs 9:16, 1:1, and 16:9 clips with motion captions applied.</li>
                                    <li>🧠 Hook, caption, and CTA suggestions tuned for each platform’s algorithms.</li>
                                </ul>
                            </div>
                            <div className="repurpose-benefit-column">
                                <div className="repurpose-benefit-header">
                                    <h3>Team-Ready Workflow</h3>
                                    <p>Keep every collaborator aligned without exporting timelines or passing around files.</p>
                                </div>
                                <ul>
                                    <li>👥 Review, approve, and comment together inside the project timeline—no downloads needed.</li>
                                    <li>📈 Performance insights loop back to future clips so every drop gets smarter.</li>
                                    <li>🔒 Role-based permissions, SSO, and audit logs keep security teams confident.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="platform-how-it-works">
                    <div className="platform-how-it-works-container">
                        <h2>Create Viral Shorts in Four Steps</h2>
                        <div className="platform-steps">
                            <div className="platform-step">
                                <div className="step-number">1</div>
                                <h3>Drop in Your Source</h3>
                                <p>Upload a file or paste a link from YouTube, Zoom, Riverside, Drive, and more. Repurpose maps the highlights automatically.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">2</div>
                                <h3>Pick the Moments</h3>
                                <p>Review AI-suggested clips, adjust timecodes, and select the hooks you want to keep with one-click approvals.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">3</div>
                                <h3>Style With Brand Presets</h3>
                                <p>Apply typography, colors, and overlay templates your studio already uses. Motion captions and reframing are handled for you.</p>
                            </div>
                            <div className="platform-step">
                                <div className="step-number">4</div>
                                <h3>Publish Everywhere</h3>
                                <p>Send clips to your content calendar, export for clients, or schedule posts directly—without leaving the studio.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="repurpose-usecases">
                    <div className="repurpose-usecases-container">
                        <h2>Purpose-Built for Every Long-Form Source</h2>
                        <div className="repurpose-usecase-grid">
                            <div>
                                <h3>🎙️ Podcasts & Interviews</h3>
                                <p>Surface the best exchanges, add motion captions, and promote full episodes with social teasers.</p>
                            </div>
                            <div>
                                <h3>🏢 Webinars & Keynotes</h3>
                                <p>Turn live sessions into nurture sequences, recap reels, and short-form CTA clips in hours.</p>
                            </div>
                            <div>
                                <h3>🎓 Courses & Tutorials</h3>
                                <p>Deliver bite-sized lessons, module previews, and community highlights straight from your curriculum.</p>
                            </div>
                            <div>
                                <h3>📊 Product Demos</h3>
                                <p>Highlight value moments, testimonials, and feature walkthroughs without reopening an editor.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="repurpose-testimonials">
                    <div className="repurpose-testimonials-container">
                        <h2>Why Teams Choose Revo Repurpose</h2>
                        <ul>
                            <li>
                                <blockquote>
                                    “We turned one 45-minute webinar into a month of short-form content in an afternoon. Everything stays tied to the campaign.”
                                </blockquote>
                                <cite>Growth Producer, SaaS</cite>
                            </li>
                            <li>
                                <blockquote>
                                    “Localization is finally painless—captions, hooks, and exports for every region without touching an external editor.”
                                </blockquote>
                                <cite>Creative Lead, Media Network</cite>
                            </li>
                            <li>
                                <blockquote>
                                    “Approvals live in one place. Clients leave timestamped notes, we ship updates in minutes, and nothing slips through email.”
                                </blockquote>
                                <cite>Agency Partner</cite>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="platform-cta">
                    <div className="platform-cta-container">
                        <h2>Bring Repurpose Into Your Studio Workflow</h2>
                        <p>Scale short-form campaigns without leaving the dashboard your team already uses.</p>
                        {user ? (
                            <button
                                type="button"
                                className="cta-button primary large"
                                onClick={() => navigate('/dashboard?view=repurpose')}
                            >
                                Open Repurpose
                            </button>
                        ) : (
                            <Link to="/signup" className="cta-button primary large">Start Repurposing Free</Link>
                        )}
                    </div>
                </section>
            </div>
            <Footer />
        </div>
    );
};


