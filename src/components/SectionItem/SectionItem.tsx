
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC, memo, useCallback, useMemo} from 'react';
import {getHeight, getWidth} from '../../Theme/Constants';
import Colors from '../../Theme/Colors';
import {formatPrice} from '../../Utils';
import FastImage from 'react-native-fast-image';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import PromoBanner from '../../test';
import WaveBanner from '../../test';
import MemoizedWaveBanner from '../../test';
import UltraOptimizedBanner from '../../test';

interface ItemInterface {
  name: string;
  price: string;
  image: any;
  onPress?: () => void;
  page: string;
  offerPrice?: string;
  offerList?: {
    offerType?: string;
    hasVisible?: boolean;
    offerColor?: string;
    textColor?: string;
  };
  category?: string;
}

const SectionItem: FC<ItemInterface> = memo(
  ({
    name = '',
    price = '',
    image = '',
    onPress,
    page = '',
    offerPrice = '',
    offerList = {},
    category = '',
  }) => {
    // Memoize expensive calculations
    const calculations = useMemo(() => {
      const numericPrice = Number(price) || 0;
      const numericOfferPrice = Number(offerPrice) || 0;
      const formattedPrice = formatPrice(numericPrice);
      const formattedOfferPrice = formatPrice(numericOfferPrice);
      const isFreeDelivery = numericPrice >= 35;
      const isHomePage = page === 'home';

      // Calculate discount percentage
      let discountPercentage = null;
      if (
        numericPrice > 0 &&
        numericOfferPrice > 0 &&
        numericOfferPrice > numericPrice
      ) {
        const discount =
          ((numericOfferPrice - numericPrice) / numericOfferPrice) * 100;
        discountPercentage = Math.round(discount);
      }

      // Parse search info
      const searchInfo = page.includes('|') ? page.split('|') : [];

      return {
        formattedPrice,
        formattedOfferPrice,
        isFreeDelivery,
        isHomePage,
        discountPercentage,
        searchInfo,
        numericPrice,
        numericOfferPrice,
      };
    }, [price, offerPrice, page]);

    // Memoize styles that depend on calculations
    const dynamicStyles: any = useMemo(
      () => ({
        container: {
          width: calculations.isHomePage ? getWidth(2.5) : getWidth(2.2),
          height: calculations.isHomePage ? getHeight(3) : getHeight(2.6),
        },
        contentContainer: {
          height: calculations.isHomePage ? getHeight(6) : getHeight(4.5),
          width: calculations.isHomePage ? getHeight(6) : '100%',
          marginTop: calculations.isHomePage ? getWidth(80) : 0,
        },
        deliveryIconWidth: calculations.isHomePage ? '15%' : '11%',
      }),
      [calculations.isHomePage],
    );

    // Memoize offer visibility and colors
    const offerDisplay = useMemo(() => {
      const hasOffer = offerPrice !== '' && offerList?.hasVisible;
      const offerColor =
        offerList?.offerColor === '' ? 'red' : offerList?.offerColor || 'red';
      const textColor =
        offerList?.textColor === '' ? 'white' : offerList?.textColor || 'white';

      return {
        hasOffer,
        offerColor,
        textColor,
      };
    }, [
      offerPrice,
      offerList?.hasVisible,
      offerList?.offerColor,
      offerList?.textColor,
    ]);

    // Memoize discount text content
    const discountContent = useMemo(() => {
      if (!offerDisplay.hasOffer || !calculations.discountPercentage)
        return null;

      if (offerList?.offerType === 'diff') {
        return `Save ${calculations.discountPercentage}%`;
      } else {
        return `Save ${
          calculations.numericOfferPrice - calculations.numericPrice
        }`;
      }
    }, [
      offerDisplay.hasOffer,
      calculations.discountPercentage,
      calculations.numericOfferPrice,
      calculations.numericPrice,
      offerList?.offerType,
    ]);

    // Optimized press handler
    const handlePress = useCallback(() => {
      if (!onPress) return;

      onPress();

      // Only log if it's a search
      if (
        calculations.searchInfo.length > 1 &&
        calculations.searchInfo[1] === 'search'
      ) {
        AppEventsLogger.logEvent('search', {
          search_query: calculations.searchInfo[0],
          search_category: calculations.searchInfo[2],
        });
      }
    }, [onPress, calculations.searchInfo]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.container, dynamicStyles.container]}
        activeOpacity={0.8}>
        <View style={[styles.contentContainer, dynamicStyles.contentContainer]}>
          <View style={styles.imageContainer}>
            {/* Discount Badge */}
            {offerDisplay.hasOffer && discountContent && (
              <View
                style={[
                  styles.discountBadge,
                  {backgroundColor: offerDisplay.offerColor},
                ]}>
                <Text
                  style={[
                    styles.discountText,
                    {color: offerDisplay.textColor},
                  ]}>
                  {discountContent}
                </Text>
              </View>
            )}

            {/* Product Image */}
            <FastImage
              style={styles.image}
              resizeMode={FastImage.resizeMode.cover}
              source={image}
              priority={FastImage.priority.normal}
            />
          </View>

          {/* Product Name */}
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.nameText}>
            {name}
          </Text>
          {/* Price Container */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceTextQar}>QAR</Text>
            <Text style={styles.priceText}>{calculations.formattedPrice}</Text>
            {offerDisplay.hasOffer && (
              <Text style={styles.offerPrice}>
                QAR {calculations.formattedOfferPrice}
              </Text>
            )}
          </View>

          {/* Free Delivery Badge */}
          {calculations.isFreeDelivery && (
            <View style={styles.deliveryContainer}>
              <Image
                source={require('../../assets/Images/van.png')}
                style={[
                  styles.deliveryIcon,
                  {width: dynamicStyles.deliveryIconWidth},
                ]}
              />
              <Text style={styles.deliveryText}>FREE DELIVERY</Text>
            </View>
          )}
        </View>
        {category === 'buy-1-get-1-free' && (
          <UltraOptimizedBanner
            paddingHorizontal={3}
            paddingVertical={1}
            top={3}
            right={5}
            fontSize={8}
            borderBottomLeftRadius={4}
            borderBottomRightRadius={4}
            showAnimation={true} // Set to true only when needed
          />
        )}
      </TouchableOpacity>
    );
  },
);

// Add display name for better debugging
SectionItem.displayName = 'SectionItem';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F2F5',
    borderRadius: 8,
    marginLeft: getHeight(86),
    paddingBottom: getHeight(45),
    marginTop: getHeight(80),
  },
  contentContainer: {
    width: '100%',
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: Colors.lightPink,
    borderRadius: 8,
    position: 'relative',
    overflow: 'visible',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  discountBadge: {
    position: 'absolute',
    zIndex: 999,
    top: 0,
    left: 0,
    paddingHorizontal: getWidth(30),
    paddingVertical: 2,
    borderBottomRightRadius: 10,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 15,
    marginTop: getHeight(85),
    fontWeight: '400',
    color: Colors.black,
    fontFamily: 'Helvetica',
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: 'row',
    gap: 3,
    alignItems: 'baseline',
  },
  priceText: {
    fontSize: getHeight(48),
    marginTop: getHeight(200),
    fontWeight: '700',
    color: Colors.black,
    fontFamily: 'Helvetica',
  },
  priceTextQar: {
    fontSize: getHeight(50),
    marginTop: getHeight(200),
    fontWeight: '400',
    color: Colors.black,
  },
  offerPrice: {
    fontSize: getHeight(80),
    marginTop: getHeight(80),
    fontWeight: 'bold',
    color: Colors.primary,
    textDecorationLine: 'line-through',
  },
  deliveryContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: getHeight(90),
    height: getHeight(20),
    alignItems: 'center',
  },
  deliveryIcon: {
    height: '25%',
  },
  deliveryText: {
    color: 'black',
    fontSize: 10,
  },
});

export default SectionItem;
