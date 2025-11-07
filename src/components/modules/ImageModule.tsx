import React, { FC, useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ImageAsset, Platform, ImagenAspectRatio } from '../../types';
import { Module } from './Module';
import { ICONS } from '../../constants';
import { PLATFORM_CONFIGS } from '../../constants/platforms';
import { isImagenAspectRatio } from '../../constants/aspectRatios';
import { fileToBase64 } from '../../shared/utils/image-utils';

interface ImageModuleProps {
    platform: Platform;
    images: ImageAsset[];
    onImagesChange: (i: ImageAsset[]) => void;
    onGenerateImage: (p: string, np: string, ar: ImagenAspectRatio) => Promise<ImageAsset | null>;
    isGeneratingImage: boolean;
}

export const ImageModule: FC<ImageModuleProps> = ({ images, onImagesChange, onGenerateImage, isGeneratingImage, platform }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [genPrompt, setGenPrompt] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<ImagenAspectRatio>('16:9');

    useEffect(() => {
        const platformAspectRatio = PLATFORM_CONFIGS[platform].aspectRatio;
        if (isImagenAspectRatio(platformAspectRatio)) {
            setAspectRatio(platformAspectRatio);
        }
    }, [platform]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Check file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    toast.error('Image file size must be less than 10MB');
                    return;
                }
                
                const { base64, mimeType } = await fileToBase64(file);
                const newImage = { id: `img_${Date.now()}`, url: URL.createObjectURL(file), base64, mimeType };
                onImagesChange([...images, newImage]);
                toast.success('Image uploaded successfully!');
            } catch (error: any) {
                toast.error(`Failed to upload image: ${error.message || 'Unknown error'}`);
            }
        }
    };

    const handleGenClick = async () => {
        if (!genPrompt || isGeneratingImage) return;
        await onGenerateImage(genPrompt, negativePrompt, aspectRatio);
    };

    return (
        <Module icon={ICONS.IMAGE} title="Images">
            <label className="sub-label">Upload Images (Optional)</label>
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                <p>Drag & drop or <span>click to browse</span></p>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            {images.length > 0 && (
                <div className="image-preview-grid">
                    {images.map(image => (
                        <div key={image.id} className="image-preview-item">
                            <img src={image.url} alt="preview" />
                            <button className="delete-image-btn" onClick={() => onImagesChange(images.filter(i => i.id !== image.id))}>&times;</button>
                        </div>
                    ))}
                </div>
            )}
            <div className="section-divider">OR GENERATE WITH AI</div>
            <div className="form-group">
                <label htmlFor="generate-image-prompt">Describe the image you want</label>
                <textarea id="generate-image-prompt" value={genPrompt} onChange={e => setGenPrompt(e.target.value)} placeholder="e.g., A robot holding a red skateboard" />
            </div>
            <div className="form-group">
                <label htmlFor="negative-prompt">Negative Prompt (what to avoid)</label>
                <input type="text" id="negative-prompt" value={negativePrompt} onChange={e => setNegativePrompt(e.target.value)} placeholder="e.g., text, watermarks, blurry" />
            </div>
            <div className="form-group">
                <label>Aspect Ratio</label>
                <div className="aspect-ratio-group">
                    {(['1:1', '16:9', '9:16', '1.91:1'] as ImagenAspectRatio[]).map(ar => (
                        <button key={ar} className={`aspect-ratio-btn ${aspectRatio === ar ? 'active' : ''}`} onClick={() => setAspectRatio(ar)}>
                            {ar}
                        </button>
                    ))}
                </div>
            </div>
            <button className="generate-image-btn" onClick={handleGenClick} disabled={isGeneratingImage || !genPrompt}>
                {isGeneratingImage ? <div className="spinner"></div> : ICONS.GENERATE}
                {isGeneratingImage ? 'Generating...' : 'Generate Image'}
            </button>
        </Module>
    );
};
