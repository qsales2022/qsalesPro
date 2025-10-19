import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function OfferModal() {
  const [timeLeft, setTimeLeft] = useState({
    days: 10,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bellAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the badge
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Bell bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bellAnim, {
          toValue: -10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bellAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Set end date to 10 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const TimeBox = ({ value, label }: any) => (
    <View style={styles.timeBoxContainer}>
      <View style={styles.timeBox}>
        <View style={styles.timeBoxGradient}>
          <Text style={styles.timeValue}>{String(value).padStart(2, '0')}</Text>
        </View>
      </View>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.wrapper}>
        {/* Header Badge */}

        {/* Main Card */}
        <View style={styles.card}>
          {/* <Animated.View
            style={[
              styles.badgeContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.badge}>
              <Animated.Text
                style={[
                  styles.bellIcon,
                  { transform: [{ translateY: bellAnim }] },
                ]}
              >
                🔔
              </Animated.Text>
              <Text style={styles.badgeText}>LIMITED TIME ONLY</Text>
            </View>
          </Animated.View> */}
          {/* Decorative Top Bar */}
          <View style={styles.topBar} />

          <View style={styles.cardContent}>
            {/* Title */}
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.zapIcon}></Text>
                <Text style={styles.title}>Ringing Out Offer</Text>
                <Text style={styles.zapIcon}></Text>
              </View>
              <Text style={styles.subtitle}>
                Don't miss out on this amazing deal!
              </Text>
            </View>

            {/* Countdown Timer */}
            <View style={styles.timerContainer}>
              <TimeBox value={timeLeft.days} label="DAYS" />
              <TimeBox value={timeLeft.hours} label="HOURS" />
              <TimeBox value={timeLeft.minutes} label="MINUTES" />
              <TimeBox value={timeLeft.seconds} label="SECONDS" />
            </View>

            {/* Offer Details */}
            {/* <View style={styles.offerDetails}>
              <Text style={styles.timerIcon}>⏰</Text>
              <View style={styles.offerTextContainer}>
                <Text style={styles.offerTitle}>
                  Special Discount Available
                </Text>
                <Text style={styles.offerDescription}>
                  Get up to <Text style={styles.highlightText}>50% OFF</Text> on
                  all premium features. This exclusive offer expires in 10 days!
                </Text>
              </View>
            </View> */}

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.button}
              activeOpacity={0.8}
              onPress={() => console.log('Claim offer pressed')}
            >
              <View style={styles.buttonGradient}>
                <Text style={styles.buttonText}>Claim Your Offer Now</Text>
              </View>
            </TouchableOpacity>

            {/* Footer Note */}
            {/* <Text style={styles.footerText}>
              Offer valid for new and existing customers
            </Text> */}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  wrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCD34D',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bellIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  badgeText: {
    color: '#78350F',
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  topBar: {
    height: 6,
    backgroundColor: '#9333EA',
  },
  cardContent: {
    padding: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  zapIcon: {
    fontSize: 32,
    marginHorizontal: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#9333EA',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
  },
  timeBoxContainer: {
    alignItems: 'center',
  },
  timeBox: {
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timeBoxGradient: {
    backgroundColor: '#9333EA',
    borderRadius: 16,
    padding: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timeLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
  },
  offerDetails: {
    flexDirection: 'row',
    backgroundColor: '#F3E8FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  timerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  offerTextContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#9333EA',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    backgroundColor: '#9333EA',
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 16,
  },
});
