# Workout Buddy for webOS TV

A remote-friendly workout app built as a lightweight webOS TV web app. The interface takes inspiration from tvOS principles: clear, high-contrast navigation, generous spacing, large readable type, and distinct focus states for remote control.

## Run on a webOS TV or simulator

1. Install the webOS TV CLI and configure a TV or simulator target with the webOS TV SDK.
2. From this folder, package the application:

   ```sh
   ares-package .
   ```

3. Install the generated `.ipk` on your configured device:

   ```sh
   ares-install --device <device-name> com.workoutbuddy.tv_1.0.4_all.ipk
   ```

4. Launch it:

   ```sh
   ares-launch --device <device-name> com.workoutbuddy.tv
   ```

The left navigation includes **Search**, **Home**, **Routines**, **Library**, and **Settings**. Use the directional pad to move focus between navigation, sections, and workout tiles; press **OK** to activate the focused item. **Back** closes workout details first, returns to Home from another section, then asks for confirmation before exiting from Home. Saved workouts stay in your library on this device. Settings include higher contrast and reduced motion options.

The interface uses a Chromium 53-compatible baseline for older webOS TV 4.x devices, with flexbox layouts and remote-key fallbacks. Newer webOS versions are supported too. Check the TV's webOS TV version under **Settings > General > TV Information**; the firmware number alone doesn't identify its web engine. The app is static and does not need a server or external runtime dependencies. Test on the target TV before distributing; browser preview and successful packaging do not replace device testing.
