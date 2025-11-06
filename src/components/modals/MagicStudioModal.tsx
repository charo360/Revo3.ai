import React, { FC, useState, useRef, useEffect } from 'react';
import { ImageAsset } from '../../types';
import { ICONS } from '../../constants/icons';

interface MagicStudioModalProps {
    image: ImageAsset;
    onConfirm: (original: ImageAsset, prompt: string, mask: ImageAsset | null) => void;
    onCancel: () => void;
}

export const MagicStudioModal: FC<MagicStudioModalProps> = ({ image, onConfirm, onCancel }) => {
    const [prompt, setPrompt] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [brushSize, setBrushSize] = useState(30);
    const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const isDrawing = useRef(false);

    // History for undo/redo
    const history = useRef<ImageData[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const getCanvasContext = () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.getContext('2d', { willReadFrequently: true }) : null;
    };

    // Initialize canvas when image loads
    useEffect(() => {
        const imageEl = imageRef.current;
        const canvasEl = canvasRef.current;
        if (!imageEl || !canvasEl) return;

        const handleImageLoad = () => {
            const ctx = getCanvasContext();
            if (!ctx) return;
            // Match canvas dimensions to the actual image dimensions
            canvasEl.width = imageEl.naturalWidth;
            canvasEl.height = imageEl.naturalHeight;
            ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            // Save initial state for undo
            history.current = [ctx.getImageData(0, 0, canvasEl.width, canvasEl.height)];
            setHistoryIndex(0);
        };

        // If image is already cached and loaded
        if (imageEl.complete) {
            handleImageLoad();
        } else {
            imageEl.addEventListener('load', handleImageLoad);
        }

        return () => {
            imageEl.removeEventListener('load', handleImageLoad);
        };
    }, [image]);

    const saveHistory = () => {
        const ctx = getCanvasContext();
        if (!ctx) return;
        const currentHistory = history.current.slice(0, historyIndex + 1);
        currentHistory.push(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
        history.current = currentHistory;
        setHistoryIndex(currentHistory.length - 1);
    };
   
    const restoreHistory = (index: number) => {
        const ctx = getCanvasContext();
        if (!ctx || !history.current[index]) return;
        ctx.putImageData(history.current[index], 0, 0);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            restoreHistory(newIndex);
        }
    };
   
    const handleRedo = () => {
        if (historyIndex < history.current.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            restoreHistory(newIndex);
        }
    };

    const getMousePos = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const startDrawing = (e: React.MouseEvent) => {
        const ctx = getCanvasContext();
        if (!ctx) return;
        isDrawing.current = true;
        const pos = getMousePos(e);

        ctx.beginPath();
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
       
        if (tool === 'brush') {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = 'rgba(255, 0, 150, 0.7)'; // Visible pink color for mask
        } else { // eraser
            ctx.globalCompositeOperation = 'destination-out';
        }
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x, pos.y); // Draw a dot on click
        ctx.stroke();
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing.current) return;
        const ctx = getCanvasContext();
        if (!ctx) return;
        const pos = getMousePos(e);
       
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing.current) return;
        const ctx = getCanvasContext();
        if (!ctx) return;
        isDrawing.current = false;
        ctx.closePath();
        saveHistory();
    };

    const handleConfirm = async () => {
        setIsProcessing(true);
        const canvas = canvasRef.current;
        const ctx = getCanvasContext();
        if (!canvas || !ctx) {
            setIsProcessing(false);
            return;
        }

        const isMaskDrawn = historyIndex > 0;
        let maskAsset: ImageAsset | null = null;
       
        if (isMaskDrawn) {
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = canvas.width;
            maskCanvas.height = canvas.height;
            const maskCtx = maskCanvas.getContext('2d');
            if(maskCtx) {
                const originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const maskImageData = maskCtx.createImageData(canvas.width, canvas.height);
               
                for (let i = 0; i < originalImageData.data.length; i += 4) {
                    const alpha = originalImageData.data[i + 3];
                    if (alpha > 0) { // Pixel was drawn on (area to edit)
                        maskImageData.data[i] = 255;     // R (White)
                        maskImageData.data[i + 1] = 255; // G
                        maskImageData.data[i + 2] = 255; // B
                        maskImageData.data[i + 3] = 255; // A
                    } else { // Pixel was not touched (area to keep)
                        maskImageData.data[i] = 0;       // R (Black)
                        maskImageData.data[i + 1] = 0;   // G
                        maskImageData.data[i + 2] = 0;   // B
                        maskImageData.data[i + 3] = 255; // A
                    }
                }
                maskCtx.putImageData(maskImageData, 0, 0);

                const maskDataUrl = maskCanvas.toDataURL('image/png');
                maskAsset = {
                    id: `mask_${Date.now()}`,
                    url: maskDataUrl,
                    base64: maskDataUrl.split(',')[1],
                    mimeType: 'image/png'
                };
            }
        }

        await onConfirm(image, prompt, maskAsset);
        // Do not set isProcessing to false here, as the parent component will handle the visual state.
    };
   
    const isUndoable = historyIndex > 0;
    const isRedoable = historyIndex < history.current.length - 1;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="magic-studio-modal" onClick={e => e.stopPropagation()}>
                <div className="magic-studio-header">
                    <h3>AI Edit</h3>
                    <button className="modal-close-btn" onClick={onCancel} aria-label="Close">&times;</button>
                </div>
                <div className="magic-studio-content">
                    <div className="magic-studio-toolbar">
                        <button
                            title="Brush"
                            className={`tool-btn ${tool === 'brush' ? 'active' : ''}`}
                            onClick={() => setTool('brush')}
                        >
                            {ICONS.BRUSH}
                            <span>Brush</span>
                        </button>
                        <button
                            title="Erase"
                            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                            onClick={() => setTool('eraser')}
                        >
                            {ICONS.ERASER}
                            <span>Erase</span>
                        </button>
                    </div>
                    <div className="magic-studio-canvas-area">
                        <div className="magic-studio-canvas-wrapper">
                            <img ref={imageRef} src={image.url} alt="Editing canvas" className="magic-studio-image" draggable="false" />
                            <canvas
                                ref={canvasRef}
                                className="magic-studio-canvas"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                        </div>
                    </div>
                </div>
                <div className="magic-studio-footer">
                    <div className="footer-controls-left">
                        <div className="brush-controls">
                            <label>Size:</label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={brushSize}
                                onChange={e => setBrushSize(parseInt(e.target.value, 10))}
                            />
                            <span>{brushSize}</span>
                        </div>
                        <button
                            className="tool-btn"
                            title="Undo"
                            onClick={handleUndo}
                            disabled={!isUndoable}
                        >
                            {ICONS.UNDO}
                            <span>Undo</span>
                        </button>
                        <button
                            className="tool-btn"
                            title="Redo"
                            onClick={handleRedo}
                            disabled={!isRedoable}
                        >
                            {ICONS.REDO}
                            <span>Redo</span>
                        </button>
                    </div>
                    <div className="prompt-input-wrapper">
                        <input
                            type="text"
                            className="prompt-input"
                            placeholder="Describe your edit... e.g., 'add a birthday hat'"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                    <div className="footer-controls-right">
                        <button
                            className="modal-btn-secondary"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                        <button
                            className="modal-btn-primary"
                            onClick={handleConfirm}
                            disabled={isProcessing || !prompt}
                        >
                            {isProcessing ? (
                                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                            ) : null}
                            <span>Apply</span>
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};
