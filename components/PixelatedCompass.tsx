import { View, StyleSheet, Animated, useEffect } from 'react-native';
import { useRef } from 'react';

interface PixelatedCompassProps {
  rotation: number;
}

export default function PixelatedCompass({ rotation }: PixelatedCompassProps) {
  const rotationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(rotationValue, {
      toValue: rotation,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [rotation, rotationValue]);

  const animatedStyle = {
    transform: [
      {
        rotate: rotationValue.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.compassRing}>
        <View style={styles.compassRingInner}>
          <Animated.View style={[styles.needleContainer, animatedStyle]}>
            <View style={styles.needle}>
              <View style={styles.needleNorth} />
              <View style={styles.needleSouth} />
            </View>
          </Animated.View>

          <View style={styles.centerDot} />
        </View>
      </View>

      <View style={styles.markersContainer}>
        <View style={[styles.marker, styles.markerN]} />
        <View style={[styles.marker, styles.markerE]} />
        <View style={[styles.marker, styles.markerS]} />
        <View style={[styles.marker, styles.markerW]} />
      </View>
    </View>
  );
}

const COMPASS_SIZE = 280;
const RING_WIDTH = 8;
const NEEDLE_LENGTH = COMPASS_SIZE / 2 - 40;
const PIXEL_SIZE = 4;

const styles = StyleSheet.create({
  container: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassRing: {
    width: COMPASS_SIZE,
    height: COMPASS_SIZE,
    borderRadius: 0,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: RING_WIDTH,
    borderColor: '#444',
  },
  compassRingInner: {
    width: COMPASS_SIZE - RING_WIDTH * 4,
    height: COMPASS_SIZE - RING_WIDTH * 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  needleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  needle: {
    width: PIXEL_SIZE * 3,
    height: NEEDLE_LENGTH * 2,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  needleNorth: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: PIXEL_SIZE * 1.5,
    borderRightWidth: PIXEL_SIZE * 1.5,
    borderBottomWidth: NEEDLE_LENGTH - 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FF4444',
  },
  needleSouth: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: PIXEL_SIZE * 1.5,
    borderRightWidth: PIXEL_SIZE * 1.5,
    borderTopWidth: NEEDLE_LENGTH - 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#999',
  },
  centerDot: {
    width: PIXEL_SIZE * 4,
    height: PIXEL_SIZE * 4,
    backgroundColor: '#FFF',
    position: 'absolute',
  },
  markersContainer: {
    position: 'absolute',
    width: COMPASS_SIZE + 20,
    height: COMPASS_SIZE + 20,
  },
  marker: {
    position: 'absolute',
    width: PIXEL_SIZE * 2,
    height: PIXEL_SIZE * 2,
    backgroundColor: '#666',
  },
  markerN: {
    top: 0,
    left: '50%',
    marginLeft: -PIXEL_SIZE,
  },
  markerE: {
    right: 0,
    top: '50%',
    marginTop: -PIXEL_SIZE,
  },
  markerS: {
    bottom: 0,
    left: '50%',
    marginLeft: -PIXEL_SIZE,
  },
  markerW: {
    left: 0,
    top: '50%',
    marginTop: -PIXEL_SIZE,
  },
});
