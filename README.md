# MapboxPolygonApp

## Android development build

`@rnmapbox/maps` uses native code, so this app must run in a development build rather than Expo Go. The `development` EAS profile builds an installable Android APK.

### Configure Mapbox tokens

For local development, put your public Mapbox token in the ignored `.env` file:

```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_public_token
```

For a cloud build, open **Project settings > Environment variables** in the [Expo project dashboard](https://expo.dev/) and add both values to the **development** environment:

- `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`: the public `pk.…` token. Use **Sensitive** or **Plain text** visibility. This token is bundled into the app and is not a secret.
- `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`: the secret `sk.…` token with the `DOWNLOADS:READ` scope. Use **Secret** visibility. The Android build reads this environment variable directly; do not put it in `app.json`, `eas.json`, or a committed file.

### Build and run on an Android phone

1. Sign in to EAS if needed:

   ```bash
   eas login
   ```

2. Build the development APK in the cloud:

   ```bash
   eas build --profile development --platform android
   ```

3. Open the build link on your Android phone and install the APK. Allow installation from your browser if Android asks.

4. Start Metro on your computer:

   ```bash
   npx expo start --dev-client
   ```

   Connect your phone and computer to the same Wi-Fi, or use `npx expo start --dev-client --tunnel` if they cannot connect directly. Open the installed development build to connect.

JavaScript changes reload from Metro. Rebuild when native dependencies, Expo SDK, or native app configuration changes. The app's Mapbox package, development client, config plugin, Android package ID, and EAS project are already configured. An Expo account and both Mapbox tokens are required before starting a cloud build.
