import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { startBackgroundLocation } from "../services/locationService";
import { useAuth } from "../context/AuthContext";
import { Send, LogOut, LocateFixed } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

// Injecting Leaflet HTML into WebView.
// This allows full customization of maps that react-native-maps struggles with.
const mapHTML = (user: any) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; background-color: #1a1a1a; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        #map { width: 100vw; height: 100vh; }
        
        /* Modern Glassmorphism markers */
        .glass-marker {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 182, 193, 0.6); /* Pastel Pink Border */
            border-radius: 50%;
            width: 40px !important;
            height: 40px !important;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(255, 182, 193, 0.4);
            color: white;
            font-weight: bold;
            font-size: 16px;
        }

        .partner-marker {
            border-color: rgba(135, 206, 235, 0.6); /* Sky Blue Border */
            box-shadow: 0 4px 15px rgba(135, 206, 235, 0.4);
        }

        .status-bubble {
            position: absolute;
            top: -45px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 182, 193, 0.85);
            padding: 6px 12px;
            border-radius: 20px;
            color: #111;
            font-size: 12px;
            font-weight: 600;
            white-space: nowrap;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s;
        }

        .status-bubble.visible {
            opacity: 1;
        }

        /* Carto Dark Matter style tiles for a sleek look */
        .leaflet-container { background: #1a1a1a; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        // Don't set initial view until we get our first coordinate
        const map = L.map('map', { zoomControl: false });
        let isMapInitialized = false;
        
        // CartoDB Dark Matter tiles
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Wait for first data payload to create/update markers
        let userMarker, partnerMarker;

        // Custom icon builders
        const createIcon = (initial, isPartner = false) => L.divIcon({
            className: \`glass-marker \${isPartner ? 'partner-marker' : ''}\`,
            html: \`<span>\${initial}</span><div class="status-bubble" id="\${isPartner ? 'partner-status' : 'user-status'}"></div>\`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });

        // Listen for React Native messages
        document.addEventListener('message', function(event) {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'USER_UPDATE' || data.type === 'LOCATION_UPDATE') {
                    const { lat, lng } = data.payload;
                    
                    if (!isMapInitialized) {
                        map.setView([lat, lng], 15);
                        isMapInitialized = true;
                    }

                    if (!userMarker) {
                         userMarker = L.marker([lat, lng], { icon: createIcon('${user?.name?.charAt(0) || "U"}') }).addTo(map);
                    } else {
                         userMarker.setLatLng([lat, lng]);
                    }
                    // Only center if it's explicitly requested to avoid interrupting user panning
                }
                
                if (data.type === 'CENTER_ON_USER') {
                    const { lat, lng } = data.payload;
                    map.flyTo([lat, lng], 15, { animate: true, duration: 1 });
                }
                
                if (data.type === 'PARTNER_UPDATE') {
                    const { lat, lng, status } = data.payload;
                    if (!partnerMarker) {
                         partnerMarker = L.marker([lat, lng], { icon: createIcon('${user?.name === "Rubayet" ? "R" : "R"}', true) }).addTo(map);
                    } else {
                         partnerMarker.setLatLng([lat, lng]);
                    }
                    if (status) {
                        // Ensure the bubble exists before trying to update it
                        const bubble = document.getElementById('partner-status');
                        if (bubble) {
                            bubble.innerText = status;
                            bubble.classList.add('visible');
                        }
                    } else {
                        const bubble = document.getElementById('partner-status');
                        if (bubble) bubble.classList.remove('visible');
                    }
                }
                
                if (data.type === 'SET_USER_STATUS') {
                    const bubble = document.getElementById('user-status');
                    if(data.payload) {
                        bubble.innerText = data.payload;
                        bubble.classList.add('visible');
                    } else {
                        bubble.classList.remove('visible');
                    }
                }
                
            } catch (err) { }
        });
    </script>
</body>
</html>
`;

export default function MapScreen() {
  const { user, logout } = useAuth();
  const webViewRef = useRef<WebView>(null);
  const [statusText, setStatusText] = useState("");
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const partnerId = user?.name === "Rubayet" ? "user_raisa" : "user_rubayet";

  useEffect(() => {
    if (user) {
      startBackgroundLocation(user.uid);
    }
  }, [user]);

  useEffect(() => {
    // Listen to partner's location & status in real-time
    const unsubscribe = onSnapshot(doc(db, "users", partnerId), (docSnap) => {
      if (docSnap.exists() && webViewRef.current) {
        const data = docSnap.data();
        if (data.location) {
          webViewRef.current.postMessage(
            JSON.stringify({
              type: "PARTNER_UPDATE",
              payload: {
                lat: data.location.latitude,
                lng: data.location.longitude,
                status: data.status || "",
              },
            }),
          );
        }
      }
    });
    return () => unsubscribe();
  }, [partnerId]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("Permission to access location was denied");
        return;
      }

      // Initial quick reading
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Send location directly to WebView
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "USER_UPDATE",
            payload: { lat: loc.coords.latitude, lng: loc.coords.longitude },
          }),
        );
        // Center the map initially
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "CENTER_ON_USER",
            payload: { lat: loc.coords.latitude, lng: loc.coords.longitude },
          }),
        );
      }

      // Subscribe to updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 15000,
          distanceInterval: 30,
        },
        (newLoc) => {
          setLocation(newLoc);
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "USER_UPDATE",
              payload: {
                lat: newLoc.coords.latitude,
                lng: newLoc.coords.longitude,
              },
            }),
          );

          if (user?.uid) {
            setDoc(
              doc(db, "users", user.uid),
              {
                location: {
                  latitude: newLoc.coords.latitude,
                  longitude: newLoc.coords.longitude,
                  timestamp: Date.now(),
                },
              },
              { merge: true },
            );
          }
        },
      );
    })();
  }, []);

  const handleSendStatus = async () => {
    if (user?.uid && statusText) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          status: statusText,
          timestamp: Date.now(),
        },
        { merge: true },
      );

      // Update immediately on the UI for feedback
      if (webViewRef.current) {
        // NOTE: we need to delay the UI update slightly to let the map render the marker first if it hasn't
        setTimeout(() => {
          webViewRef.current?.postMessage(
            JSON.stringify({
              type: "SET_USER_STATUS",
              payload: statusText,
            }),
          );
        }, 300);
      }
      setStatusText("");
    }
  };

  const handleLocateMe = async () => {
    if (location && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "CENTER_ON_USER",
          payload: {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          },
        }),
      );
    } else {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "CENTER_ON_USER",
            payload: { lat: loc.coords.latitude, lng: loc.coords.longitude },
          }),
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: mapHTML(user) }}
        style={styles.map}
        scrollEnabled={false}
      />

      {/* Top Bar Overflow Menu */}
      <View style={styles.topBar}>
        <View style={styles.glassHeader}>
          <Text style={styles.greeting}>Hi, {user?.name}</Text>
          <TouchableOpacity onPress={logout} style={styles.iconBtn}>
            <LogOut color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Locate Me Button */}
      <TouchableOpacity style={styles.locateButton} onPress={handleLocateMe}>
        <LocateFixed color="#fff" size={24} />
      </TouchableOpacity>

      {/* Heart-Beat Feature */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
        pointerEvents="box-none"
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Heart-Beat Message (20 chars)"
            placeholderTextColor="rgba(255,255,255,0.5)"
            maxLength={20}
            value={statusText}
            onChangeText={setStatusText}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !statusText && styles.sendButtonDisabled,
            ]}
            onPress={handleSendStatus}
            disabled={!statusText}
          >
            <Send
              color={statusText ? "#fff" : "rgba(255,255,255,0.3)"}
              size={20}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1a1a1a" },
  map: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 50,
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  glassHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(25, 25, 25, 0.65)",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  greeting: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  iconBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  keyboardAvoid: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    marginBottom: Platform.OS === "ios" ? 40 : 20,
    backgroundColor: "rgba(25, 25, 25, 0.75)",
    borderRadius: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.3)", // Pastel Pink
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sendButton: {
    padding: 12,
    backgroundColor: "rgba(255, 182, 193, 0.8)",
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  locateButton: {
    position: "absolute",
    right: 20,
    bottom: Platform.OS === "ios" ? 120 : 100,
    backgroundColor: "rgba(25, 25, 25, 0.75)",
    padding: 12,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 182, 193, 0.3)",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
