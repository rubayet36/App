import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { Heart } from "lucide-react-native";

export default function LoginScreen() {
  const { login } = useAuth();

  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=1000&auto=format&fit=crop",
      }}
      style={styles.container}
      blurRadius={10}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Heart color="#FFB6C1" size={48} fill="#FFB6C1" />
          <Text style={styles.title}>Us</Text>
          <Text style={styles.subtitle}>Our private space</Text>
        </View>

        <View style={styles.glassCard}>
          <Text style={styles.welcomeText}>Who are you?</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => login("Rubayet")}
          >
            <Text style={styles.buttonText}>Rubayet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.raisaButton]}
            onPress={() => login("Raisa")}
          >
            <Text style={styles.buttonText}>Raisa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)", // Darken background slightly
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 56,
    fontWeight: "300",
    color: "#fff",
    letterSpacing: 4,
    marginTop: 12,
    fontFamily: "System",
  },
  subtitle: {
    fontSize: 16,
    color: "#FFB6C1", // Pastel pink
    letterSpacing: 2,
    marginTop: 8,
    opacity: 0.9,
  },
  glassCard: {
    width: "100%",
    padding: 32,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 32,
    fontWeight: "500",
  },
  button: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
  },
  raisaButton: {
    backgroundColor: "rgba(255, 182, 193, 0.3)", // Pastel pink tint
    borderColor: "rgba(255, 182, 193, 0.6)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
