import React from "react";
import { WidgetTaskHandlerProps } from "react-native-android-widget";
import { UsWidget } from "./UsWidget";

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const partnerName = "Raisa";
  const statusText = "I love you!";
  const distance = "2.4 km away";

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      props.renderWidget(
        <UsWidget
          partnerName={partnerName}
          statusText={statusText}
          distance={distance}
        />,
      );
      break;

    default:
      break;
  }
}
