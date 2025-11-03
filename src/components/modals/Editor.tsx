import React, { FC } from 'react';
import { EditorState, ImageAsset } from '../../types';

interface EditorProps {
    initialState: EditorState;
    onClose: () => void;
    assets: ImageAsset[];
}

export const Editor: FC<EditorProps> = ({ initialState, onClose, assets }) => {
    // TODO: Extract full implementation from index.tsx (lines ~1879-2272)
    return (
        <div className="editor-overlay">
            <div className="editor-header">
                <div className="editor-title">Editor</div>
                <div className="editor-actions">
                    <button className="modal-btn-secondary" onClick={onClose}>Close</button>
                </div>
            </div>
            <div className="editor-main">
                <p>Editor implementation - extract from index.tsx</p>
            </div>
        </div>
    );
};
