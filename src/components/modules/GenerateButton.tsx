import React, { FC } from 'react';
import { ICONS } from '../../constants';

interface GenerateButtonProps {
    onGenerate: () => void;
    isGenerating: boolean;
}

export const GenerateButton: FC<GenerateButtonProps> = ({ onGenerate, isGenerating }) => {
    const handleClick = () => {
        console.log('[GenerateButton] Button clicked', { isGenerating });
        if (!isGenerating) {
            onGenerate();
        } else {
            console.log('[GenerateButton] Ignoring click - already generating');
        }
    };

    return (
        <button 
            className="generate-btn" 
            onClick={handleClick} 
            disabled={isGenerating}
            type="button"
        >
            {isGenerating ? <div className="spinner"></div> : ICONS.GENERATE}
            {isGenerating ? 'Generating...' : 'Generate'}
        </button>
    );
};
