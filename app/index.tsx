import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import PixelatedCompass from '@/components/PixelatedCompass';
import {
  calculateBearing,
  calculateDistance,
  getCoordinatesFromAddress,
} from '@/utils/compassUtils';

export default function BlockPath() {
  const [heading, setHeading] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [targetLocation, setTargetLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [targetBearing, setTargetBearing] = useState<number | null>(null);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 5,
        },
        (location) => {
          setCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      );
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const subscription = Magnetometer.addListener((data) => {
      const { x, y } = data;
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = angle < 0 ? angle + 360 : angle;
      setHeading(angle);
    });

    Magnetometer.setUpdateInterval(100);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (currentLocation && targetLocation) {
      const bearing = calculateBearing(
        currentLocation.latitude,
        currentLocation.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      );
      const dist = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        targetLocation.latitude,
        targetLocation.longitude
      );
      setTargetBearing(bearing);
      setDistance(dist);
    } else {
      setTargetBearing(null);
      setDistance(null);
    }
  }, [currentLocation, targetLocation]);

  const handleLocationSubmit = async () => {
    if (!locationInput.trim()) {
      setTargetLocation(null);
      return;
    }

    try {
      const coords = await getCoordinatesFromAddress(locationInput);
      if (coords) {
        setTargetLocation(coords);
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  const compassRotation = targetBearing !== null ? targetBearing - heading : 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>BLOCKPATH</Text>

        <TextInput
          style={styles.input}
          value={locationInput}
          onChangeText={setLocationInput}
          onSubmitEditing={handleLocationSubmit}
          placeholder="Enter destination..."
          placeholderTextColor="#444"
          returnKeyType="go"
        />

        <View style={styles.compassContainer}>
          <PixelatedCompass rotation={compassRotation} />
        </View>

        <View style={styles.infoContainer}>
          {currentLocation && (
            <Text style={styles.infoText}>
              CURRENT: {currentLocation.latitude.toFixed(4)},{' '}
              {currentLocation.longitude.toFixed(4)}
            </Text>
          )}
          {targetLocation && (
            <>
              <Text style={styles.infoText}>
                TARGET: {targetLocation.latitude.toFixed(4)},{' '}
                {targetLocation.longitude.toFixed(4)}
              </Text>
              {distance && (
                <Text style={styles.infoText}>
                  DISTANCE: {distance.toFixed(2)} km
                </Text>
              )}
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 30,
    letterSpacing: 4,
  },
  input: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    color: '#FFFFFF',
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#444',
    padding: 15,
    marginBottom: 40,
  },
  compassContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  infoContainer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  infoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#999',
    marginVertical: 4,
    letterSpacing: 1,
  },
});
