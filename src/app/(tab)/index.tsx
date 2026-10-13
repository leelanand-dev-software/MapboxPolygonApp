import Mapbox from "@rnmapbox/maps";
import React, { useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

type Position = [number, number];

const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
if (token) Mapbox.setAccessToken(token);

const INITIAL_CENTER: Position = [77.209, 28.6139];

export default function HomeScreen() {
  const [points, setPoints] = useState<Position[]>([]);
  const [done, setDone] = useState(false);

  const onMapPress = (event: any) => {
    if (done) return;
    const coords = event?.geometry?.coordinates;
    if (!coords || coords.length < 2) return;
    setPoints((prev) => [...prev, [coords[0], coords[1]]]);
  };

  const finish = () => {
    if (points.length < 3) return;
    // GeoJSON polygons must be closed (first point repeated at the end)
    const ring = [...points, points[0]];
    const feature = {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [ring] },
    };
    console.log(
      `Polygon vertices (${points.length} points):`,
      JSON.stringify(points, null, 2),
    );
    console.log("Polygon GeoJSON:", JSON.stringify(feature, null, 2));
    setDone(true);
  };

  const undo = () => setPoints((prev) => prev.slice(0, -1));

  const reset = () => {
    setPoints([]);
    setDone(false);
  };

  // Polygon fill (only when 3+ points)
  const polygonShape = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features:
        points.length >= 3
          ? [
              {
                type: "Feature" as const,
                properties: {},
                geometry: {
                  type: "Polygon" as const,
                  coordinates: [[...points, points[0]]],
                },
              },
            ]
          : [],
    }),
    [points],
  );

  // Close the visible outline after the polygon is finished.
  const lineShape = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features:
        points.length >= 2
          ? [
              {
                type: "Feature" as const,
                properties: {},
                geometry: {
                  type: "LineString" as const,
                  coordinates:
                    done && points.length >= 3
                      ? [...points, points[0]]
                      : points,
                },
              },
            ]
          : [],
    }),
    [done, points],
  );

  const pointsShape = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: points.map((p, i) => ({
        type: "Feature" as const,
        properties: { index: i },
        geometry: { type: "Point" as const, coordinates: p },
      })),
    }),
    [points],
  );

  if (!token) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>
          Set EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN in .env and restart Expo.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={StyleSheet.absoluteFill}
        styleURL={Mapbox.StyleURL.Street}
        onPress={onMapPress}
      >
        <Mapbox.Camera zoomLevel={12} centerCoordinate={INITIAL_CENTER} />

        <Mapbox.ShapeSource id="polygon" shape={polygonShape}>
          <Mapbox.FillLayer
            id="polygon-fill"
            style={{ fillColor: "#2563EB", fillOpacity: 0.3 }}
          />
        </Mapbox.ShapeSource>

        <Mapbox.ShapeSource id="line" shape={lineShape}>
          <Mapbox.LineLayer
            id="line-layer"
            style={{ lineColor: "#1D4ED8", lineWidth: 3 }}
          />
        </Mapbox.ShapeSource>

        <Mapbox.ShapeSource id="points" shape={pointsShape}>
          <Mapbox.CircleLayer
            id="point-circles"
            style={{
              circleRadius: 6,
              circleColor: "#FFFFFF",
              circleStrokeColor: "#1D4ED8",
              circleStrokeWidth: 2,
            }}
          />
        </Mapbox.ShapeSource>
      </Mapbox.MapView>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.bar}>
          <Text style={styles.info}>
            {done
              ? "Polygon saved to console"
              : `${points.length} point(s) · tap map to add`}
          </Text>
          <View style={styles.row}>
            <Btn
              label="Undo"
              onPress={undo}
              disabled={done || points.length === 0}
            />
            <Btn label="Clear" onPress={reset} disabled={points.length === 0} />
            <Btn
              label="Done"
              onPress={finish}
              disabled={done || points.length < 3}
              primary
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Btn({
  label,
  onPress,
  disabled,
  primary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        primary && styles.btnPrimary,
        disabled && styles.btnDisabled,
      ]}
    >
      <Text style={[styles.btnText, primary && styles.btnTextPrimary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  overlay: { flex: 1, justifyContent: "flex-end", padding: 16 },
  bar: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  info: { fontSize: 13, fontWeight: "600", color: "#334155" },
  row: { flexDirection: "row", gap: 8 },
  btn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
  },
  btnPrimary: { backgroundColor: "#1D4ED8" },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontWeight: "700", color: "#1D4ED8" },
  btnTextPrimary: { color: "#FFFFFF" },
});
