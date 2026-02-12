# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-beta] - 2026-02-12

### Added

#### Core Features
- **Face Swap System**: Dzine AI direct API integration for high-quality face swapping
  - Hair preservation algorithm
  - Natural boundary blending
  - Multiple quality modes (high/balanced/fast)
- **Face Pool Management**: Firebase Firestore-based face pool system
  - 14 Korean faces (7 female, 7 male)
  - Gender and style filtering
  - Cloud storage integration
- **Batch Processing**: Multi-image processing support
  - Process up to 10 images simultaneously
  - ZIP download for results
  - Parallel processing with worker pool (max 4 concurrent)
- **Beta Feedback System**: User feedback collection
  - 6 quantitative ratings (1-5 scale)
  - 3 qualitative text inputs
  - Firestore storage for analytics

#### Performance Optimizations
- **Image Optimization**: Automatic image preprocessing
  - Auto-resize to 1080px width
  - 85% compression quality
  - 60-80% file size reduction
  - Upload time: 2-5s → 1-2s
- **Image Preloading**: Face pool image preloading
  - Progress tracking (0-100%)
  - Instant display on selection
  - Zero loading delay
- **API Optimization**: Quality and priority options
  - Fast mode: 15-20s processing
  - Balanced mode: 20-25s processing (default)
  - High mode: 30-35s processing
  - Priority queue for premium users

#### Infrastructure
- **Firebase Functions**: tRPC-based serverless backend
  - Type-safe API endpoints
  - Error handling and logging
  - CORS configuration
- **Google Cloud Storage**: Image storage and hosting
  - Public URL generation
  - Automatic rehosting for CORS
- **Firestore Database**: NoSQL data storage
  - User management
  - Project tracking
  - Face pool metadata
  - Beta feedback collection
- **EAS Build**: Expo Application Services configuration
  - Preview builds for beta testing
  - Production build profiles
  - iOS and Android support

### Improved
- **Processing Time**: Reduced from 30s to 20s (balanced mode)
- **User Experience**: Smoother image selection with preloading
- **Error Handling**: Better error messages and recovery
- **Type Safety**: Full TypeScript coverage with tRPC
- **Code Organization**: Modular architecture with clear separation

### Fixed
- **Dzine API Parameter Order**: Corrected source/dest parameter swap
- **Firebase Auth Web Initialization**: Resolved component registration issue
- **Image Upload CORS**: Fixed by rehosting to GCS

### Technical Details

#### Dependencies Added
- `expo-image-manipulator`: Image optimization
- `jszip`: ZIP file generation for batch downloads
- `@dzine/api`: Face swap API integration

#### Configuration
- Firestore security rules for all collections
- EAS build configuration (preview/production)
- Production environment variables template

#### Documentation
- Face Pool Workflow guide
- Beta Testing checklist
- README with feature overview
- CHANGELOG (this file)

### Breaking Changes
None - Initial beta release

### Deprecated
None

### Removed
- Legacy Manus branding and URLs
- Firebase web-specific initialization logic

### Security
- Firestore security rules implemented
- betaFeedback collection: create-only (no read access)
- facePool collection: read-only for users
- User data isolation with auth checks

---

## Version History

### v1.0.0-beta (2026-02-12)
- Initial beta release
- Core face swap functionality
- Batch processing support
- Performance optimizations
- Beta feedback system

### Next Release (TBD)
Planned features:
- Expanded face pool (30 faces)
- Age group categorization
- Skin tone variety
- Subscription system
- Real-time progress updates
