import React, { FC } from 'react';
import { Platform, TextState } from '../../types';
import { Module } from './Module';
import { ICONS, FONT_OPTIONS } from '../../constants';

interface TextContentModuleProps {
    platform: Platform;
    text: TextState;
    onTextChange: React.Dispatch<React.SetStateAction<TextState>>;
}

export const TextContentModule: FC<TextContentModuleProps> = ({ platform, text, onTextChange }) => {
    // TODO: Extract full implementation from index.tsx (lines ~1234-1299)
    return (
        <Module icon={ICONS.TEXT} title="Text Content">
            <div className="form-group">
                <label>Headline</label>
                <input
                    type="text"
                    value={text.headline}
                    onChange={(e) => onTextChange(prev => ({ ...prev, headline: e.target.value }))}
                    placeholder="Enter headline"
                />
            </div>
        </Module>
    );
};
