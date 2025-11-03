import React, { FC, useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

export const FAQ: FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs: FAQItem[] = [
        {
            question: "What platforms does Revo3.ai support?",
            answer: "Revo3.ai supports YouTube (thumbnail improvement and generation), Podcast covers, TikTok/Social media verticals, Twitter cards, and content repurposing across multiple platforms. Each design is optimized for its specific platform format."
        },
        {
            question: "Do I need design skills to use Revo3.ai?",
            answer: "Not at all! Revo3.ai is built for creators of all skill levels. Simply describe what you want, or use our AI assistant to help guide you. The AI handles all the design work, from composition to color selection."
        },
        {
            question: "Can I edit the generated designs?",
            answer: "Yes! Every generated design opens in our full-featured editor where you can adjust text, colors, positions, add elements, and more. You can also use our AI Magic Studio to make further AI-powered edits."
        },
        {
            question: "How many designs can I create per month?",
            answer: "This depends on your plan. Starter plans include 50 designs/month, Pro plans include 200/month, and Enterprise plans have unlimited designs. Check our pricing page for detailed plan information."
        },
        {
            question: "Can I use generated designs commercially?",
            answer: "Yes! All designs generated with Revo3.ai are yours to use for commercial purposes. There are no watermarks, and you have full rights to the designs you create."
        },
        {
            question: "What file formats are supported?",
            answer: "You can export designs in PNG format at various resolutions. High-resolution exports are available for Pro and Enterprise plans. All designs are optimized for web and print use."
        },
        {
            question: "Is there a free trial?",
            answer: "Yes! You can start creating for free. Our free tier includes limited designs so you can try all features before committing to a paid plan."
        },
        {
            question: "How does the AI understand what makes a design good?",
            answer: "Our AI is trained on millions of successful designs across all platforms. It understands platform-specific requirements, color theory, composition, typography, and what drives engagement on each platform."
        }
    ];

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="faq-section">
            <div className="faq-container">
                <h2 className="section-title">Frequently Asked Questions</h2>
                <p className="section-subtitle">
                    Everything you need to know about Revo3.ai
                </p>
                <div className="faq-list">
                    {faqs.map((faq, index) => (
                        <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
                            <button 
                                className="faq-question"
                                onClick={() => toggleFAQ(index)}
                                aria-expanded={openIndex === index}
                            >
                                <span>{faq.question}</span>
                                <svg 
                                    className={`faq-icon ${openIndex === index ? 'open' : ''}`}
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {openIndex === index && (
                                <div className="faq-answer">
                                    <p>{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="faq-cta">
                    <p>Still have questions? We're here to help.</p>
                    <a href="/contact" className="cta-button secondary">Contact Support</a>
                </div>
            </div>
        </section>
    );
};
