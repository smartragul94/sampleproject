# Vedanthika Dental Clinic: PWA

React + Vite + Tailwind + Supabase. Installable on Android, iOS and desktop.

## Run locally
```bash
npm install
cp .env.example .env     # then fill in your Supabase URL and anon key
npm run dev
```

## Build and deploy
```bash
npm run build            # output in dist/
```
Deploy `dist/` to any HTTPS host (Netlify, Vercel, Cloudflare Pages). PWAs only install over HTTPS.
Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the host's environment settings.

## Supabase settings (Authentication > URL Configuration)
- **Site URL**: your deployed address, e.g. `https://yourclinic.netlify.app`
- **Redirect URLs**: add the same address (and `http://localhost:5173` for development).
Needed for the password-reset and email-confirmation links to open the app.
Run `supabase/migrations/*.sql` in the Supabase SQL editor once to create the tables.

## Installing the app
- **Android / Chrome / Edge**: tap **Install app** on the login page (or browser menu > Install app).
- **iPhone / iPad**: open in Safari > Share > **Add to Home Screen**.

## Android app (Google Play)
The Android project lives in `android/` (Capacitor). It wraps the same web build.

**One-time setup on your computer:** install Node 20+, JDK 21 and [Android Studio](https://developer.android.com/studio) (it installs the Android SDK).

```bash
npm install
npm run android:sync        # builds the web app and copies it into the Android project
npm run android:open        # opens Android Studio (first Gradle sync takes a few minutes)
```

**1. Create your upload key (once, keep it safe, back it up. If you lose it you cannot update the app):**
```bash
keytool -genkey -v -keystore android/vedanthika-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```
**2. Create `android/keystore.properties`:**
```
storeFile=vedanthika-upload.jks
storePassword=YOUR_PASSWORD
keyAlias=upload
keyPassword=YOUR_PASSWORD
```
**3. Build:**
```bash
npm run android:aab   # Play Store upload file -> android/app/build/outputs/bundle/release/app-release.aab
npm run android:apk   # APK for testing on a phone -> android/app/build/outputs/apk/release/app-release.apk
```
Before the first Play upload: change `appId` in `capacitor.config.ts` (and `applicationId` / `namespace` in
`android/app/build.gradle`) if you want a different package name. It can never change afterwards.
For each update, increase `versionCode` in `android/app/build.gradle`.
Host `public/privacy.html` (fill in the [BRACKETS]) and use its URL in Play Console.
Set `VITE_APP_URL` to your deployed web address so reset/confirmation emails open correctly.
