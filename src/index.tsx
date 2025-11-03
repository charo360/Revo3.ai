import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRouter } from './AppRouter';
import './styles/landing.css';

declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        readonly aistudio: AIStudio;
    }
}

const root = createRoot(document.getElementById('root')!);
root.render(<AppRouter />);
