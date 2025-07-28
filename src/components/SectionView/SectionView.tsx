import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {FC, memo, useCallback, useMemo} from 'react';
import {getHeight, getWidth} from '../../Theme/Constants';
import SvgIcon from '../../assets/SvgIcon';
import Colors from '../../Theme/Colors';
import SectionItem from '../SectionItem/SectionItem';
import Translation from '../../assets/i18n/Translation';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ParamListBase, useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

import screens from '../../Navigation/screens';
import {t} from 'i18next';

interface SectionViewInterface {
  title: string;
  items: any[];
  viewAllPress: () => void;
  page: string;
  offerList: {};
  category: string;
}

// Optimized Skeleton Component - Remove nested ShimmerPlaceholders
const SkeletonItem = memo(() => (
  <View style={styles.skeletonContainer}>
    <ShimmerPlaceholder style={styles.skeletonMain} />
  </View>
));

// Optimized Item Component to prevent SectionItem re-renders
const OptimizedSectionItem = memo(({
  item,
  index,
  isYouMayAlsoLike,
  onPress,
  page,
  offerList,
  category
}: any) => {
  const itemData = isYouMayAlsoLike ? item : item?.node;
  
  // Safely extract data with fallbacks
  const imageUrl = itemData?.images?.edges?.[0]?.node?.url || '';
  const price = itemData?.priceRange?.minVariantPrice?.amount || '0';
  const title = itemData?.title || '';
  const offerPrice = item?.node?.variants?.edges?.[0]?.node?.compareAtPrice?.amount;
  
  return (
    <SectionItem
      onPress={onPress}
      price={price}
      image={{uri: imageUrl}}
      name={title}
      page={page}
      offerPrice={offerPrice}
      offerList={offerList}
      category={category}
      
    />
  );
});

const SectionView: FC<SectionViewInterface> = memo(
  ({title = 'Best offers', items = [], viewAllPress, page, offerList,category=''}) => {
    const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();

    // Check if we have actual data
    const hasData = items?.length > 0;
    
    // Memoize the check for "youMayAlsoLike" 
    const isYouMayAlsoLike = useMemo(() => title === t('youMayAlosLike'), [title]);
    
    // Use actual data or show 3 skeleton items
    const displayData = useMemo(() => {
      return hasData ? items : [1, 2, 3];
    }, [hasData, items]);

    // Memoized navigation handler
    const handleItemPress = useCallback((item: any) => {
      const productId = isYouMayAlsoLike ? item?.id : item?.node?.id;
      const productHandle = isYouMayAlsoLike ? item?.handle : item?.node?.handle;
      
      if (productId) {
        navigation.navigate(screens.productDetails, {
          id: productId,
          handle: productHandle,
        });
      }
    }, [navigation, isYouMayAlsoLike]);

    // Optimized renderItem - major performance improvement
    const renderItem = useCallback(({item, index}: any) => {
      // Show skeleton for loading state
      if (!hasData) {
        return <SkeletonItem />;
      }

      return (
        <OptimizedSectionItem
          item={item}
          index={index}
          isYouMayAlsoLike={isYouMayAlsoLike}
          onPress={() => handleItemPress(item)}
          page={page}
          offerList={offerList}
          category={category}
        />
      );
    }, [hasData, isYouMayAlsoLike, handleItemPress, page, offerList]);

    // Optimized key extractor
    const keyExtractor = useCallback((item: any, index: number) => {
      if (!hasData) return `skeleton-${index}`;
      const itemData = isYouMayAlsoLike ? item : item?.node;
      return itemData?.id || `item-${index}`;
    }, [hasData, isYouMayAlsoLike]);

    // Memoized styles to prevent re-creation
    const flatListStyle = useMemo(() => ({
      paddingRight: getHeight(45),
    }), []);

    return (
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <View style={styles.titleView}>
            <Text style={styles.title}>
              <Translation textKey={title} />
            </Text>
            <SvgIcon.AwesomeStar />
          </View>
          {!isYouMayAlsoLike && (
            <TouchableOpacity
              onPress={viewAllPress}
              style={styles.viewAll}
              activeOpacity={0.7}>
              <Text style={styles.viewTxt}>
                <Translation textKey={'viewAll'} />
              </Text>
      
              <Text style={styles.viewTxt}>{' >>'}</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={displayData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          
          // Critical performance props
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          initialNumToRender={2}
          windowSize={5}
          updateCellsBatchingPeriod={100}
          
          // Disable animations that cause lag
          scrollEventThrottle={16}
          
          // Optimize memory
          legacyImplementation={false}
          
          contentContainerStyle={flatListStyle}
        />
      </View>
    );
  },
);

export default SectionView;

const styles = StyleSheet.create({
  container: {
    minHeight: getHeight(4),
    marginTop: getHeight(45),
  },
  title: {
    fontSize: getHeight(45),
    marginRight: getHeight(80),
    fontWeight: '600',
    color: Colors.black,
  },
  titleContainer: {
    minHeight: getHeight(20),
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
  },
  titleView: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAll: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  viewTxt: {
    color: Colors.primary,
    fontSize: getHeight(55),
    fontWeight: '500',
  },
  skeletonContainer: {
    width: getWidth(3.5),
    height: getHeight(4),
    marginLeft: getWidth(21),
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonMain: {
    width: '90%',
    height: '80%',
    borderRadius: 8,
  },
});