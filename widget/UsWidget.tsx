import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

interface UsWidgetProps {
  partnerName: string;
  statusText: string;
  distance: string;
}

export function UsWidget({ partnerName, statusText, distance }: UsWidgetProps) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height: "match_parent",
        backgroundColor: "#FFB6C1",
        borderRadius: 16,
        padding: 16,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextWidget
        text={partnerName}
        style={{
          fontSize: 18,
          fontFamily: "sans-serif-medium",
          color: "#ffffff",
          marginBottom: 8,
        }}
      />
      <TextWidget
        text={statusText || "Thinking of you..."}
        style={{
          fontSize: 16,
          fontFamily: "sans-serif",
          color: "#ffffff",
          marginBottom: 8,
        }}
      />
      <TextWidget
        text={distance}
        style={{
          fontSize: 14,
          fontFamily: "sans-serif-light",
          color: "#ffffff",
        }}
      />
    </FlexWidget>
  );
}
