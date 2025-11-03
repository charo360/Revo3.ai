import React, { FC, useState, useRef, useEffect } from 'react';
import { DesignResult, Platform, ImageAsset } from '../../types';
import { ICONS, PLATFORM_CONFIGS, PLATFORM_ORDER } from '../../constants';

interface DesignCardProps {
    design: DesignResult;
    platform: Platform;
    onEdit: (result: DesignResult) => void;
    onAiEdit: (image: ImageAsset) => void;
    onUpscale: (image: ImageAsset) => void;
    onDownload: (image: ImageAsset) => void;
    onPreview: (image: ImageAsset) => void;
    onAdapt: (image: ImageAsset, platform: Platform) => void;
}

export const DesignCard: FC<DesignCardProps> = ({ 
    design, 
    platform, 
    onEdit, 
    onAiEdit, 
    onUpscale, 
    onDownload, 
    onPreview, 
    onAdapt 
}) => {
    const [isAdaptMenuOpen, setIsAdaptMenuOpen] = useState(false);
    const adaptButtonRef = useRef<HTMLDivElement>(null);
    
    const handleEdit = () => onEdit(design);
    const handleAiEdit = () => design.image && onAiEdit(design.image);
    const handleUpscale = () => design.image && onUpscale(design.image);
    const handleDownload = () => design.image && onDownload(design.image);
    const handlePreview = () => design.image && onPreview(design.image);
    
    const handleAdaptSelect = (targetPlatform: Platform) => {
        if (design.image) {
            onAdapt(design.image, targetPlatform);
            setIsAdaptMenuOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (adaptButtonRef.current && !adaptButtonRef.current.contains(event.target as Node)) {
                setIsAdaptMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="design-card">
            {design.image && (
                 <div className="design-card-actions">
                    <button className="card-action-btn" title="Download" onClick={handleDownload}>
                        {ICONS.DOWNLOAD}
                    </button>
                    <button className="card-action-btn" title="Preview" onClick={handlePreview}>
                        {ICONS.GENERATE}
                    </button>
                    <button className="card-action-btn" title="AI Edit" onClick={handleAiEdit}>
                        {ICONS.BRUSH}
                    </button>
                    <button className="card-action-btn" title="Open Editor" onClick={handleEdit}>
                        {ICONS.EDIT}
                    </button>
                    <button className="card-action-btn" title="Upscale" onClick={handleUpscale}>
                        {ICONS.UPSCALE}
                    </button>
                    <div className="adapt-btn-container" ref={adaptButtonRef}>
                         <button className="card-action-btn" title="Adapt for..." onClick={() => setIsAdaptMenuOpen(prev => !prev)}>
                            {ICONS.ADAPT}
                        </button>
                        {isAdaptMenuOpen && (
                             <div className="adapt-popover">
                                {PLATFORM_ORDER
                                    .filter(key => key !== platform && key !== 'youtube_improve')
                                    .map(key => (
                                    <button
                                        key={key}
                                        className="adapt-popover-option"
                                        onClick={() => handleAdaptSelect(key)}
                                    >
                                        {PLATFORM_CONFIGS[key].icon}
                                        <span>{PLATFORM_CONFIGS[key].title}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div className="design-card-image-wrapper">
                {design.image && (
                    <img className="design-card-image" src={design.image.url} alt={design.description} />
                )}
            </div>
            {design.description && <p className="design-card-description">{design.description}</p>}
             {(design.isEditing || design.isUpscaling) && (
                <div className="card-overlay">
                    <div className="spinner"></div>
                    <p>{design.isEditing ? 'AI Editing...' : 'Upscaling...'}</p>
                </div>
            )}
        </div>
    );
};
