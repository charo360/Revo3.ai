import React, { FC, useState } from 'react';
import { AssistantMessage } from '../../types';
import { ICONS } from '../../constants';

interface AssistantPanelProps {
    messages: AssistantMessage[];
    isProcessing: boolean;
    onSubmit: (message: string) => void;
    onClose: () => void;
}

export const AssistantPanel: FC<AssistantPanelProps> = ({ messages, isProcessing, onSubmit, onClose }) => {
    const [input, setInput] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isProcessing) {
            onSubmit(input);
            setInput('');
        }
    };

    // TODO: Extract full implementation from index.tsx (lines ~1824-1878)
    return (
        <div className="assistant-panel">
            <div className="assistant-header">
                <h3>AI Assistant</h3>
                <button onClick={onClose}>&times;</button>
            </div>
            <div className="assistant-messages">
                {messages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                        <p>{msg.text}</p>
                    </div>
                ))}
                {isProcessing && (
                    <div className="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                )}
            </div>
            <form className="assistant-input-form" onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={isProcessing}
                />
                <button type="submit" disabled={isProcessing || !input.trim()}>
                    {ICONS.GENERATE}
                </button>
            </form>
        </div>
    );
};
