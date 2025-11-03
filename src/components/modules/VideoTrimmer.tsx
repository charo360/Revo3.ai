import React, { FC } from 'react';

interface VideoTrimmerProps {
    videoUrl: string;
    onVideoLoad: (duration: number) => void;
    trimTimes: { start: number; end: number };
    onTrimTimesChange: (t: { start: number; end: number }) => void;
}

export const VideoTrimmer: FC<VideoTrimmerProps> = (props) => {
    // TODO: Extract full implementation from index.tsx (lines ~1405-1543)
    return <div className="trimmer-container">VideoTrimmer - extract from index.tsx</div>;
};
