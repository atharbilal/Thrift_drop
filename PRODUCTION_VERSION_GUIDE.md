# ThriftDrop Production Version Management Guide

## 📱 Version Management Strategy

### **Version Format:**
- **App Version**: `1.0.0` (Semantic Versioning)
- **iOS Build Number**: `1` (Integer, auto-increment)
- **Android Version Code**: `1` (Integer, auto-increment)

### **Version Update Process:**

#### **1. Update App Version (Major/Minor/Patch)**
```json
// app.json
{
  "expo": {
    "version": "1.1.0"  // Increment based on changes
  }
}
```

#### **2. Build Numbers (Auto-increment)**
```json
// eas.json - Auto-increment enabled
{
  "build": {
    "production": {
      "ios": {
        "autoIncrement": "buildNumber"
      },
      "android": {
        "autoIncrement": "versionCode"
      }
    }
  }
}
```

## 🔧 iOS Permissions Configuration

### **Camera & Photo Library:**
```json
// app.json - iOS infoPlist
"infoPlist": {
  "NSCameraUsageDescription": "ThriftDrop needs access to your camera to let you upload photos of thrift finds and share them with the community.",
  "NSPhotoLibraryUsageDescription": "ThriftDrop needs access to your photo library to let you select and upload existing photos of thrift finds.",
  "NSLocationWhenInUseUsageDescription": "ThriftDrop uses your location to show thrift finds and deals near you, helping you discover local bargains."
}
```

### **Additional iOS Configurations:**
```json
"UIBackgroundModes": [
  "background-fetch",
  "background-processing"
],
"ITSAppUsesNonExemptEncryption": false
```

## 🤖 Android Permissions Configuration

### **Required Permissions:**
```json
// app.json - Android permissions
"permissions": [
  "CAMERA",                // Camera access
  "READ_EXTERNAL_STORAGE", // Legacy storage access
  "READ_MEDIA_IMAGES",     // Modern storage access (API 33+)
  "ACCESS_FINE_LOCATION"   // Location access
]
```

### **Android SDK Versions:**
```json
"compileSdkVersion": 34,
"targetSdkVersion": 34
```

## 🚀 Production Build Configuration

### **EAS Production Profile:**
```json
// eas.json
{
  "build": {
    "production": {
      "distribution": "store",
      "env": {
        "NODE_ENV": "production"
      },
      "node": "18.17.0",
      "yarn": "1.22.19",
      "cache": {
        "disabled": false,
        "key": "default"
      }
    }
  }
}
```

### **Console.log Removal:**
```javascript
// babel.config.js
plugins: [
  // Remove console.log statements in production
  process.env.NODE_ENV === 'production' && 'transform-remove-console',
].filter(Boolean),
```

## 📦 Build Commands

### **Development Build:**
```bash
eas build --profile development --platform all
```

### **Preview Build:**
```bash
eas build --profile preview --platform all
```

### **Production Build:**
```bash
eas build --profile production --platform all
```

### **Submit to Stores:**
```bash
eas submit --profile production --platform all
```

## 🔄 Version Release Workflow

### **1. Pre-Release Checklist:**
- [ ] Update app version in `app.json`
- [ ] Test all features thoroughly
- [ ] Verify permissions work correctly
- [ ] Check image optimization
- [ ] Test offline functionality
- [ ] Validate network awareness

### **2. Build Process:**
```bash
# 1. Build for testing
eas build --profile preview --platform ios
eas build --profile preview --platform android

# 2. Test on devices
# Install and test preview builds

# 3. Production build
eas build --profile production --platform all

# 4. Submit to stores
eas submit --profile production --platform all
```

### **3. Post-Release:**
- [ ] Monitor crash reports
- [ ] Check user feedback
- [ ] Update documentation
- [ ] Prepare next version

## 📋 Version Numbering Guide

### **Semantic Versioning:**
- **Major (X.0.0)**: Breaking changes, major features
- **Minor (0.X.0)**: New features, improvements
- **Patch (0.0.X)**: Bug fixes, small improvements

### **Examples:**
- `1.0.0` → `1.0.1` (Bug fix)
- `1.0.1` → `1.1.0` (New feature)
- `1.1.0` → `2.0.0` (Breaking change)

## 🔒 Security & Compliance

### **iOS App Store:**
- Bundle Identifier: `com.atharbilal.thriftdrop`
- Encryption Export Compliance: `false`
- Background Modes: Configured for sync

### **Google Play Store:**
- Package: `com.atharbilal.thriftdrop`
- Target SDK: 34 (Latest)
- Permissions: Properly declared

### **Privacy Policy:**
- Camera access: For uploading thrift finds
- Photo library: For selecting existing photos
- Location: For showing nearby deals
- Data storage: Secure Supabase backend

## 🎯 Production Optimizations

### **Image Handling:**
- Max width: 1200px
- Quality: 0.7 (70%)
- Format: JPEG
- BlurHash placeholders

### **Performance:**
- Console.log removal
- Code minification
- Asset optimization
- Caching enabled

### **Network:**
- Offline persistence
- Background fetching
- Progress tracking
- Error handling

## 📊 Build Environment

### **Node.js Version:** 18.17.0
### **Yarn Version:** 1.22.19
### **Environment:** production
### **Cache:** Enabled (default key)

---

**🚀 ThriftDrop is production-ready with proper version management, permissions, and optimizations!**
