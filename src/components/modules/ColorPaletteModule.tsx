import React, { FC } from 'react';
import { ColorsState } from '../../types';
import { Module } from './Module';
import { ICONS } from '../../constants';

interface ColorPaletteModuleProps {
    colors: ColorsState;
    onColorsChange: (c: ColorsState) => void;
}

export const ColorPaletteModule: FC<ColorPaletteModuleProps> = ({ colors, onColorsChange }) => {
    // TODO: Extract full implementation from index.tsx (lines ~1354-1372)
    return (
        <Module icon={ICONS.COLOR} title="Color Palette">
            <div className="color-palette">
                <div className="color-input-group">
                    <label>Primary</label>
                    <input type="color" value={colors.primary} onChange={(e) => onColorsChange({ ...colors, primary: e.target.value })} />
                </div>
                <div className="color-input-group">
                    <label>Secondary</label>
                    <input type="color" value={colors.secondary} onChange={(e) => onColorsChange({ ...colors, secondary: e.target.value })} />
                </div>
            </div>
        </Module>
    );
};
