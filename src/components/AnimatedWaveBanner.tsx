import React, { FC, useEffect, useRef, useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { getHeight, getWidth } from '../Theme/Constants';

interface WaveBannerProps {
  paddingHorizontal?: number;
  paddingVertical?: number;
  top?: number;
  right?: number;
  fontSize?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
}

const WaveBanner: FC<WaveBannerProps> = ({
  paddingHorizontal = 3,
  paddingVertical = 1,
  top = 3,
  right = 5,
  fontSize = 8,
  borderBottomLeftRadius = 4,
  borderBottomRightRadius = 4,
}) => {
  const opacity = useSharedValue(0);
  const isAnimating = useRef(true);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );

    const timeout = setTimeout(() => {
      isAnimating.current = false;
      cancelAnimation(opacity);
      opacity.value = withTiming(1, { duration: 500 });
    }, 4000);

    return () => {
      clearTimeout(timeout);
      cancelAnimation(opacity);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    paddingHorizontal,
    paddingVertical,
    top,
    right,
    borderBottomLeftRadius,
    borderBottomRightRadius,
  }));

  // Memoize the merged text style
  const textStyle = useMemo(() => [styles.text, { fontSize }], [fontSize]);

  return (
    <Animated.View style={[styles.bannerBase, animatedStyle]}>
      <Text style={textStyle}>{'Buy 1 Get 1'}</Text>
    </Animated.View>
  );
};

const MemoizedWaveBanner = React.memo(WaveBanner);

export default MemoizedWaveBanner;

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
