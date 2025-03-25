#!/bin/bash

# Stop on errors
set -e

echo "===== UPDATING IRONCLAD ANDROID CONFIGURATION ====="

# 1. Build the web application
echo "Step 1: Building web application..."
npm run build
echo "Web build completed."

# 2. Copy network security config
echo "Step 2: Setting up network security config..."
mkdir -p android/app/src/main/res/xml
cp android_network_security_config.xml android/app/src/main/res/xml/network_security_config.xml

# 3. Update AndroidManifest.xml to use the network security config
echo "Step 3: Updating AndroidManifest.xml..."
if [ -f android/app/src/main/AndroidManifest.xml ]; then
  # Check if networkSecurityConfig is already set
  if ! grep -q "android:networkSecurityConfig" android/app/src/main/AndroidManifest.xml; then
    # Add network security config attribute to application tag
    sed -i 's/<application /<application android:networkSecurityConfig="@xml\/network_security_config" /g' android/app/src/main/AndroidManifest.xml
    echo "Added network security config to AndroidManifest.xml"
  else
    echo "Network security config already set in AndroidManifest.xml"
  fi
else
  echo "AndroidManifest.xml not found. Please run build-apk.sh first to create Android project."
  exit 1
fi

# 4. Sync the changes with Capacitor
echo "Step 4: Syncing changes with Capacitor..."
npx cap sync android
echo "Sync completed."

# 5. Fix for WebView cache issues
echo "Step 5: Adding WebView cache fix..."
if [ -f android/app/src/main/java/com/ironclad/app/MainActivity.java ]; then
  # Check if onCreate is already overridden with cache clearing
  if ! grep -q "WebView.clearCache" android/app/src/main/java/com/ironclad/app/MainActivity.java; then
    # Create a temporary file with the modified content
    cat > temp_MainActivity.java << 'EOF'
package com.ironclad.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Clear WebView cache on every app start
        WebView.clearCache(true);
        super.onCreate(savedInstanceState);
    }
}
EOF
    # Replace the original file
    mv temp_MainActivity.java android/app/src/main/java/com/ironclad/app/MainActivity.java
    echo "Added WebView cache clearing to MainActivity.java"
  else
    echo "WebView cache clearing already added to MainActivity.java"
  fi
else
  echo "MainActivity.java not found. Android project structure might be different than expected."
fi

echo "===== ANDROID CONFIGURATION UPDATE COMPLETE ====="
echo "Rebuild your APK with ./build-apk.sh to apply all changes."