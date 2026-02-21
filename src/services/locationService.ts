import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

declare global {
  var currentUserId: string | undefined;
}

const LOCATION_TASK_NAME = "background-location-task";

import { Platform } from "react-native";

export const startBackgroundLocation = async (userId: string) => {
  if (Platform.OS === "web") return; // Background tasks are not supported on web

  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus === "granted") {
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus === "granted") {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 300000, // 5 minutes (300,000 ms)
        distanceInterval: 50, // OR 50 meters
        deferredUpdatesInterval: 300000,
        showsBackgroundLocationIndicator: true,
      });
      // Store current user to be accessible in task manager (hacky but works for demo)
      // Usually would use secure store or async storage.
      global.currentUserId = userId;
    }
  }
};

export const stopBackgroundLocation = async () => {
  const isRegistered =
    await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
};

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Task error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const loc = locations[0];
    const userId = global.currentUserId;

    if (loc && userId) {
      try {
        await setDoc(
          doc(db, "users", userId),
          {
            location: {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              timestamp: loc.timestamp,
            },
          },
          { merge: true },
        );
      } catch (err) {
        console.error("Failed to sync background location to Firestore", err);
      }
    }
  }
});
