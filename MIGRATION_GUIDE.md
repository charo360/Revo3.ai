# Migration Guide: New Architecture

## Overview

This guide helps you update imports and understand the new professional architecture structure.

## Key Changes

### 1. Infrastructure Utilities

**Old Location:** `src/utils/`
**New Location:** `src/core/infrastructure/`

**Files:**
- `rateLimiter.ts` → `core/infrastructure/rate-limiting/rateLimiter.ts`
- `retryHandler.ts` → `core/infrastructure/retry-handlers/retryHandler.ts`
- `requestCache.ts` → `core/infrastructure/caching/requestCache.ts`
- `errorTracker.ts` → `core/infrastructure/error-tracking/errorTracker.ts`
- `performanceMonitor.ts` → `core/infrastructure/performance-monitoring/performanceMonitor.ts`

**Import Updates:**
```typescript
// Old
import { imageGenRateLimiter } from '../../utils/rateLimiter';
import { retryWithBackoff } from '../../utils/retryHandler';
import { requestCache } from '../../utils/requestCache';
import { errorTracker } from '../../utils/errorTracker';
import { performanceMonitor } from '../../utils/performanceMonitor';

// New
import { imageGenRateLimiter } from '@/core/infrastructure/rate-limiting';
import { retryWithBackoff } from '@/core/infrastructure/retry-handlers';
import { requestCache } from '@/core/infrastructure/caching';
import { errorTracker } from '@/core/infrastructure/error-tracking';
import { performanceMonitor } from '@/core/infrastructure/performance-monitoring';
```

### 2. Processors

**Old Location:** `src/utils/` and `src/services/video/`
**New Location:** `src/core/processors/`

**Files:**
- `imageOptimizer.ts` → `core/processors/image/imageProcessor.ts`
- `videoProcessor.ts` → `core/processors/video/videoProcessor.ts`

**Import Updates:**
```typescript
// Old
import { optimizeImageForAI } from '../../utils/imageOptimizer';
import { processVideoClip } from '../../services/video/videoProcessor';

// New
import { optimizeImageForAI } from '@/core/processors/image';
import { processVideoClip } from '@/core/processors/video';
```

### 3. ML Algorithms

**Old Location:** `src/services/ml/`
**New Location:** `src/core/algorithms/content-analysis/`

**Files:**
- `viralMomentDetector.ts` → `core/algorithms/content-analysis/viral-detection/viralMomentDetector.ts`

**Import Updates:**
```typescript
// Old
import { analyzeVideoForViralMoments } from '../../services/ml/viralMomentDetector';

// New
import { analyzeVideoForViralMoments } from '@/core/algorithms/content-analysis/viral-detection';
```

### 4. AI Services

**Old Location:** `src/services/ai/`
**New Location:** `src/core/services/ai-providers/gemini/adapters/`

**Files:**
- `designService.ts` → `core/services/ai-providers/gemini/adapters/designService.ts`
- `imageService.ts` → `core/services/ai-providers/gemini/adapters/imageService.ts`
- `analysisService.ts` → `core/services/ai-providers/gemini/adapters/analysisService.ts`
- `assistantService.ts` → `core/services/ai-providers/gemini/adapters/assistantService.ts`

**Import Updates:**
```typescript
// Old
import { generateDesign, generateImage } from './services/ai';

// New
import { generateDesign, generateImage } from './core/services/ai-providers/gemini';
```

### 5. Shared Utilities

**Old Location:** `src/utils/`
**New Location:** `src/shared/utils/`

**Files:**
- `imageUtils.ts` → `shared/utils/image-utils.ts`
- `videoUtils.ts` → `shared/utils/video-utils.ts`
- `youtubeUtils.ts` → `shared/utils/youtube-utils.ts`
- `storageUtils.ts` → `shared/utils/storage-utils.ts`

**Import Updates:**
```typescript
// Old
import { extractFramesFromVideo } from '../../utils/videoUtils';
import { fetchTranscript } from '../../utils/youtubeUtils';
import { loadPreferences } from '../../utils/storageUtils';

// New
import { extractFramesFromVideo } from '@/shared/utils/video-utils';
import { fetchTranscript } from '@/shared/utils/youtube-utils';
import { loadPreferences } from '@/shared/utils/storage-utils';
```

### 6. Features

**Old Location:** `src/services/repurpose/` and `src/components/repurpose/`
**New Location:** `src/features/content-repurpose/`

**Files:**
- `repurposeService.ts` → `features/content-repurpose/services/repurposeService.ts`
- `repurposeDatabase.ts` → `features/content-repurpose/services/repurposeDatabase.ts`
- `RepurposeModule.tsx` → `features/content-repurpose/components/RepurposeModule.tsx`

**Import Updates:**
```typescript
// Old
import { repurposeVideo } from '../../services/repurpose/repurposeService';
import { RepurposeModule } from '../../components/repurpose/RepurposeModule';

// New
import { repurposeVideo } from '@/features/content-repurpose/services/repurposeService';
import { RepurposeModule } from '@/features/content-repurpose/components/RepurposeModule';
```

## Path Aliases (Recommended)

To simplify imports, configure path aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/core/*": ["./src/core/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

And in `vite.config.ts`:

```typescript
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/core': resolve(__dirname, './src/core'),
      '@/features': resolve(__dirname, './src/features'),
      '@/shared': resolve(__dirname, './src/shared'),
    },
  },
});
```

## Migration Steps

1. **Update Infrastructure Imports**
   - Search for `from.*utils/(rateLimiter|retryHandler|requestCache|errorTracker|performanceMonitor)`
   - Replace with new paths from `core/infrastructure/`

2. **Update Processor Imports**
   - Search for `from.*utils/imageOptimizer` and `from.*services/video`
   - Replace with new paths from `core/processors/`

3. **Update ML Algorithm Imports**
   - Search for `from.*services/ml`
   - Replace with new paths from `core/algorithms/`

4. **Update AI Service Imports**
   - Search for `from.*services/ai`
   - Replace with new paths from `core/services/ai-providers/gemini`

5. **Update Shared Utility Imports**
   - Search for `from.*utils/(imageUtils|videoUtils|youtubeUtils|storageUtils)`
   - Replace with new paths from `shared/utils/`

6. **Update Feature Imports**
   - Search for `from.*services/repurpose` and `from.*components/repurpose`
   - Replace with new paths from `features/content-repurpose/`

## Files Still Using Old Imports

The following files may still need import updates:

- `src/index.tsx`
- `src/AppRouter.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/components/modules/*.tsx` (if they use old imports)
- Any other files that import from the old locations

## Testing

After migration:

1. Run `npm run build` to check for import errors
2. Run `npm run dev` and test all features
3. Check browser console for runtime errors
4. Verify all ML algorithms and features work correctly

## Benefits

- **Better Organization**: Clear separation of concerns
- **Scalability**: Easy to add new ML algorithms and features
- **Maintainability**: Professional structure makes code easier to understand
- **Reusability**: Core infrastructure can be reused across features
- **Type Safety**: Full TypeScript support with proper path resolution

