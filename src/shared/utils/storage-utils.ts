import { ColorsState, PreferencesState, EditorState } from '../types';

const PREFS_KEY = 'ai-design-studio-prefs';
const EDITOR_KEY = 'ai-design-studio-editor-autosave';

export const loadPreferences = (): { colors: ColorsState; preferences: PreferencesState } => {
    try {
        const saved = localStorage.getItem(PREFS_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                colors: parsed.colors || { primary: '#FF0000', secondary: '#FFFF00', accent: '#00FFFF', background: '#000000' },
                preferences: parsed.preferences || { style: 'Bold & Eye-Catching', variations: 3, drama: 5 }
            };
        }
    } catch (e) {
        console.error("Failed to load preferences:", e);
    }
    return {
        colors: { primary: '#FF0000', secondary: '#FFFF00', accent: '#00FFFF', background: '#000000' },
        preferences: { style: 'Bold & Eye-Catching', variations: 3, drama: 5 }
    };
};

export const savePreferences = (colors: ColorsState, preferences: PreferencesState): void => {
    try {
        const settings = { colors, preferences };
        localStorage.setItem(PREFS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save preferences:", e);
    }
};

export const loadEditorState = (): EditorState | null => {
    try {
        const saved = localStorage.getItem(EDITOR_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load editor state:", e);
        localStorage.removeItem(EDITOR_KEY);
    }
    return null;
};

export const saveEditorState = (state: EditorState): void => {
    try {
        localStorage.setItem(EDITOR_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save editor state:", e);
    }
};

export const clearEditorState = (): void => {
    localStorage.removeItem(EDITOR_KEY);
};
