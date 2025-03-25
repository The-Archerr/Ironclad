#!/bin/bash

# Stop on errors
set -e

echo "===== IRONCLAD ANDROID APP BUILD SCRIPT ====="
echo "Starting build process..."

# 1. Build the web application
echo "Step 1: Building web application..."
npm run build
echo "Web build completed."

# 2. Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "Error: dist directory not found. Build may have failed."
  exit 1
fi

# 3. Fix permissions for environment (especially in cloud environments)
echo "Step 2: Setting up environment permissions..."
chmod -R 755 dist

# 4. Initialize Capacitor if not already done
if [ ! -d "android" ]; then
  echo "Step 3: Initializing Capacitor..."
  npx cap init Ironclad com.ironclad.app --web-dir dist/public
  echo "Capacitor initialization complete."
else
  echo "Step 3: Capacitor already initialized, skipping..."
fi

# 5. Add Android platform if not already added
if [ ! -d "android/app" ]; then
  echo "Step 4: Adding Android platform..."
  npx cap add android
  echo "Android platform added."
else
  echo "Step 4: Android platform already exists, skipping..."
fi

# 6. Sync web code with Android
echo "Step 5: Syncing web code with Android..."
npx cap sync android
echo "Sync completed."

# 7. Create app icons directory structure and customize Android app
echo "Step 6: Setting up app resources..."
mkdir -p android/app/src/main/res/mipmap-xxxhdpi
cp generated-icon.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png

# 8. Update Android colors.xml for theme matching
if [ -f "android/app/src/main/res/values/colors.xml" ]; then
  echo "Updating app theme colors..."
  cat > android/app/src/main/res/values/colors.xml << EOF
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#1E293B</color>
    <color name="colorPrimaryDark">#0F172A</color>
    <color name="colorAccent">#38BDF8</color>
</resources>
EOF
fi
echo "App resources setup completed."

# 9. Make sure Android build tools are available
echo "Step 7: Checking for Android build tools..."
if [ ! -f "android/gradlew" ]; then
  echo "Error: Android build tools not found!"
  exit 1
fi

# 10. Build the APK
echo "Step 8: Building APK..."
cd android && chmod +x gradlew && ./gradlew assembleDebug
echo "APK build process completed!"

# 11. Report APK location and copy to project root
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo "Success! APK created at: android/$APK_PATH"
  echo "APK size: $(du -h "$APK_PATH" | cut -f1)"
  cp "$APK_PATH" ../ironclad.apk
  echo "APK copied to project root as ironclad.apk"
else
  echo "APK build may have succeeded, but file not found at expected location."
  echo "Check android/app/build/outputs/apk directory for the APK file."
fi

cd ..
echo "===== BUILD PROCESS COMPLETE ====="