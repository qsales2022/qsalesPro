/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import Colors from '../../../Theme/Colors';
import { getHeight, getWidth, lightenColor } from '../../../Theme/Constants';
import CommonStyles from '../../../Theme/CommonStyles';
import { CartItem } from '../../../components';
import screens from '../../../Navigation/screens';
import { useCheckout, useGetCart } from '../../../Api/hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { updateSelectedTab } from '../../../redux/reducers/GlobalReducer';
import { Toast } from 'react-native-toast-message/lib/src/Toast';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../../Utils';
import CartSeklton from './CartSeklton';
import useChekoutUrl from '../../../Api/hooks/useChekoutUrl';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import ProgressBar from '../../../components/progressBar/ProgressBar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getMulti, STORAGE_KEYS } from '../../../AsyncStorage/StorageUtil';


// Define thresholds
const FREE_DELIVERY_THRESHOLD = 35;
const FREE_GIFT_THRESHOLD = 49;

const Cart = ({ navigation }: any) => {
  const { cartDetails, getCartData, loading }: any = useGetCart();
  const [checkoutId, setCheckoutId] = useState<any>('');
  const isFocused = useIsFocused();
  const { checkout, checkoutWithShipping }: any = useCheckout();
  const { checkoutUrl, createChekout }: any = useChekoutUrl();
  const [checkLoading, setCheckLoading] = useState<boolean>(false);
  const [eventId, setEventId] = useState('');
  const [totalDiscount, setTotalDiscount] = useState(0);
  const [eventPrice, setEventPrice] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [showGiftAnimation, setShowGiftAnimation] = useState(false);

  // Use ref to track previous amount and avoid re-showing animation
  const previousAmountRef = useRef(0);
  const animationOpacity = useRef(new Animated.Value(0)).current;
  const animationScale = useRef(new Animated.Value(0.5)).current;

  const dispatch = useDispatch();
  const { t } = useTranslation();

  // Check if gift threshold is met

  const getCheckoutId = async () => {
    try {
      const value = await AsyncStorage.getItem('checkoutId');
      if (value !== null) {
        setCheckoutId(value);
      }
    } catch (e) {
      // error reading value
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      getCartData();
    }, 1000);
    return () => clearTimeout(timer);
  }, [cartDetails])

  useEffect(() => {
    getCheckoutId();
  }, []);

  useEffect(() => {
    const calculateTotalDiscount = (lines: any) => {
      return lines?.reduce((acc: any, line: any) => {
        const lineDiscount = line?.node?.discountAllocations?.reduce(
          (sum: any, allocation: any) =>
            sum + parseFloat(allocation?.discountedAmount?.amount),
          0,
        );
        return acc + lineDiscount;
      }, 0);
    };

    const discount = calculateTotalDiscount(cartDetails?.cart?.lines?.edges);
    setTotalDiscount(discount);
  }, [cartDetails]);

  useEffect(() => {
    if (isFocused) {
      dispatch(updateSelectedTab(2));
      getCartData();
    }
  }, [isFocused]);

  const next = () => {
    setCheckLoading(true);
    checkoutWithShipping('', '', '', '', '', '');
  };

  useEffect(() => {
    const handleCheckout = async () => {
      if (!checkoutId) return;
      if (checkout) {
        const url = await createChekout(checkoutId);
        if (url) {
          setCheckLoading(false);
          navigation.navigate(screens.payment, { url, eventPrice, eventId });
        }
      }
    };
    handleCheckout();
  }, [checkout]);

  useEffect(() => {

    const screenName =
      navigation.getState().routes[navigation.getState().index]?.name;
    AppEventsLogger.logEvent('fb_mobile_content_view', {
      content_name: screenName,
      content_type: 'screen',
    });
  }, []);

  // Trigger animation when threshold is crossed
  const triggerGiftAnimation = () => {
    setShowGiftAnimation(true);

    // Reset animation values
    animationOpacity.setValue(0);
    animationScale.setValue(0.5);

    // Animate in
    Animated.parallel([
      Animated.timing(animationOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(animationScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after animation completes (3 seconds total)
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(animationOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animationScale, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowGiftAnimation(false);
      });
    }, 2700);
  };

  useEffect(() => {
    const mapData = cartDetails?.cart?.lines?.edges?.map((val: any, i: any) => {
      return val?.node?.merchandise?.id;
    });
    setEventId(mapData);

    const amount = parseFloat(cartDetails?.cart?.cost?.totalAmount?.amount || 0);
    const previousAmount = previousAmountRef.current;

    setCurrentAmount(amount);
    setEventPrice(amount);

    // Show gift animation only when crossing threshold from below
    if (
      previousAmount < FREE_GIFT_THRESHOLD &&
      amount >= FREE_GIFT_THRESHOLD &&
      amount > 0
    ) {
      triggerGiftAnimation();
    }

    // Update previous amount
    previousAmountRef.current = amount;
  }, [cartDetails]);

  return (
    <SafeAreaProvider style={styles.container}>
      <LinearGradient
        colors={[
          lightenColor(Colors.primary, 50),
          lightenColor(Colors.primary, 90),
        ]}
        style={{ minWidth: getWidth(1), minHeight: getHeight(8) }}
      >
        <View
          style={[
            CommonStyles.flexRowContainer,
            {
              marginTop:
                Platform.OS == 'android' ? getHeight(30) : getHeight(20),
              marginBottom: getHeight(80),
            },
          ]}
        >
          <Text
            style={{
              color: Colors.black,
              fontSize: getHeight(35),
              marginRight: 10,
              alignSelf: 'center',
              marginLeft: 16,
            }}
          >
            {t('cart')}
          </Text>

          <View
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 100,
              height: getHeight(35),
              minWidth: getHeight(25),
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}
          >
            <Text style={styles.badgeText}>
              {cartDetails?.cart?.lines?.edges?.length || 0}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Progress Bar Component - Only show when cart has items */}
      {cartDetails?.cart?.lines?.edges?.length > 0 && (
        <ProgressBar
          currentAmount={currentAmount}
          freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
          freeGiftThreshold={FREE_GIFT_THRESHOLD}
          currency={cartDetails?.cart?.cost?.totalAmount?.currencyCode || 'USD'}
        />
      )}

      {!loading ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={cartDetails?.cart?.lines?.edges}
          renderItem={({ item, index }: any) => {
            return (
              <CartItem
                key={index}
                product={item?.node}
                checkoutId={checkoutId}
                updateCallBack={() => {
                  getCartData();
                }}
                removedCallBack={() => {
                  Toast.show({
                    type: 'success',
                    text1: `${t('cartItemRemoved')}`,
                    position: 'bottom',
                  });
                  getCartData();
                }}
                totalAmount={cartDetails?.cart?.cost?.totalAmount?.amount}
              />
            );
          }}
          ListEmptyComponent={() => {
            return (
              <View
                style={{
                  height: getHeight(1.2),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <LottieView
                  source={require('../../../assets/Animations/EmptyAnimation.json')}
                  autoPlay
                  loop
                  style={{ width: getWidth(4), height: getHeight(4) }}
                  colorFilters={[{ keypath: 'LayerName', color: '#FF0000' }]}

                />

                <Text
                  style={{
                    color: Colors.black,
                    alignSelf: 'center',
                    fontSize: getHeight(40),
                    fontWeight: '600',
                    marginTop: 10,
                  }}
                >
                  {t('cartEmpty')}
                </Text>
                <Text
                  style={{
                    color: Colors.black,
                    alignSelf: 'center',
                    fontSize: getHeight(50),
                    fontWeight: '400',
                    width: getWidth(1.5),
                    marginTop: 10,
                    textAlign: 'center',
                  }}
                >
                  {t('cartEmptySub')}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate(screens.home)}
                >
                  <Text
                    style={{
                      color: Colors.primary,
                      alignSelf: 'center',
                      fontSize: getHeight(40),
                      fontWeight: '600',
                      width: getWidth(1.5),
                      marginTop: 10,
                      textAlign: 'center',
                      textDecorationLine: 'underline',
                    }}
                  >
                    {t('shopOurProduct')}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListFooterComponent={() => {
            return (
              <>
                {cartDetails?.cart?.lines?.edges?.length > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      paddingBottom: 24,
                      paddingTop: 24,
                      elevation: 6,
                      backgroundColor: 'white',
                      padding: 16,
                      borderTopWidth: 6,
                      borderColor: Colors.transparentBlack,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                      }}
                    >
                      {totalDiscount !== 0 && (
                        <Text
                          style={{
                            textDecorationLine: 'line-through',
                            color: 'grey',
                            fontWeight: '600',
                          }}
                        >
                          {formatPrice(
                            Math.floor(Number(
                              cartDetails?.cart?.cost?.totalAmount?.amount,
                            ) + totalDiscount,)
                          )}{' '}
                          {
                            cartDetails?.cart?.cost?.subtotalAmount
                              ?.currencyCode
                          }
                        </Text>
                      )}

                      <Text
                        style={{
                          color: Colors.black,
                          fontWeight: '600',
                        }}
                      >
                        {formatPrice(
                          Math.floor(Number(
                            cartDetails?.cart?.cost?.totalAmount?.amount,
                          ),)
                        )}{' '}
                        {cartDetails?.cart?.cost?.totalAmount?.currencyCode}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        next();
                      }}
                      style={{
                        backgroundColor: Colors.primary,
                        alignSelf: 'center',
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingLeft: 20,
                        paddingRight: 20,
                        paddingTop: 8,
                        paddingBottom: 8,
                        flex: 1,
                      }}
                    >
                      {!checkLoading ? (
                        <Text
                          style={{
                            color: Colors.white,
                            fontWeight: '500',
                            fontSize: 16,
                          }}
                        >
                          {t('placeOrder')}
                        </Text>
                      ) : (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </>
            );
          }}
        />
      ) : (
        <CartSeklton />
      )}

      {/* Gift Animation - Shows when threshold is crossed */}
      {showGiftAnimation && (
        <Animated.View
          style={[
            styles.giftAnimationContainer,
            {
              opacity: animationOpacity,
              transform: [{ scale: animationScale }],
            }
          ]}
        >
          <LottieView
            source={require('../../../assets/Animations/gift.json')}
            autoPlay
            loop={false}
            style={styles.giftAnimation}
          />
        </Animated.View>
      )}
    </SafeAreaProvider>
  );
};

export default Cart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  giftAnimationContainer: {
    position: 'absolute',
    bottom: getHeight(2.5),
    right: getWidth(3.5),
    zIndex: 1000,
  },
  giftAnimation: {
    width: getWidth(4),
    height: getHeight(4),
  },
});