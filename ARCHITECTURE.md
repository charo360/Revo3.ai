# Frontend Architecture

## Overview

This document describes the professional, scalable frontend architecture designed to support multiple machine learning algorithms and features.

## Directory Structure

```
src/
├── core/                           # Core business logic & infrastructure
│   ├── algorithms/                 # ML algorithms (domain-specific)
│   │   ├── content-analysis/       # Content analysis algorithms
│   │   │   └── viral-detection/    # Viral moment detection
│   │   ├── media-processing/       # Media processing algorithms (future)
│   │   └── engagement-prediction/  # Engagement prediction (future)
│   ├── processors/                 # Data processors
│   │   ├── video/                  # Video processing (FFmpeg)
│   │   ├── audio/                  # Audio processing (future)
│   │   └── image/                  # Image processing & optimization
│   ├── services/                   # External service integrations
│   │   ├── ai-providers/           # AI service providers
│   │   │   └── gemini/             # Google Gemini integration
│   │   │       ├── client.ts       # Gemini client
│   │   │       └── adapters/       # Service-specific adapters
│   │   │           ├── design-adapter.ts
│   │   │           ├── image-adapter.ts
│   │   │           └── analysis-adapter.ts
│   │   └── storage/                # Storage services (future)
│   └── infrastructure/             # Infrastructure concerns
│       ├── rate-limiting/          # Rate limiting utilities
│       ├── retry-handlers/         # Retry logic with exponential backoff
│       ├── caching/                # Request caching
│       ├── error-tracking/         # Error tracking & logging
│       └── performance-monitoring/ # Performance monitoring
├── features/                       # Feature-based modules
│   ├── content-repurpose/          # Content repurposing feature
│   │   ├── components/             # Feature-specific components
│   │   ├── services/               # Feature-specific services
│   │   ├── hooks/                  # Feature-specific hooks
│   │   ├── types.ts                # Feature-specific types
│   │   └── database.ts             # Feature-specific database functions
│   ├── thumbnail-generation/       # Thumbnail generation feature
│   └── video-analysis/             # Video analysis feature
├── shared/                         # Shared utilities & components
│   ├── components/                 # Reusable UI components
│   │   ├── ui/                     # Basic UI components
│   │   ├── layout/                 # Layout components
│   │   └── modals/                 # Modal components
│   ├── hooks/                      # Shared React hooks
│   ├── utils/                      # Shared utilities
│   │   ├── image-utils.ts
│   │   ├── video-utils.ts
│   │   └── youtube-utils.ts
│   ├── constants/                  # Shared constants
│   └── types/                      # Shared type definitions
├── pages/                          # Page components
├── contexts/                       # React contexts
└── lib/                            # Third-party library configurations
```

## Core Principles

### 1. Separation of Concerns

- **Core**: Infrastructure and domain-agnostic logic
- **Features**: Feature-specific business logic and UI
- **Shared**: Reusable components and utilities

### 2. Scalability

- **Infrastructure layer**: Handles rate limiting, retries, caching, error tracking
- **Algorithm layer**: Modular ML algorithms that can be added independently
- **Processor layer**: Separate processors for different media types
- **Feature layer**: Isolated features that don't depend on each other

### 3. Maintainability

- **Clear folder structure**: Easy to locate and understand code
- **Consistent naming**: Professional, descriptive names
- **Type safety**: Full TypeScript support
- **Documentation**: Inline documentation and architecture docs

## Key Components

### Core Infrastructure

Provides centralized infrastructure services:

- **Rate Limiting**: Prevents API abuse and ensures fair resource usage
- **Retry Handlers**: Exponential backoff for failed requests
- **Caching**: Request caching to reduce redundant API calls
- **Error Tracking**: Centralized error tracking and logging
- **Performance Monitoring**: Performance metrics and Core Web Vitals

### ML Algorithms

Organized by domain:

- **Content Analysis**: Viral moment detection, scene analysis, engagement prediction
- **Media Processing**: Image analysis, audio analysis (future)
- **Engagement Prediction**: ML models for predicting content engagement (future)

### Processors

Handle data processing for different media types:

- **Video Processor**: FFmpeg-based video processing (clipping, transcoding, metadata extraction)
- **Audio Processor**: Audio processing (future)
- **Image Processor**: Image optimization and compression

### AI Services

External service integrations:

- **Gemini**: Google Gemini AI provider with service-specific adapters
- **Future**: Support for other AI providers (OpenAI, Anthropic, etc.)

### Features

Feature-based modules that combine core services:

- **Content Repurpose**: Video repurposing with ML analysis
- **Thumbnail Generation**: AI-powered thumbnail generation
- **Video Analysis**: Video analysis and insights

## Migration Guide

### Import Updates

**Old:**
```typescript
import { imageGenRateLimiter } from '../../utils/rateLimiter';
import { retryWithBackoff } from '../../utils/retryHandler';
import { optimizeImageForAI } from '../../utils/imageOptimizer';
import { analyzeVideoForViralMoments } from '../../services/ml/viralMomentDetector';
import { processVideoClip } from '../../services/video/videoProcessor';
```

**New:**
```typescript
import { imageGenRateLimiter } from '@/core/infrastructure/rate-limiting';
import { retryWithBackoff } from '@/core/infrastructure/retry-handlers';
import { optimizeImageForAI } from '@/core/processors/image';
import { analyzeVideoForViralMoments } from '@/core/algorithms/content-analysis/viral-detection';
import { processVideoClip } from '@/core/processors/video';
```

### Adding New ML Algorithms

1. Create algorithm folder in `core/algorithms/{domain}/`
2. Implement algorithm with proper types
3. Export from domain index file
4. Use infrastructure services (rate limiting, retry, error tracking)

### Adding New Features

1. Create feature folder in `features/`
2. Implement feature-specific components, services, and hooks
3. Use core services (algorithms, processors, infrastructure)
4. Keep feature isolated from other features

## Benefits

1. **Scalability**: Easy to add new ML algorithms and features
2. **Maintainability**: Clear structure makes code easy to understand and modify
3. **Reusability**: Core infrastructure and processors can be reused across features
4. **Testability**: Isolated components are easier to test
5. **Professional**: Industry-standard architecture patterns

