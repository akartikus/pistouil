#!/usr/bin/env bash
# Build the debug APK on this machine (see README.md, « Build Android »).
set -euo pipefail

# The project compiles with Java 21 (android/app/capacitor.build.gradle): the system JDK is often older.
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk21}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
PLATFORM=36

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APK="$ROOT/android/app/build/outputs/apk/debug/app-debug.apk"

if [ ! -x "$JAVA_HOME/bin/java" ]; then
  echo "No JDK in JAVA_HOME ($JAVA_HOME): install a JDK 21 and set JAVA_HOME." >&2
  exit 1
fi
JAVA_MAJOR="$("$JAVA_HOME/bin/java" -version 2>&1 | sed -n '1s/.*version "\([0-9]*\).*/\1/p')"
if [ "${JAVA_MAJOR:-0}" -lt 21 ]; then
  echo "JAVA_HOME ($JAVA_HOME) is Java ${JAVA_MAJOR:-unknown}: the project needs Java 21 or later." >&2
  exit 1
fi
if [ ! -d "$ANDROID_HOME/platforms/android-$PLATFORM" ]; then
  echo "Android platform $PLATFORM not found in ANDROID_HOME ($ANDROID_HOME): install it with sdkmanager \"platforms;android-$PLATFORM\"." >&2
  exit 1
fi

cd "$ROOT"
npm run build
npx cap sync android
(cd android && ./gradlew assembleDebug)

echo
echo "APK: $APK"
