# Ironclad Android App

This document provides instructions for building the Ironclad educational app for Android devices.

## Prerequisites

- Node.js and npm
- Android Studio (for development and testing)
- JDK 11 or newer

## Building the APK

1. Run the build script:
   ```bash
   ./build-apk.sh
   ```

2. The script will:
   - Build the web application
   - Initialize Capacitor
   - Add Android platform
   - Sync web code with Android
   - Set up app resources
   - Build the debug APK

3. Upon completion, the APK file will be available at:
   - `ironclad.apk` in the project root
   - `android/app/build/outputs/apk/debug/app-debug.apk`

## Manual Steps

If you need to build the APK manually:

1. Build the web application:
   ```bash
   npm run build
   ```

2. Initialize Capacitor (if not already done):
   ```bash
   npx cap init Ironclad com.ironclad.app --web-dir dist/public
   ```

3. Add Android platform (if not already done):
   ```bash
   npx cap add android
   ```

4. Sync web code with Android:
   ```bash
   npx cap sync android
   ```

5. Open Android project in Android Studio:
   ```bash
   npx cap open android
   ```

6. In Android Studio:
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - The APK will be in android/app/build/outputs/apk/

## Features

- Course-based learning paths
- Interactive flowcharts for visualizing course progression
- Quizzes and achievements
- Pomodoro timer for productive study sessions
- Task management
- Community notes

## Android Requirements

- Android 5.0 (API level 21) or higher
- Internet connection for accessing course resources

## Using the App

After installing the APK on your Android device:

1. Sign in with your credentials or create a new account
2. Browse available courses
3. Select a course to view its flowchart and topics
4. Complete topics to unlock achievements
5. Use productivity tools to enhance your learning experience