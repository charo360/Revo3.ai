import React, { FC } from 'react';
import { ImageAsset, Platform, ImagenAspectRatio } from '../../types';
import { Module } from './Module';
import { ICONS } from '../../constants';

interface ImageModuleProps {
    platform: Platform;
    images: ImageAsset[];
    onImagesChange: (i: ImageAsset[]) => void;
    onGenerateImage: (p: string, np: string, ar: ImagenAspectRatio) => Promise<ImageAsset | null>;
    isGeneratingImage: boolean;
}

export const ImageModule: FC<ImageModuleProps> = (props) => {
    // TODO: Extract full implementation from index.tsx (lines ~1157-1233)
    return (
        <Module icon={ICONS.IMAGE} title="Images">
            <p>ImageModule - extract full implementation from index.tsx</p>
        </Module>
    );
};
