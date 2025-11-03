import React, { FC } from 'react';
import { PreferencesState } from '../../types';
import { Module } from './Module';
import { ICONS, VIBE_STYLES } from '../../constants';

interface DesignPreferencesModuleProps {
    preferences: PreferencesState;
    onPreferencesChange: (p: PreferencesState) => void;
}

export const DesignPreferencesModule: FC<DesignPreferencesModuleProps> = ({ preferences, onPreferencesChange }) => {
    // TODO: Extract full implementation from index.tsx (lines ~1373-1397)
    return (
        <Module icon={ICONS.PREFERENCES} title="Design Preferences">
            <div className="form-group">
                <label>Style</label>
                <select value={preferences.style} onChange={(e) => onPreferencesChange({ ...preferences, style: e.target.value })}>
                    {VIBE_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
                </select>
            </div>
        </Module>
    );
};
