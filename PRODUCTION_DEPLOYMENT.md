# ThriftDrop Production Deployment Guide

## 🚀 Ready for Production

Your ThriftDrop app has been configured for production deployment with:

- ✅ **EAS Build Configuration** - Complete build profiles
- ✅ **Unique Bundle Identifiers** - `com.atharbilal.thriftdrop`
- ✅ **Production-Safe Logging** - Console statements wrapped in `__DEV__`
- ✅ **App Store Metadata** - Complete app information
- ✅ **Permissions Configured** - Camera, storage, location

## 📱 Build Commands

### Preview Build (Testing)
```bash
eas build --profile preview --platform all
```

### Production Build (App Stores)
```bash
eas build --profile production --platform all
```

### Development Build (Internal)
```bash
eas build --profile development --platform all
```

## 🏗️ Configuration Files

### 1. EAS Configuration (`eas.json`)
- **Build Profiles**: Development, Preview, Production
- **Bundle Identifiers**: `com.atharbilal.thriftdrop`
- **Auto Increment**: Version codes and build numbers
- **Metadata**: Complete app store information

### 2. App Configuration (`app.json`)
- **Permissions**: Camera, Storage, Location
- **iOS Info.plist**: Usage descriptions
- **Android Permissions**: Required access
- **Plugins**: Camera, Location, Web Browser

### 3. Service Account (`android-service-account-key.json`)
- **Template**: Created for Google Play Console
- **Action Required**: Replace with actual credentials

## 🔧 Required Setup

### Apple App Store Setup
1. **Update EAS Configuration**:
   ```json
   "ios": {
     "appleId": "YOUR_ACTUAL_APPLE_APP_ID",
     "ascAppId": "YOUR_ACTUAL_ASC_APP_ID", 
     "appleTeamId": "YOUR_ACTUAL_APPLE_TEAM_ID"
   }
   ```

2. **App Store Connect**:
   - Create app with bundle ID `com.atharbilal.thriftdrop`
   - Upload screenshots and app metadata
   - Set pricing and availability

### Google Play Console Setup
1. **Service Account**:
   - Create service account in Google Cloud Console
   - Download JSON key file
   - Replace `android-service-account-key.json`

2. **Play Console**:
   - Create app with package `com.atharbilal.thriftdrop`
   - Upload screenshots and store listing
   - Set content rating and pricing

## 📋 App Store Metadata

### App Information
- **Name**: ThriftDrop
- **Description**: Discover and share amazing thrift finds in your area
- **Category**: Shopping
- **Keywords**: thrift, shopping, deals, bargains, local
- **Content Rating**: 4+
- **Pricing**: Free

### Features
- 📸 **Photo Upload**: Share thrift finds with images
- 📍 **Location-Based**: Find deals near you
- 👤 **Social Profiles**: User authentication and profiles
- 🔄 **Real-time Updates**: Live feed of new discoveries

## 🛡️ Security & Performance

### Production Optimizations
- **Console Logging**: Disabled in production builds
- **Bundle Size**: Optimized asset bundling
- **Permissions**: Properly declared with user descriptions
- **Authentication**: Secure Supabase integration

### Environment Variables
```env
EXPO_PUBLIC_SUPABASE_URL=your_production_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
```

## 🚀 Deployment Steps

### 1. Test Preview Build
```bash
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

### 2. Test on Devices
- Install preview builds on test devices
- Verify all features work correctly
- Test authentication and image uploads

### 3. Production Build
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

### 4. Submit to Stores
```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

## 📊 Build Channels

### Development Channel
- **Purpose**: Internal testing and development
- **Distribution**: Internal only
- **Features**: Development client enabled

### Preview Channel  
- **Purpose**: Stakeholder testing and QA
- **Distribution**: Internal testing
- **Features**: Production-like build for testing

### Production Channel
- **Purpose**: App store deployment
- **Distribution**: Public app stores
- **Features**: Optimized production build

## 🔍 Post-Deployment Checklist

- ✅ Test authentication flow
- ✅ Verify image upload functionality
- ✅ Check location services
- ✅ Test social features
- ✅ Verify push notifications (if implemented)
- ✅ Monitor crash reports
- ✅ Track user analytics

## 📞 Support

### EAS Documentation
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

### App Store Resources
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console)

---

**🎉 Your ThriftDrop app is production-ready!** 

Follow this guide for a smooth deployment to the App Store and Google Play Store.
