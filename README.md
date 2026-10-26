# Workout Buddy for webOS TV

A remote-friendly workout session picker built as a lightweight webOS TV web app.

## Run on a webOS TV or simulator

1. Install the webOS TV CLI and configure a TV or simulator target with the webOS TV SDK.
2. From this folder, package the application:

   ```sh
   ares-package .
   ```

3. Install the generated `.ipk` on your configured device:

   ```sh
   ares-install --device <device-name> com.workoutbuddy.tv_1.0.0_all.ipk
   ```

4. Launch it:

   ```sh
   ares-launch --device <device-name> com.workoutbuddy.tv
   ```

Use the TV remote’s left and right arrows to browse sessions, then press OK to open one. The app is static and does not need a server or external runtime dependencies.
