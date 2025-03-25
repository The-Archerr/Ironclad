#!/bin/bash

# Build the web application
echo "Building web application..."
npm run build

# Initialize Capacitor if not already done
if [ ! -d "android" ]; then
  echo "Initializing Capacitor..."
  npx cap init Ironclad com.ironclad.app --web-dir dist
  
  echo "Adding Android platform..."
  npx cap add android
fi

# Sync the web build with Capacitor
echo "Syncing with Capacitor..."
npx cap sync

# Generate Android app icon
echo "Generating Android app icon..."
mkdir -p android/app/src/main/res/drawable
mkdir -p android/app/src/main/res/mipmap-hdpi
mkdir -p android/app/src/main/res/mipmap-mdpi
mkdir -p android/app/src/main/res/mipmap-xhdpi
mkdir -p android/app/src/main/res/mipmap-xxhdpi
mkdir -p android/app/src/main/res/mipmap-xxxhdpi

# Copy the app icon to the required locations (we're using the existing icon)
cp generated-icon.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# Create a simple keystore for signing the APK
echo "Creating keystore for signing..."
mkdir -p android/app/keystore
keytool -genkey -v -keystore android/app/keystore.jks -alias ironclad -keyalg RSA -keysize 2048 -validity 10000 -storepass ironcladapp -keypass ironcladapp -dname "CN=Ironclad App, OU=Educational, O=Ironclad, L=Unknown, ST=Unknown, C=US"

# Build the debug APK
echo "Building debug APK..."
cd android && ./gradlew assembleDebug

echo "APK build completed!"
echo "Your APK should be available at: android/app/build/outputs/apk/debug/app-debug.apk"