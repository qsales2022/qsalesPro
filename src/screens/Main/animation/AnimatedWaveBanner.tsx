import React, { FC, useEffect, useRef, useMemo, useCallback } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';

interface AnimatedWaveBannerProps {
  paddingHorizontal?: number;
  paddingVertical?: number;
  top?: number;
  right?: number;
  fontSize?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
}

const AnimatedWaveBanner: FC<AnimatedWaveBannerProps> = ({
  paddingHorizontal = 3,    
  paddingVertical = 1,
  top = 3,
  right = 5,
  fontSize = 8,
  borderBottomLeftRadius = 4,
  borderBottomRightRadius = 4,
}) => {
  const opacity = useSharedValue(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  const staticStyles = useMemo(() => ({
    paddingHorizontal,
    paddingVertical,
    top,
    right,
    borderBottomLeftRadius,
    borderBottomRightRadius,
  }), [paddingHorizontal, paddingVertical, top, right, borderBottomLeftRadius, borderBottomRightRadius]);

  const textStyle = useMemo(() => [styles.text, { fontSize }], [fontSize]);

  const stopAnimation = useCallback(() => {
    if (isMountedRef.current) {
      cancelAnimation(opacity);
      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [opacity]);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 800,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        runOnJS(stopAnimation)();
      }
    }, 3000);

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }), []);

  const containerStyle = useMemo(() => [
    styles.bannerBase,
    staticStyles,
    animatedStyle,
  ], [staticStyles, animatedStyle]);

  return (
    <Animated.View style={containerStyle}>
      <Text style={textStyle}>Buy 1 Get 1</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerBase: {
    backgroundColor: '#6d71f9',
    position: 'absolute',
    zIndex: 1000,
    borderColor: 'white',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default React.memo(AnimatedWaveBanner);