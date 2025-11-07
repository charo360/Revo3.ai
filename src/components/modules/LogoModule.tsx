import React, { FC, useRef } from 'react';
import { toast } from 'react-toastify';
import { LogoState } from '../../types';
import { Module } from './Module';
import { ICONS } from '../../constants';
import { fileToBase64 } from '../../shared/utils/image-utils';

interface LogoModuleProps {
    logo: LogoState;
    onLogoChange: (l: LogoState) => void;
}

export const LogoModule: FC<LogoModuleProps> = ({ logo, onLogoChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                // Check file size (max 5MB for logos)
                if (file.size > 5 * 1024 * 1024) {
                    toast.error('Logo file size must be less than 5MB');
                    return;
                }
                
                const { base64, mimeType } = await fileToBase64(file);
                onLogoChange({ ...logo, url: URL.createObjectURL(file), base64, mimeType });
                toast.success('Logo uploaded successfully!');
            } catch (error: any) {
                toast.error(`Failed to upload logo: ${error.message || 'Unknown error'}`);
            }
        }
    };
    
    const handleRemoveLogo = () => {
        onLogoChange({ ...logo, url: null, base64: null, mimeType: null });
    };

    // TODO: Extract full implementation from index.tsx (lines ~1300-1353)
    return (
        <Module icon={ICONS.LOGO} title="Brand Logo">
            {logo.url ? (
                <div className="logo-preview-wrapper">
                    <img className="logo-preview" src={logo.url} alt="Logo preview" style={{ opacity: logo.opacity }} />
                    <button className="delete-image-btn" onClick={handleRemoveLogo}>&times;</button>
                </div>
            ) : (
                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                    <p><span>Click to upload</span> logo</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                </div>
            )}
        </Module>
    );
};
