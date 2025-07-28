import { View, StyleSheet, FlatList } from "react-native";
import React from "react";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { getHeight, getWidth } from "../../Theme/Constants";
import Colors from "../../Theme/Colors";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

interface ProductListSkeletonProps {
  itemCount?: number;
}

const ProductListSkeleton: React.FC<ProductListSkeletonProps> = ({ 
  itemCount = 10 
}) => {
  const skeletonData = Array.from({ length: itemCount }, (_, index) => index);

  const renderSkeletonItem = ({ item }: { item: number }) => (
    <View style={styles.skeletonItem}>
      {/* Image placeholder */}
      <ShimmerPlaceholder
        style={styles.imagePlaceholder}
        shimmerColors={['#F5F5F5', '#E8E8E8', '#F5F5F5']}
      />
      
      {/* Title placeholder */}
      <ShimmerPlaceholder
        style={styles.titlePlaceholder}
        shimmerColors={['#F5F5F5', '#E8E8E8', '#F5F5F5']}
      />
      
      {/* Price placeholder */}
      <ShimmerPlaceholder
        style={styles.pricePlaceholder}
        shimmerColors={['#F5F5F5', '#E8E8E8', '#F5F5F5']}
      />
      
      {/* Delivery badge placeholder */}
      <ShimmerPlaceholder
        style={styles.deliveryPlaceholder}
        shimmerColors={['#F5F5F5', '#E8E8E8', '#F5F5F5']}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={skeletonData}
        renderItem={renderSkeletonItem}
        keyExtractor={(item) => item.toString()}
        numColumns={2}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        initialNumToRender={6}
        windowSize={10}
        updateCellsBatchingPeriod={50}
        legacyImplementation={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  listContainer: {
    minHeight: getHeight(1),
    marginTop: getHeight(45),
    paddingRight: getHeight(45),
    paddingBottom: getHeight(4),
  },
  skeletonItem: {
    width: getWidth(2.2),
    marginLeft: getHeight(86),
    paddingBottom: getHeight(45),
    marginTop: getHeight(80),
    height: getHeight(2.6),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F2F5',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: getHeight(4.5),
    borderRadius: 8,
    marginBottom: getHeight(85),
  },
  titlePlaceholder: {
    width: '90%',
    height: 15,
    borderRadius: 4,
    marginBottom: getHeight(200),
  },
  pricePlaceholder: {
    width: '60%',
    height: getHeight(48),
    borderRadius: 4,
    marginBottom: getHeight(90),
  },
  deliveryPlaceholder: {
    width: '80%',
    height: getHeight(20),
    borderRadius: 4,
  },
});

export default ProductListSkeleton; 