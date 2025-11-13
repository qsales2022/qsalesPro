// import React, { useEffect, useMemo } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   withSpring,
//   withRepeat,
//   withSequence,
//   Easing,
// } from 'react-native-reanimated';
// import Colors from '../../Theme/Colors';
// import { formatPrice } from '../../Utils';
// import { getWidth } from '../../Theme/Constants';

// interface ProgressBarProps {
//   currentAmount: number;
//   freeDeliveryThreshold: number;
//   freeGiftThreshold: number;
//   currency: string;
//   onReachDelivery?: () => void;
//   onReachGift?: () => void;
// }

// const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

// const ProgressBar: React.FC<ProgressBarProps> = ({
//   currentAmount,
//   freeDeliveryThreshold,
//   freeGiftThreshold,
//   currency,
//   onReachDelivery,
//   onReachGift,
// }) => {
//   // Normalize/guard thresholds
//   const { safeDelivery, safeGift } = useMemo(() => {
//     const d = Math.max(0, freeDeliveryThreshold || 0);
//     const g = Math.max(0, freeGiftThreshold || 0);
//     const gFixed = Math.max(g, d);
//     return { safeDelivery: d, safeGift: gFixed };
//   }, [freeDeliveryThreshold, freeGiftThreshold]);

//   const progress = useSharedValue(0);
//   const deliveryCheckScale = useSharedValue(0);
//   const giftCheckScale = useSharedValue(0);
//   const badgePulse = useSharedValue(1);

//   // Total progress based on gift threshold (right edge)
//   const totalProgress = useMemo(() => {
//     if (safeGift === 0) return 100;
//     return clamp((currentAmount / safeGift) * 100, 0, 100);
//   }, [currentAmount, safeGift]);

//   const deliveryReached = currentAmount >= safeDelivery && safeDelivery > 0;
//   const giftReached = currentAmount >= safeGift && safeGift > 0;

//   const remainingForDelivery = Math.max(safeDelivery - currentAmount, 0);
//   const remainingForGift = Math.max(safeGift - currentAmount, 0);

//   const showDeliveryMessage = safeDelivery > 0 && currentAmount < safeDelivery;
//   const showGiftMessage = deliveryReached && !giftReached && safeGift > 0;
//   const showCompletedMessage = giftReached || (safeGift === 0 && currentAmount >= 0);

//   // Animate progress bar
//   useEffect(() => {
//     progress.value = withTiming(totalProgress, {
//       duration: 800,
//       easing: Easing.bezier(0.25, 0.1, 0.25, 1),
//     });
//   }, [totalProgress]);

//   // Animate delivery checkpoint
//   useEffect(() => {
//     if (deliveryReached) {
//       deliveryCheckScale.value = withSequence(
//         withSpring(1.2, { damping: 8, stiffness: 100 }),
//         withSpring(1, { damping: 8, stiffness: 100 })
//       );
//       onReachDelivery?.();
//     } else {
//       deliveryCheckScale.value = 0;
//     }
//   }, [deliveryReached]);

//   // Animate gift checkpoint
//   useEffect(() => {
//     if (giftReached) {
//       giftCheckScale.value = withSequence(
//         withSpring(1.2, { damping: 8, stiffness: 100 }),
//         withSpring(1, { damping: 8, stiffness: 100 })
//       );
//       onReachGift?.();
//     } else {
//       giftCheckScale.value = 0;
//     }
//   }, [giftReached]);

//   // Animate badge pulse
//   useEffect(() => {
//     badgePulse.value = withRepeat(
//       withSequence(
//         withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
//         withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
//       ),
//       -1,
//       true
//     );
//   }, []);

//   // Animated styles
//   const progressStyle = useAnimatedStyle(() => ({
//     width: `${progress.value}%`,
//   }));

//   const deliveryCheckStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: deliveryCheckScale.value }],
//     opacity: deliveryCheckScale.value,
//   }));

//   const giftCheckStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: giftCheckScale.value }],
//     opacity: giftCheckScale.value,
//   }));

//   const badgeStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: badgePulse.value }],
//   }));

//   const fmt = (v: number) => `${currency}${formatPrice(v)}`;

//   return (
//     <View
//       style={styles.container}
//       accessibilityRole="progressbar"
//       accessibilityValue={{ now: totalProgress, min: 0, max: 100 }}
//       accessibilityLabel="Cart progress towards free delivery and free gift"
//     >
//       {/* Message */}
//       <View style={styles.messageContainer}>
//         {showDeliveryMessage && (
//           <Text style={styles.messageText}>
//             Add <Text style={styles.amountText}>{fmt(remainingForDelivery)}</Text> more for free delivery!
//           </Text>
//         )}
//         {showGiftMessage && (
//           <Text style={styles.messageText}>
//             Add <Text style={styles.amountText}>{fmt(remainingForGift)}</Text> more for a free mystery gift!
//           </Text>
//         )}
//         {showCompletedMessage && (
//           <Text style={[styles.messageText, styles.completedText]}>
//             🎉 You&apos;ve unlocked free delivery and a free gift!
//           </Text>
//         )}
//       </View>

//       {/* Current Amount Badge */}
//       <Animated.View style={[styles.currentAmountBadge, badgeStyle]}>
//         <Text style={styles.currentAmountText}>{fmt(Math.floor(currentAmount))}</Text>
//       </Animated.View>

//       {/* Progress Bar Container */}
//       <View style={styles.progressBarContainer}>
//         {/* Background Track */}
//         <View style={styles.progressTrack}>
//           {/* Filled Progress */}
//           <Animated.View style={[styles.progressFill, progressStyle]} />

//           {/* Delivery Checkpoint (CENTERED at 50%) */}
//           {safeDelivery > 0 && (
//             <View
//               style={styles.checkpointCenter}
//               accessibilityLabel="Free delivery"
//             >
//               <View
//                 style={[
//                   styles.checkpointCircle,
//                   deliveryReached && styles.checkpointActive,
//                 ]}
//               >
//                 {deliveryReached && (
//                   <Animated.View style={[styles.checkmarkContainer, deliveryCheckStyle]}>
//                     <Text style={styles.checkmarkText}>✓</Text>
//                   </Animated.View>
//                 )}
//               </View>
//               <View style={styles.iconContainer}>
//                 <Text style={styles.iconText}>🚚</Text>
//               </View>
//             </View>
//           )}

//           {/* Gift Checkpoint (RIGHT EDGE at 100%) */}
//           {safeGift > 0 && (
//             <View style={styles.checkpointRight} accessibilityLabel="Free gift">
//               <View
//                 style={[
//                   styles.checkpointCircle,
//                   giftReached && styles.checkpointActive,
//                 ]}
//               >
//                 {giftReached && (
//                   <Animated.View style={[styles.checkmarkContainer, giftCheckStyle]}>
//                     <Text style={styles.checkmarkText}>✓</Text>
//                   </Animated.View>
//                 )}
//               </View>
//               <View style={styles.iconContainer}>
//                 <Text style={styles.iconText}>🎁</Text>
//               </View>
//             </View>
//           )}
//         </View>
//       </View>

//       {/* Labels */}
//       <View style={styles.labelsContainer}>
//         {safeDelivery > 0 && (
//           <View style={styles.labelItemCenter}>
//             <Text style={[styles.labelText, deliveryReached && styles.labelActive]}>Free Delivery</Text>
//             <Text style={styles.labelAmount}>{fmt(safeDelivery)}</Text>
//           </View>
//         )}
//         {safeGift > 0 && (
//           <View style={styles.labelItemRight}>
//             <Text style={[styles.labelText, giftReached && styles.labelActive]}>Free Gift</Text>
//             <Text style={styles.labelAmount}>{fmt(safeGift)}</Text>
//           </View>
//         )}
//       </View>
//     </View>
//   );
// };

// export default ProgressBar;

// const CIRCLE_SIZE = 20;

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'transparent',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//   },
//   messageContainer: {
//     marginBottom: 12,
//   },
//   messageText: {
//     fontSize: 13,
//     color: Colors.black,
//     textAlign: 'left',
//     fontWeight: '500',
//   },
//   amountText: {
//     fontWeight: '700',
//     color: Colors.primary,
//     fontSize: 14,
//   },
//   completedText: {
//     color: Colors.primary,
//     fontWeight: '600',
//   },
//   currentAmountBadge: {
//     position: 'absolute',
//     top: 25,
//     right: 16,
//     backgroundColor: Colors.black,
//     paddingHorizontal: getWidth(890),
//     paddingVertical: getWidth(790),
//     borderRadius: 20,
//     zIndex: 10,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   currentAmountText: {
//     color: Colors.white,
//     fontSize: 12,
//     fontWeight: '700',
//   },
//   progressBarContainer: {
//     marginBottom: 28,
//     paddingVertical: 4,
//   },
//   progressTrack: {
//     height: 8,
//     backgroundColor: '#e0e0e0',
//     borderRadius: 10,
//     position: 'relative',
//     overflow: 'visible',
//   },
//   progressFill: {
//     height: '100%',
//     backgroundColor: Colors.primary,
//     borderRadius: 10,
//     position: 'absolute',
//     left: 0,
//     top: 0,
//   },
//   // Centered checkpoint (50% position)
//   checkpointCenter: {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: [{ translateX: -CIRCLE_SIZE / 2 }, { translateY: -CIRCLE_SIZE / 2 }],
//     alignItems: 'center',
//   },
//   // Right-pinned checkpoint (100% position)
//   checkpointRight: {
//     position: 'absolute',
//     top: '50%',
//     right: 0,
//     transform: [{ translateX: CIRCLE_SIZE / 2 * -1 }, { translateY: -CIRCLE_SIZE / 2 }],
//     alignItems: 'center',
//   },
//   checkpointCircle: {
//     width: CIRCLE_SIZE,
//     height: CIRCLE_SIZE,
//     borderRadius: CIRCLE_SIZE / 2,
//     backgroundColor: '#e0e0e0',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 3,
//     borderColor: Colors.white,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 2,
//   },
//   checkpointActive: {
//     backgroundColor: Colors.primary,
//     borderColor: Colors.primary,
//   },
//   checkmarkContainer: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   checkmarkText: {
//     color: Colors.white,
//     fontSize: 11,
//     fontWeight: 'bold',
//   },
//   iconContainer: {
//     marginTop: 6,
//     alignItems: 'center',
//   },
//   iconText: {
//     fontSize: 18,
//   },
//   labelsContainer: {
//     position: 'relative',
//     marginTop: 4,
//     height: 32,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   // Centered label
//   labelItemCenter: {
//     position: 'absolute',
//     left: '50%',
//     transform: [{ translateX: -40 }],
//     alignItems: 'center',
//     width: 80,
//   },
//   // Right-aligned label
//   labelItemRight: {
//     position: 'absolute',
//     right: 0,
//     alignItems: 'center',
//     width: 80,
//     transform: [{ translateX: 20 }],
//   },
//   labelText: {
//     fontSize: 11,
//     color: '#666',
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   labelActive: {
//     color: Colors.primary,
//   },
//   labelAmount: {
//     fontSize: 10,
//     color: '#999',
//     marginTop: 2,
//     textAlign: 'center',
//   },
// });

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  withDelay,
} from 'react-native-reanimated';
import Colors from '../../Theme/Colors';
import { formatPrice } from '../../Utils';
import { getHeight, getWidth } from '../../Theme/Constants';

interface ProgressBarProps {
  currentAmount: number;
  freeDeliveryThreshold: number;
  freeGiftThreshold: number;
  currency: string;
  onReachDelivery?: () => void;
  onReachGift?: () => void;
  giftImageUrl?: any;
  giftName?: string;
  giftAmount?: number
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentAmount,
  freeDeliveryThreshold,
  freeGiftThreshold,
  currency,
  onReachDelivery,
  onReachGift,
  giftImageUrl = 'https://via.placeholder.com/80x80/FF6B6B/FFFFFF?text=Gift',
  giftName = 'Mystery Gift',
  giftAmount = 0
}) => {
  const { safeDelivery, safeGift } = useMemo(() => {
    const d = Math.max(0, freeDeliveryThreshold || 0);
    const g = Math.max(0, freeGiftThreshold || 0);
    const gFixed = Math.max(g, d);
    return { safeDelivery: d, safeGift: gFixed };
  }, [freeDeliveryThreshold, freeGiftThreshold]);

  const progress = useSharedValue(0);
  const deliveryCheckScale = useSharedValue(0);
  const giftCheckScale = useSharedValue(0);
  const badgePulse = useSharedValue(1);
  const giftCardScale = useSharedValue(0);
  const giftCardOpacity = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const saveScale = useSharedValue(0);


  const totalProgress = useMemo(() => {
    if (safeGift === 0) return 100;
    return clamp((currentAmount / safeGift) * 100, 0, 100);
  }, [currentAmount, safeGift]);

  const deliveryReached = currentAmount >= safeDelivery && safeDelivery > 0;
  const giftReached = currentAmount >= safeGift && safeGift > 0;

  const remainingForDelivery = Math.max(safeDelivery - currentAmount, 0);
  const remainingForGift = Math.max(safeGift - currentAmount, 0);

  const showDeliveryMessage = safeDelivery > 0 && currentAmount < safeDelivery;
  const showGiftMessage = deliveryReached && !giftReached && safeGift > 0;
  const showCompletedMessage = giftReached || (safeGift === 0 && currentAmount >= 0);
  const showGiftPreview = currentAmount > 0 && safeGift > 0;

  useEffect(() => {
    progress.value = withTiming(totalProgress, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [totalProgress]);

  useEffect(() => {
    if (deliveryReached) {
      deliveryCheckScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
      onReachDelivery?.();
    } else {
      deliveryCheckScale.value = 0;
    }
  }, [deliveryReached]);

  useEffect(() => {
    if (giftReached) {
      giftCheckScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 100 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
      onReachGift?.();
    } else {
      giftCheckScale.value = 0;
    }
  }, [giftReached]);

  useEffect(() => {
    badgePulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (showGiftPreview) {
      giftCardScale.value = withSpring(1, { damping: 12, stiffness: 100 });
      giftCardOpacity.value = withTiming(1, { duration: 400 });
    } else {
      giftCardScale.value = withTiming(0, { duration: 300 });
      giftCardOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [showGiftPreview]);

  useEffect(() => {
    if (showCompletedMessage) {
      opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
    } else {
      opacity.value = withTiming(6, { duration: 400, easing: Easing.in(Easing.ease) });
      scale.value = withTiming(6, { duration: 300 });
    }
  }, [showCompletedMessage])
  useEffect(() => {
    saveScale.value = withRepeat(
      withSequence(
        withSpring(1, {
          damping: 8,
          stiffness: 150,
          mass: 0.5
        }),
        withDelay(2500, withTiming(1)),
        withSpring(0.6, {
          damping: 12,
          stiffness: 200
        }),
        withDelay(800, withTiming(0))
      ),
      -1,
      false
    );
  }, []);


  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const deliveryCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deliveryCheckScale.value }],
    opacity: deliveryCheckScale.value,
  }));

  const giftCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: giftCheckScale.value }],
    opacity: giftCheckScale.value,
  }));
  const unlockedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));



  const giftCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: giftCardScale.value }],
    opacity: giftCardOpacity.value,
  }));

  const saveStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: saveScale.value }
    ]
  }));

  const fmt = (v: number) => `${currency}${formatPrice(v)}`;

  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: totalProgress, min: 0, max: 100 }}
      accessibilityLabel="Cart progress towards free delivery and free gift"
    >
      <View style={styles.messageContainer}>
        {showDeliveryMessage && (
          <Text style={styles.messageText}>
            Add <Text style={styles.amountText}>{fmt(remainingForDelivery)}</Text> more for free delivery!
          </Text>
        )}
        {showGiftMessage && (
          <Text style={styles.messageText}>
            Add <Text style={styles.amountText}>{fmt(remainingForGift)}</Text> more to unlock your free gift!
          </Text>
        )}
        {showCompletedMessage && (
          <Text style={[styles.messageText, styles.completedText]}>
            🎉 You&apos;ve unlocked free delivery and a free gift!
          </Text>
        )}
      </View>

      {showGiftPreview && (
        <Animated.View style={[styles.giftPreviewCard, giftCardStyle]}>
          <View style={styles.giftPreviewContent}>
            <View style={styles.giftImageContainer}>
              <Image
                source={{ uri: giftImageUrl }}
                style={styles.giftImage}
                resizeMode="cover"
              />
              {/* {!giftReached && (
                <View style={styles.lockedOverlay}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              )} */}
            </View>
            <View style={styles.giftTextContainer}>
              <Text style={styles.giftTitle}>{giftName}</Text>

              <Text style={styles.giftSubtitle}>
                {giftReached ? (
                  <Animated.View style={unlockedStyle}>
                    <Text style={styles.unlockedText}>✓ Unlocked!</Text>
                    <Animated.View style={[{
                      backgroundColor: "red", borderRadius: getWidth(10), marginTop: 4, paddingHorizontal: getWidth(30), paddingVertical: getHeight(1000)
                    }, saveStyle]}>
                      <Text style={{ fontSize: getWidth(30), color: "white", fontWeight: "bold" }}>You Saved {giftAmount}!</Text>
                    </Animated.View>
                  </Animated.View>

                ) : (
                  <>
                    Spend <Text style={styles.remainingAmount}>{fmt(remainingForGift)}</Text> more
                  </>
                )}
              </Text>

            </View>
          </View>
        </Animated.View>
      )}

      {/* <Animated.View style={[styles.currentAmountBadge, badgeStyle]}>
        <Text style={styles.currentAmountText}>{fmt(Math.floor(currentAmount))}</Text>
      </Animated.View> */}

      <View style={styles.progressBarContainer}>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, progressStyle]} />

          {safeDelivery > 0 && (
            <View
              style={styles.checkpointCenter}
              accessibilityLabel="Free delivery"
            >
              <View
                style={[
                  styles.checkpointCircle,
                  deliveryReached && styles.checkpointActive,
                ]}
              >
                {deliveryReached && (
                  <Animated.View style={[styles.checkmarkContainer, deliveryCheckStyle]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </Animated.View>
                )}
              </View>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🚚</Text>
              </View>
            </View>
          )}

          {safeGift > 0 && (
            <View style={styles.checkpointRight} accessibilityLabel="Free gift">
              <View
                style={[
                  styles.checkpointCircle,
                  giftReached && styles.checkpointActive,
                ]}
              >
                {giftReached && (
                  <Animated.View style={[styles.checkmarkContainer, giftCheckStyle]}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </Animated.View>
                )}
              </View>
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>🎁</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={styles.labelsContainer}>
        {safeDelivery > 0 && (
          <View style={styles.labelItemCenter}>
            <Text style={[styles.labelText, deliveryReached && styles.labelActive]}>Free Delivery</Text>
            <Text style={styles.labelAmount}>{fmt(safeDelivery)}</Text>
          </View>
        )}
        {safeGift > 0 && (
          <View style={styles.labelItemRight}>
            <Text style={[styles.labelText, giftReached && styles.labelActive]}>Free Gift</Text>
            <Text style={styles.labelAmount}>{fmt(safeGift)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProgressBar;

const CIRCLE_SIZE = 20;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageText: {
    fontSize: 13,
    color: Colors.black,
    textAlign: 'left',
    fontWeight: '500',
  },
  amountText: {
    fontWeight: '700',
    color: Colors.primary,
    fontSize: 14,
  },
  completedText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  giftPreviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  giftPreviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  giftImage: {
    width: '100%',
    height: '100%',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 24,
  },
  giftTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  giftTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 4,
  },
  giftSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  remainingAmount: {
    color: Colors.primary,
    fontWeight: '700',
  },
  unlockedText: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  currentAmountBadge: {
    position: 'absolute',
    top: 25,
    right: 16,
    backgroundColor: Colors.black,
    paddingHorizontal: getWidth(890),
    paddingVertical: getWidth(790),
    borderRadius: 20,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  currentAmountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: 28,
    paddingVertical: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    position: 'relative',
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  checkpointCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -CIRCLE_SIZE / 2 }, { translateY: -CIRCLE_SIZE / 2 }],
    alignItems: 'center',
  },
  checkpointRight: {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: [{ translateX: CIRCLE_SIZE / 2 * -1 }, { translateY: -CIRCLE_SIZE / 2 }],
    alignItems: 'center',
  },
  checkpointCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  checkpointActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmarkContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  iconContainer: {
    marginTop: 6,
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  labelsContainer: {
    position: 'relative',
    marginTop: 4,
    height: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelItemCenter: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -40 }],
    alignItems: 'center',
    width: 80,
  },
  labelItemRight: {
    position: 'absolute',
    right: 0,
    alignItems: 'center',
    width: 80,
    transform: [{ translateX: 20 }],
  },
  labelText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.primary,
  },
  labelAmount: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
});