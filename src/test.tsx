// import React, { useState } from "react";
// import "./src/assets/i18n/i18n";
// import { View, Text, Pressable } from "react-native";
// import { useTranslation } from "react-i18next";

// const App = () => {
//   const { t, i18n } = useTranslation();

//   const [currentLanguage, setLanguage] = useState("en");

//   const changeLanguage = (value: any) => {
//     i18n
//       .changeLanguage(value)
//       .then(() => setLanguage(value))
//       .catch((err) => console.log(err));
//   };

//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: "white",
//         alignItems: "center",
//         justifyContent: "space-evenly",
//       }}
//     >
//       <Text style={{ fontWeight: "bold", fontSize: 25, color: "#33A850" }}>
//         {t("hello")}{" "}
//       </Text>
//       <Text style={{ fontWeight: "bold", fontSize: 25, color: "#33A850" }}>
//         {t("this line is translated")}
//       </Text>
//       <Pressable
//         onPress={() => changeLanguage("en")}
//         style={{
//           backgroundColor: currentLanguage === "en" ? "#33A850" : "#d3d3d3",
//           padding: 20,
//         }}
//       >
//         <Text>Select English</Text>
//       </Pressable>
//       <Pressable
//         onPress={() => changeLanguage("hi")}
//         style={{
//           backgroundColor: currentLanguage === "hi" ? "#33A850" : "#d3d3d3",
//           padding: 20,
//         }}
//       >
//         <Text>हिंदी का चयन करें</Text>
//       </Pressable>
//     </View>
//   );
// };

// import React, { FC, useEffect, useRef, useMemo } from 'react';
// import { Text, StyleSheet } from 'react-native';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withRepeat,
//   withTiming,
//   Easing,
//   cancelAnimation,
// } from 'react-native-reanimated';

// interface WaveBannerProps {
//   paddingHorizontal?: number;
//   paddingVertical?: number;
//   top?: number;
//   right?: number;
//   fontSize?: number;
//   borderBottomLeftRadius?: number;
//   borderBottomRightRadius?: number;
// }

// const WaveBanner:FC<WaveBannerProps> = ({
//   paddingHorizontal = 3,    
//   paddingVertical = 1,
//   top = 3,
//   right = 5,
//   fontSize = 8,
//   borderBottomLeftRadius = 4,
//   borderBottomRightRadius = 4,
// }) => {
//   const opacity = useSharedValue(0);
//   const isAnimating = useRef(true);

//   useEffect(() => {
//     opacity.value = withRepeat(
//       withTiming(1, {
//         duration: 1000,
//         easing: Easing.inOut(Easing.ease),
//       }),
//       -1,
//       true,
//     );

//     const timeout = setTimeout(() => {
//       isAnimating.current = false;
//       cancelAnimation(opacity);
//       opacity.value = withTiming(1, { duration: 500 });
//     }, 4000);

//     return () => {
//       clearTimeout(timeout);
//       cancelAnimation(opacity);
//     };
//   }, []);

//   const animatedStyle = useAnimatedStyle(() => ({
//     opacity: opacity.value,
//     paddingHorizontal,
//     paddingVertical,
//     top,
//     right,
//     borderBottomLeftRadius,
//     borderBottomRightRadius,
//   }));

//   // Memoize the merged text style
//   const textStyle = useMemo(() => [styles.text, { fontSize }], [fontSize]);

//   return (
//     <Animated.View style={[styles.bannerBase, animatedStyle]}>
//       <Text style={textStyle}>{'Buy 1 Get 1'}</Text>
//     </Animated.View>
//   );
// };

// const styles = StyleSheet.create({
//   bannerBase: {
//     backgroundColor: '#6d71f9',
//     position: 'absolute',
//     zIndex: 1000,
//     borderColor: 'white',
//     borderWidth: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   text: {
//     color: 'white',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
// });

// // Wrap the component with React.memo for memoization
// const MemoizedWaveBanner = React.memo(WaveBanner);

// export default MemoizedWaveBanner;

import React, { FC, useMemo } from 'react';
import { Text, View, StyleSheet as StaticStyles } from 'react-native';

interface StaticWaveBannerProps {
  paddingHorizontal?: number;
  paddingVertical?: number;
  top?: number;
  right?: number;
  fontSize?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  showAnimation?: boolean;
}

const StaticWaveBanner: FC<StaticWaveBannerProps> = ({
  paddingHorizontal = 3,    
  paddingVertical = 1,
  top = 3,
  right = 5,
  fontSize = 8,
  borderBottomLeftRadius = 4,
  borderBottomRightRadius = 4,
  showAnimation = false,
}) => {
  const containerStyle = useMemo(() => [
    staticStyles.bannerBase,
    {
      paddingHorizontal,
      paddingVertical,
      top,
      right,
      borderBottomLeftRadius,
      borderBottomRightRadius,
    }
  ], [paddingHorizontal, paddingVertical, top, right, borderBottomLeftRadius, borderBottomRightRadius]);

  const textStyle = useMemo(() => [
    staticStyles.text,
    { fontSize }
  ], [fontSize]);

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>Buy 1 Get 1</Text>
    </View>
  );
};

const staticStyles = StaticStyles.create({
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

export default React.memo(StaticWaveBanner);

// ================================================================
// File: WaveBanner.tsx (Main Component with Conditional Rendering)


