import React, { FC } from 'react';
import { ICONS } from '../../constants';

interface GenerateButtonProps {
    onGenerate: () => void;
    isGenerating: boolean;
}

export const GenerateButton: FC<GenerateButtonProps> = ({ onGenerate, isGenerating }) => (
    <button className="generate-btn" onClick={onGenerate} disabled={isGenerating}>
        {isGenerating ? <div className="spinner"></div> : ICONS.GENERATE}
        {isGenerating ? 'Generating...' : 'Generate'}
    </button>
);
