import React, { FC } from 'react';
import { DesignResult, Platform, ImageAsset } from '../../types';
import { DesignCard } from './DesignCard';

interface DesignResultsProps {
    results: DesignResult[];
    platform: Platform;
    onEdit: (result: DesignResult) => void;
    onAiEdit: (image: ImageAsset) => void;
    onUpscale: (image: ImageAsset) => void;
    onDownload: (image: ImageAsset) => void;
    onPreview: (image: ImageAsset) => void;
    onAdapt: (image: ImageAsset, platform: Platform) => void;
}

export const DesignResults: FC<DesignResultsProps> = ({ 
    results, 
    platform, 
    onEdit, 
    onAiEdit, 
    onUpscale, 
    onDownload, 
    onPreview, 
    onAdapt 
}) => (
    <div className="design-results-grid">
        {results.map((design, index) => (
            <DesignCard 
                key={design.image?.id || index} 
                design={design} 
                platform={platform} 
                onEdit={onEdit} 
                onAiEdit={onAiEdit} 
                onUpscale={onUpscale} 
                onDownload={onDownload} 
                onPreview={onPreview} 
                onAdapt={onAdapt} 
            />
        ))}
    </div>
);
