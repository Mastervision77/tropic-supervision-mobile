

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Linking,
  Platform,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
  Camera,
} from 'react-native-maps';
import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { ThemedText } from '@/components/themed-text';
import APP_FONT_FAMILY from '@/components/styles/font';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAP_KEY;
const { width, height } = Dimensions.get('window');

interface TaskMapModalProps {
  visible: boolean;
  onClose: () => void;
  taskLatitude: string | number;
  taskLongitude: string | number;
  taskName: string;
  theme: any;
}

interface Coords {
  latitude: number;
  longitude: number;
}

interface NavStep {
  instruction: string;       // HTML stripped
  distance: string;          // "500 م"
  distanceMeters: number;
  maneuver: string;          // "turn-left" | "turn-right" | "straight" | …
  endLocation: Coords;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodePolyline(encoded: string): Coords[] {
  const pts: Coords[] = [];
  let i = 0, lat = 0, lng = 0;
  while (i < encoded.length) {
    let b: number, shift = 0, result = 0;
    do { b = encoded.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(i++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    pts.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return pts;
}

/** Haversine distance in metres */
function haversine(a: Coords, b: Coords): number {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sin2 = Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
    Math.cos((b.latitude * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2));
}

/** Bearing from a → b in degrees (0 = North) */
function bearing(a: Coords, b: Coords): number {
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Maneuver → icon name (MaterialCommunityIcons) */
function maneuverIcon(maneuver: string): string {
  if (maneuver.includes('left')) return 'arrow-left-top';
  if (maneuver.includes('right')) return 'arrow-right-top';
  if (maneuver.includes('uturn')) return 'arrow-u-left-top';
  if (maneuver.includes('roundabout')) return 'rotate-right';
  if (maneuver.includes('merge') || maneuver.includes('ramp')) return 'arrow-top-right';
  if (maneuver.includes('ferry')) return 'ferry';
  return 'arrow-up';
}

// ── Component ─────────────────────────────────────────────────────────────────
const TaskMapModal = React.memo(({
  visible, onClose,
  taskLatitude, taskLongitude, taskName, theme,
}: TaskMapModalProps) => {
  const mapRef = useRef<MapView>(null);

  // location
  const [currentLoc, setCurrentLoc] = useState<Coords | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // route
  const [routeCoords, setRouteCoords] = useState<Coords[]>([]);
  const [steps, setSteps] = useState<NavStep[]>([]);
  const [totalDistance, setTotalDistance] = useState<string>('');
  const [totalDuration, setTotalDuration] = useState<string>('');
  const [loadingRoute, setLoadingRoute] = useState(false);

  // navigation state
  const [navigating, setNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [distToNextStep, setDistToNextStep] = useState<number | null>(null);
  const [arrived, setArrived] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  // mute voice
  const [muted, setMuted] = useState(false);
  const lastSpokenStep = useRef<number>(-1);

  const taskCoords: Coords = {
    latitude: parseFloat(String(taskLatitude)),
    longitude: parseFloat(String(taskLongitude)),
  };

  // ── Reset on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setArrived(false);
      setCurrentStepIndex(0);
      setNavigating(false);
      setShowSteps(false);
      lastSpokenStep.current = -1;
    } else {
      Speech.stop();
    }
  }, [visible]);

  // ── Location + heading watch ───────────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;

    let locSub: Location.LocationSubscription | null = null;
    let headSub: Location.LocationSubscription | null = null;

    (async () => {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('لم يتم منح إذن الموقع');
        setLoadingLocation(false);
        return;
      }

      // Quick first fix
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCurrentLoc({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLoadingLocation(false);
      } catch {
        setLocationError('تعذر تحديد موقعك');
        setLoadingLocation(false);
        return;
      }

      // Continuous position
      locSub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 2000, distanceInterval: 5 },
        (loc) => {
          setCurrentLoc({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          if (loc.coords.heading != null) setHeading(loc.coords.heading);
        }
      );

      // Heading on iOS
      if (Platform.OS === 'ios') {
        headSub = await Location.watchHeadingAsync((h) => {
          setHeading(h.trueHeading ?? h.magHeading);
        });
      }
    })();

    return () => {
      locSub?.remove();
      headSub?.remove();
    };
  }, [visible]);

  // ── Fetch route ────────────────────────────────────────────────────────────
  const fetchRoute = useCallback(async (from: Coords) => {
    setLoadingRoute(true);
    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${from.latitude},${from.longitude}` +
        `&destination=${taskCoords.latitude},${taskCoords.longitude}` +
        `&mode=driving&language=ar&key=${GOOGLE_MAPS_API_KEY}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.status !== 'OK' || !json.routes.length) return;

      const route = json.routes[0];
      const leg = route.legs[0];

      setTotalDistance(leg.distance.text);
      setTotalDuration(leg.duration.text);
      setRouteCoords(decodePolyline(route.overview_polyline.points));

      const parsedSteps: NavStep[] = leg.steps.map((s: any) => ({
        instruction: stripHtml(s.html_instructions),
        distance: s.distance.text,
        distanceMeters: s.distance.value,
        maneuver: s.maneuver ?? 'straight',
        endLocation: { latitude: s.end_location.lat, longitude: s.end_location.lng },
      }));
      setSteps(parsedSteps);
      setCurrentStepIndex(0);
      lastSpokenStep.current = -1;

      // Fit map
      setTimeout(() => {
        mapRef.current?.fitToCoordinates([from, taskCoords], {
          edgePadding: { top: 160, right: 40, bottom: 220, left: 40 },
          animated: true,
        });
      }, 400);
    } catch { /* silent */ } finally {
      setLoadingRoute(false);
    }
  }, [taskCoords.latitude, taskCoords.longitude]);

  // Auto-fetch route once location is ready
  useEffect(() => {
    if (currentLoc && routeCoords.length === 0 && !loadingRoute) {
      fetchRoute(currentLoc);
    }
  }, [currentLoc]);

  // ── Navigation logic ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigating || !currentLoc || steps.length === 0) return;

    const step = steps[currentStepIndex];
    const dist = haversine(currentLoc, step.endLocation);
    setDistToNextStep(Math.round(dist));

    // Check arrival at destination
    const distToGoal = haversine(currentLoc, taskCoords);
    if (distToGoal < 25) {
      setArrived(true);
      setNavigating(false);
      if (!muted) Speech.speak('لقد وصلت إلى وجهتك', { language: 'ar' });
      return;
    }

    // Advance step
    if (dist < 30 && currentStepIndex < steps.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      lastSpokenStep.current = -1; // reset so it speaks new step
    }

    // Speak instruction (once per step, at ~150m away)
    if (dist < 150 && lastSpokenStep.current !== currentStepIndex && !muted) {
      lastSpokenStep.current = currentStepIndex;
      const distLabel = dist > 50
        ? `بعد ${Math.round(dist / 10) * 10} متر، `
        : 'الآن، ';
      Speech.speak(distLabel + step.instruction, { language: 'ar' });
    }

    // Track-up camera during navigation
    if (navigating) {
      const cam: Partial<Camera> = {
        center: currentLoc,
        heading: heading,
        pitch: 45,
        altitude: 400,
        zoom: 17,
      };
      mapRef.current?.animateCamera(cam as Camera, { duration: 1000 });
    }
  }, [currentLoc, navigating, currentStepIndex, steps, muted]);

  // ── Start navigation ───────────────────────────────────────────────────────
  const startNavigation = useCallback(() => {
    if (!currentLoc) return;
    setNavigating(true);
    setArrived(false);
    lastSpokenStep.current = -1;
    if (!muted && steps[0]) {
      Speech.speak('بدء الملاحة. ' + steps[0].instruction, { language: 'ar' });
    }
  }, [currentLoc, steps, muted]);

  const stopNavigation = useCallback(() => {
    setNavigating(false);
    Speech.stop();
    // Overview camera
    if (currentLoc) {
      mapRef.current?.fitToCoordinates([currentLoc, taskCoords], {
        edgePadding: { top: 160, right: 40, bottom: 220, left: 40 },
        animated: true,
      });
    }
  }, [currentLoc]);

  // ── Open in Google Maps ────────────────────────────────────────────────────
  const openInGoogleMaps = useCallback(() => {
    const { latitude: lat, longitude: lng } = taskCoords;
    const native = Platform.select({
      ios: `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
      android: `google.navigation:q=${lat},${lng}`,
    });
    const web = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    Linking.canOpenURL(native!).then((ok) => Linking.openURL(ok ? native! : web));
  }, [taskCoords]);

  // ── Current step info ──────────────────────────────────────────────────────
  const currentStep = steps[currentStepIndex];

  const formatDist = (m: number) =>
    m >= 1000 ? `${(m / 1000).toFixed(1)} كم` : `${m} م`;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.root}>

        {/* ── Nav instruction banner (shown while navigating) ── */}
        {navigating && currentStep && !arrived && (
          <View style={[styles.navBanner, { backgroundColor: theme.primary }]}>
            <View style={styles.navBannerInner}>
              <MaterialCommunityIcons
                name={maneuverIcon(currentStep.maneuver) as any}
                size={36}
                color="#fff"
                style={styles.navBannerIcon}
              />
              <View style={styles.navBannerText}>
                <ThemedText style={styles.navInstruction} numberOfLines={2}>
                  {currentStep.instruction}
                </ThemedText>
                {distToNextStep != null && (
                  <ThemedText style={styles.navDist}>
                    {formatDist(distToNextStep)}
                  </ThemedText>
                )}
              </View>
              <TouchableOpacity onPress={() => setMuted(m => !m)} style={styles.muteBtn}>
                <Ionicons name={muted ? 'volume-mute' : 'volume-high'} size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            {/* Next step preview */}
            {steps[currentStepIndex + 1] && (
              <View style={styles.nextStepRow}>
                <ThemedText style={styles.nextStepText} numberOfLines={1}>
                  ثم: {steps[currentStepIndex + 1].instruction}
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* ── Arrival banner ── */}
        {arrived && (
          <View style={[styles.arrivedBanner, { backgroundColor: '#27ae60' }]}>
            <Ionicons name="checkmark-circle" size={28} color="#fff" />
            <ThemedText style={styles.arrivedText}>وصلت إلى وجهتك!</ThemedText>
          </View>
        )}

        {/* ── Header (shown when NOT navigating) ── */}
        {!navigating && !arrived && (
          <View style={[styles.header, { borderBottomColor: '#e4e6ea' }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <ThemedText style={[styles.headerTitle, { color: theme.primary }]} numberOfLines={1}>
              {taskName}
            </ThemedText>
            <TouchableOpacity
              onPress={() => currentLoc && mapRef.current?.fitToCoordinates([currentLoc, taskCoords], {
                edgePadding: { top: 160, right: 40, bottom: 220, left: 40 }, animated: true,
              })}
              style={styles.headerBtn}
            >
              <MaterialCommunityIcons name="fit-to-page-outline" size={22} color={theme.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* ── Close button while navigating ── */}
        {navigating && (
          <TouchableOpacity
            style={[styles.floatingClose, { backgroundColor: '#fff' }]}
            onPress={onClose}
          >
            <Ionicons name="close" size={20} color="#333" />
          </TouchableOpacity>
        )}

        {/* ── Map ── */}
        <View style={styles.mapWrap}>
          {loadingLocation ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={theme.primary} />
              <ThemedText style={[styles.loadingText, { color: theme.primary }]}>
                جاري تحديد موقعك…
              </ThemedText>
            </View>
          ) : locationError ? (
            <View style={styles.centered}>
              <Ionicons name="location-outline" size={48} color="#ccc" />
              <ThemedText style={styles.errorText}>{locationError}</ThemedText>
            </View>
          ) : (
            <MapView
              ref={mapRef}
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: taskCoords.latitude,
                longitude: taskCoords.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
              }}
              showsUserLocation
              showsMyLocationButton={false}
              showsCompass
              showsTraffic={navigating}
              rotateEnabled
              pitchEnabled
            >

              <Marker
                coordinate={taskCoords}
                title={taskName}
                description="موقع المهمة"
              />

              {/* Route polyline — grey (full) */}
              {routeCoords.length > 0 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#b0bec5"
                  strokeWidth={6}
                />
              )}

              {/* Route polyline — colored (remaining from current step) */}
              {navigating && currentLoc && routeCoords.length > 0 && (() => {
                // Find closest point index on polyline
                let minDist = Infinity, minIdx = 0;
                routeCoords.forEach((pt, idx) => {
                  const d = haversine(currentLoc, pt);
                  if (d < minDist) { minDist = d; minIdx = idx; }
                });
                return (
                  <Polyline
                    coordinates={routeCoords.slice(minIdx)}
                    strokeColor={theme.primary}
                    strokeWidth={7}
                    lineDashPattern={[0]}
                  />
                );
              })()}
            </MapView>
          )}

          {/* Route loading badge */}
          {loadingRoute && (
            <View style={styles.routeBadge}>
              <ActivityIndicator size="small" color="#fff" />
              <ThemedText style={styles.routeBadgeText}>جاري حساب المسار…</ThemedText>
            </View>
          )}
        </View>

        {/* ── Bottom panel ── */}
        {!navigating && (
          <View style={styles.bottomPanel}>

            {/* Summary row */}
            {(totalDistance || totalDuration) && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Ionicons name="navigate-outline" size={16} color={theme.primary} />
                  <ThemedText style={[styles.summaryVal, { color: theme.primary }]}>
                    {totalDistance}
                  </ThemedText>
                </View>
                <View style={styles.summarySep} />
                <View style={styles.summaryItem}>
                  <Ionicons name="time-outline" size={16} color="#606770" />
                  <ThemedText style={styles.summaryDur}>{totalDuration}</ThemedText>
                </View>
              </View>
            )}

            {/* Steps toggle */}
            {steps.length > 0 && (
              <TouchableOpacity
                style={styles.stepsToggle}
                onPress={() => setShowSteps(s => !s)}
                activeOpacity={0.7}
              >
                <ThemedText style={[styles.stepsToggleText, { color: theme.primary }]}>
                  {showSteps ? 'إخفاء الخطوات' : `عرض الخطوات (${steps.length})`}
                </ThemedText>
                <Ionicons
                  name={showSteps ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.primary}
                />
              </TouchableOpacity>
            )}

            
            {showSteps && steps.length > 0 && (
              <ScrollView style={styles.stepsList} nestedScrollEnabled>
                {steps.map((s, i) => (
                  <View key={i} style={styles.stepRow}>
                    <ThemedText style={styles.stepDist}>{s.distance}</ThemedText>
                    <View style={[styles.stepIconWrap, { backgroundColor: theme.primary + '18' }]}>
                      <MaterialCommunityIcons
                        name={maneuverIcon(s.maneuver) as any}
                        size={16}
                        color={theme.primary}
                      />
                    </View>
                    <ThemedText style={styles.stepInstruction} numberOfLines={2}>
                      {s.instruction}
                    </ThemedText>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Action buttons */}
            <View style={styles.btnRow}>
              {/* <TouchableOpacity
                style={[styles.startBtn, { backgroundColor: theme.primary }, (!currentLoc || steps.length === 0) && { opacity: 0.5 }]}
                onPress={startNavigation}
                disabled={!currentLoc || steps.length === 0}
                activeOpacity={0.85}
              >
                <FontAwesome5 name="route" size={16} color="#fff" />
                <ThemedText style={styles.startBtnText}>ابدأ الملاحة</ThemedText>
              </TouchableOpacity> */}

              <TouchableOpacity
                style={styles.gmapsBtn}
                onPress={openInGoogleMaps}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons name="google-maps" size={20} color={theme.primary} />
                <ThemedText style={[styles.gmapsBtnText, { color: theme.primary }]}>
                  خرائط جوجل
                </ThemedText>
              </TouchableOpacity>
            </View>

          </View>
        )}

        {/* ── Stop navigation button ── */}
        {(navigating || arrived) && (
          <View style={styles.stopRow}>
            <TouchableOpacity
              style={[styles.stopBtn, { borderColor: theme.primary }]}
              onPress={arrived ? onClose : stopNavigation}
              activeOpacity={0.85}
            >
              <Ionicons name={arrived ? 'close-circle-outline' : 'stop-circle-outline'} size={20} color={theme.primary} />
              <ThemedText style={[styles.stopBtnText, { color: theme.primary }]}>
                {arrived ? 'إغلاق' : 'إيقاف الملاحة'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </Modal>
  );
});

export default TaskMapModal;

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Header
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'ios' ? 52 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerBtn: { padding: 6 },

  // Floating close (during nav)
  floatingClose: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 12,
    left: 14,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  // Navigation banner
  navBanner: {
    paddingTop: Platform.OS === 'ios' ? 52 : 12,
    paddingBottom: 8,
    paddingHorizontal: 14,
    zIndex: 10,
  },
  navBannerInner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  navBannerIcon: { marginLeft: 4 },
  navBannerText: { flex: 1, alignItems: 'flex-end' },
  navInstruction: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'right',
  },
  navDist: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    textAlign: 'right',
  },
  muteBtn: { padding: 6 },
  nextStepRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopColor: 'rgba(255,255,255,0.25)',
    borderTopWidth: 1,
  },
  nextStepText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
  },

  // Arrived banner
  arrivedBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  arrivedText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  // Map
  mapWrap: { flex: 1 },

  // Loading / error
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontFamily: APP_FONT_FAMILY, fontSize: 14 },
  errorText: { fontFamily: APP_FONT_FAMILY, fontSize: 14, color: '#999', textAlign: 'center' },

  // Route loading badge
  routeBadge: {
    position: 'absolute',
    top: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  routeBadgeText: { fontFamily: APP_FONT_FAMILY, fontSize: 12, color: '#fff' },

  // Destination marker
  destMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // Bottom panel
  bottomPanel: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e4e6ea',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  summaryItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4 },
  summarySep: { width: 1, height: 16, backgroundColor: '#e4e6ea' },
  summaryVal: { fontFamily: APP_FONT_FAMILY, fontSize: 15, fontWeight: '700' },
  summaryDur: { fontFamily: APP_FONT_FAMILY, fontSize: 15, color: '#606770' },

  // Steps
  stepsToggle: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  stepsToggleText: { fontFamily: APP_FONT_FAMILY, fontSize: 13, fontWeight: '600' },
  stepsList: { maxHeight: 180 },
  stepRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  stepIconWrap: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stepInstruction: { flex: 1, fontFamily: APP_FONT_FAMILY, fontSize: 12, color: '#333', textAlign: 'right' },
  stepDist: { fontFamily: APP_FONT_FAMILY, fontSize: 11, color: '#888', minWidth: 44, textAlign: 'left' },

  // Action buttons
  btnRow: { flexDirection: 'row-reverse', gap: 10 },
  startBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  startBtnText: { fontFamily: APP_FONT_FAMILY, fontSize: 15, fontWeight: '700', color: '#fff' },
  gmapsBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e4e6ea',
  },
  gmapsBtnText: { fontFamily: APP_FONT_FAMILY, fontSize: 13, fontWeight: '600' },

  // Stop navigation
  stopRow: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e4e6ea',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  stopBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  stopBtnText: { fontFamily: APP_FONT_FAMILY, fontSize: 15, fontWeight: '600' },
});