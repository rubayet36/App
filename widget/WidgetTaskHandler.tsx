import React from "react";
import { WidgetTaskHandlerProps } from "react-native-android-widget";
import { UsWidget } from "./UsWidget";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../src/config/firebase";
import { Buffer } from "buffer";

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  // 1. Fetch real partner data from Firestore
  // Assuming the user is Rubayet, we fetch Raisa's data.
  // You might want to dynamically store who the current user is using AsyncStorage.
  let partnerName = "Raisa";
  let statusText = "Thinking of you...";
  let distance = "Calculating...";
  let mapImageBase64 = undefined;

  try {
    const partnerDoc = await getDoc(doc(db, "users", "user_raisa"));
    if (partnerDoc.exists()) {
      const data = partnerDoc.data();
      statusText = data.status || statusText;

      if (data.location) {
        // 2. Generate a static map image URL (Replace YOUR_API_KEY with a Google Maps Static API key)
        const lat = data.location.latitude;
        const lng = data.location.longitude;
        const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=400x200&markers=color:red%7C${lat},${lng}&key=YOUR_API_KEY`;

        // 3. Fetch the image and convert to Base64 so the widget can render it
        const imageResponse = await fetch(staticMapUrl);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        mapImageBase64 = `data:image/png;base64,${buffer.toString("base64")}`;
      }
    }
  } catch (error) {
    console.error("Widget fetch error:", error);
  }

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      props.renderWidget(
        <UsWidget
          partnerName={partnerName}
          statusText={statusText}
          distance={distance}
          mapImageBase64={mapImageBase64}
        />,
      );
      break;
    default:
      break;
  }
}
