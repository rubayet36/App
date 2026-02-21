import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import MapScreen from "./src/screens/MapScreen";
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "./widget/WidgetTaskHandler";
import { Platform } from "react-native";

if (Platform.OS === "android") {
  registerWidgetTaskHandler(widgetTaskHandler);
}

const RootNavigator = () => {
  const { user } = useAuth();
  return user ? <MapScreen /> : <LoginScreen />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
