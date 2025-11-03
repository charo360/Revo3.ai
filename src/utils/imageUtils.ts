export const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            resolve({ base64: result.split(',')[1], mimeType: file.type });
        };
        reader.onerror = error => reject(error);
    });
};

export const imageUrlToBase64 = async (url: string): Promise<{ base64: string, mimeType: string }> => {
    // Use a CORS proxy to fetch the image data to avoid tainted canvas issues
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve({ base64: result.split(',')[1], mimeType: blob.type });
        };
        reader.onerror = reject;
    });
};
