# Staging APK (free)

## A. Separate staging database (recommended)
1. supabase.com > New project (free plan), name it `vedanthika-staging`.
2. SQL Editor > paste and run `supabase/migrations/20261030190345_create_clinic_management_schema.sql`.
3. Authentication > Sign In / Providers > Email: turn **Confirm email OFF** for staging (quicker testing).
4. Project Settings > API: copy the **Project URL** and **anon public** key.

## B. Build the APK in the cloud (GitHub Actions, free)
1. Create a GitHub repo and push this project (`.env` is git-ignored; keys go in secrets, next step).
2. Repo > Settings > Secrets and variables > Actions > New repository secret. Add:
   - `STAGING_SUPABASE_URL`
   - `STAGING_SUPABASE_ANON_KEY`
   - `STAGING_APP_URL` (any https address, e.g. your Netlify site. Can be a placeholder for now)
3. Repo > Actions > **Android staging APK** > Run workflow. Takes about 5-8 minutes.
4. Open the finished run > Artifacts > download `vedanthika-staging-apk` (zip) > extract `app-debug.apk`.

## C. Install on your phone
1. Send `app-debug.apk` to the phone (WhatsApp, Google Drive, USB).
2. Tap it. When asked, allow "Install unknown apps" for that app.
3. It appears as **Vedanthika Staging** and can sit next to the real app.

## Build locally instead
```bash
npm install && npm run android:sync
cd android && ./gradlew assembleDebug      # Windows: gradlew.bat assembleDebug
# result: android/app/build/outputs/apk/debug/app-debug.apk
```
