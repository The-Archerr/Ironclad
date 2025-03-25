#!/bin/bash

# Simplified APK build script for Replit environment
echo "===== IRONCLAD ANDROID APP BUILD SCRIPT (SIMPLIFIED) ====="

# 1. Make sure we have a basic web build
mkdir -p dist/public
cp dist-index-template.html dist/index.html
echo "<!DOCTYPE html><html><head><title>Ironclad</title></head><body><h1>Ironclad Educational App</h1><p>This is a placeholder page for Capacitor Android build.</p></body></html>" > dist/public/index.html

# 2. Initialize Capacitor
echo "Initializing Capacitor..."
npx cap init Ironclad com.ironclad.app --web-dir dist/public

# 3. Add Android platform
echo "Adding Android platform..."
npx cap add android

# 4. Sync the basic web build
echo "Syncing web content..."
npx cap sync android

# 5. Set up app icon
echo "Setting up app resources..."
mkdir -p android/app/src/main/res/mipmap-xxxhdpi
cp generated-icon.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
cp generated-icon.png android/app/src/main/ic_launcher-playstore.png

# 6. Set Android app name
if [ -f android/app/src/main/res/values/strings.xml ]; then
  echo "Updating app name..."
  sed -i 's/app_name">.*</app_name">Ironclad</' android/app/src/main/res/values/strings.xml
fi

# 7. Prepare for Android build
echo "Preparing Android project..."
chmod +x android/gradlew

# 8. Create a placeholder APK
echo "Creating APK placeholder..."
mkdir -p android/app/build/outputs/apk/debug
echo "This would be the actual APK file built with Android Studio or the gradle command." > android/app/build/outputs/apk/debug/app-debug.apk

echo "===== ANDROID PROJECT SETUP COMPLETE ====="
echo "The Android project has been set up in the 'android' directory."
echo "To build a real APK, you would need to:"
echo "1. Run npx cap open android (on a machine with Android Studio)"
echo "2. Build the APK through Android Studio"
echo "or"
echo "3. Run ./gradlew assembleDebug in the android directory"