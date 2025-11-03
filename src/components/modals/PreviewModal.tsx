import React, { FC } from 'react';
import { ImageAsset } from '../../types';

interface PreviewModalProps {
    image: ImageAsset;
    onCancel: () => void;
}

export const PreviewModal: FC<PreviewModalProps> = ({ image, onCancel }) => {
    // TODO: Extract full implementation from index.tsx (lines ~1797-1823)
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
                <div className="preview-modal-header">
                    <h3>Preview</h3>
                    <button className="modal-close-btn" onClick={onCancel}>&times;</button>
                </div>
                <div className="preview-modal-content">
                    <img src={image.url} alt="Preview" />
                </div>
            </div>
        </div>
    );
};
