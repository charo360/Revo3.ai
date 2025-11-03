export const fetchTranscript = async (videoUrl: string): Promise<string | null> => {
    try {
        const transcriptServiceUrl = `https://yt-trans.vercel.app/api/transcript?videoUrl=${encodeURIComponent(videoUrl)}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(transcriptServiceUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) {
            console.warn(`Transcript fetch failed with status: ${response.status}. This can happen if a transcript isn't available.`);
            return null;
        }
        
        const responseText = await response.text();
        try {
            const transcriptData = JSON.parse(responseText);
            if (Array.isArray(transcriptData) && transcriptData.length > 0) {
                return transcriptData.map(item => item.text).join(' ');
            }
            return null;
        } catch (jsonError) {
            console.warn("Failed to parse transcript response as JSON, it may be an HTML error page.", jsonError);
            return null;
        }
    } catch (e) {
        console.error("Error fetching transcript:", e);
        return null;
    }
};
