import { ImagenAspectRatio } from '../types';

export const VALID_IMAGEN_ASPECT_RATIOS: ImagenAspectRatio[] = ["16:9", "1.91:1", "9:16", "1:1", "4:3", "3:4"];

export function isImagenAspectRatio(value: string): value is ImagenAspectRatio {
    return (VALID_IMAGEN_ASPECT_RATIOS as string[]).includes(value);
}
