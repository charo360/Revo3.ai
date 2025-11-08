import React, { FC, useEffect, useState } from 'react';

interface Testimonial {
    quote: string;
    author: string;
    role: string;
    image?: string;
}

export const Testimonials: FC = () => {
    const testimonials: Testimonial[] = [
        {
            quote: "With Revo3.ai, my team ships scroll-stopping thumbnails in minutes. It understands our brand voice and keeps our visuals consistent everywhere.",
            author: "Amina Roberts",
            role: "Creative Director, Culture Co",
            image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=520&q=80"
        },
        {
            quote: "The AI suggestions feel like a companion editor. Revo3.ai turned my YouTube workflow into a repeatable system and boosted my weekly output.",
            author: "Jason Cole",
            role: "YouTube Educator",
            image: "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=520&q=80"
        },
        {
            quote: "Our campaigns stand out again. The platform’s palettes and layout cues give every asset the polish of a full design team.",
            author: "Nia Carter",
            role: "Senior Brand Strategist",
            image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=520&q=80"
        },
        {
            quote: "Short-form content is everything for us. Revo3.ai automates the tedious parts so I can obsess over story instead of software.",
            author: "Malik Thompson",
            role: "Documentary Filmmaker",
            image: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=crop&w=520&q=80"
        },
        {
            quote: "From pitch decks to podcast art, the library of smart presets is unreal. It’s the creative wingwoman my studio didn’t know it needed.",
            author: "Chloe Adeyemi",
            role: "Founder, Adeyemi Studios",
            image: "https://images.unsplash.com/photo-1524503033411-c9566986fc8f?auto=format&fit=crop&w=520&q=80"
        }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const SLIDE_INTERVAL = 7000;

    useEffect(() => {
        if (testimonials.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, SLIDE_INTERVAL);

        return () => clearInterval(timer);
    }, [testimonials.length]);

    const handlePrevious = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? testimonials.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    return (
        <section className="testimonials-section">
            <div className="testimonials-container">
                <h2 className="section-title">Trusted by Creators Worldwide</h2>
                <p className="section-subtitle">
                    Join thousands of creators who use Revo3.ai to create viral content that converts.
                </p>
                <div className="testimonial-slider">
                    <div
                        className="testimonial-track"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {testimonials.map((testimonial, index) => (
                            <article className="testimonial-slide" key={index}>
                                <div className="testimonial-media">
                                    <div className="testimonial-image">
                                        <img
                                            src={testimonial.image}
                                            alt={`${testimonial.author} testimonial`}
                                            loading="lazy"
                                        />
                                        <div className="testimonial-quote-icon">
                                            <svg viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="testimonial-content">
                                    <blockquote>“{testimonial.quote}”</blockquote>
                                    <footer>
                                        <h4>{testimonial.author}</h4>
                                        <span>{testimonial.role}</span>
                                    </footer>
                                </div>
                            </article>
                        ))}
                    </div>
                    <button
                        className="testimonial-nav testimonial-prev"
                        onClick={handlePrevious}
                        aria-label="Previous testimonial"
                    >
                        ‹
                    </button>
                    <button
                        className="testimonial-nav testimonial-next"
                        onClick={handleNext}
                        aria-label="Next testimonial"
                    >
                        ›
                    </button>
                    <div className="testimonial-dots">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                className={`testimonial-dot ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
