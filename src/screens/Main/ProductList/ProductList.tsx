import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {BannerStrip, Header, SectionItem, ProductListSkeleton} from '../../../components';
import {useGetProducts} from '../../../Api/hooks';
import {getHeight, getWidth} from '../../../Theme/Constants';
import Colors from '../../../Theme/Colors';
import CommonStyles from '../../../Theme/CommonStyles';
import SvgIcon from '../../../assets/SvgIcon';
import Translation from '../../../assets/i18n/Translation';
import strings from '../../../assets/i18n/strings';
import screens from '../../../Navigation/screens';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import BottomSheetFilter from '../../../components/BottomSheet/BottomSheetFilter';
import BottomSheetSort, {
  sortType,
} from '../../../components/BottomSheet/BottomSheetSort';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import { sortKeyType } from '../../../Api/hooks/useGetProducts';
import { logger } from '../../../Utils';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProductNode {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: {
      amount: number;
    };
  };
  images: {
    edges: Array<{
      node: {
        url: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        compareAtPrice?: {
          amount: number;
        };
      };
    }>;
  };
}

interface ProductEdge {
  node: ProductNode;
}

const ProductList = ({route, navigation}: any) => {
  const {title = '', category = '', offerList = {}} = route?.params || {};
  const [search, setSearch] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<sortKeyType>("MANUAL"); 
  const { products, error } = useGetProducts(
    category, // example collection handle
    200,
    null,
    selectedSort
  );

  // const {products} = useGetProducts(category, 200, '');

  const [showFilterSheet, setshowFilterSheet] = useState<boolean>(false);
  const [showSortSheet, setshowSortSheet] = useState<boolean>(false);
  const {count} = useSelector((state: RootState) => state.CartReducer);
  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(10000);
  const [inStock, setInStock] = useState(true);
  const [outOfStock, setOutOfStock] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialRendering, setIsInitialRendering] = useState(false);
  const [hasRenderedInitial, setHasRenderedInitial] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout>();
  const [productsData, setProducts] = useState<ProductEdge[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductEdge[]>([]);
  // Memoized values to prevent recalculation
  const containerWidth = useMemo(() => getWidth(1.1), []);
  const textSize = useMemo(() => getHeight(55), []);
  const iconSize = useMemo(() => getHeight(30), []);

  // Debounced search to prevent excessive filtering
  const [searchDebounced, setSearchDebounced] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchDebounced(search);
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search]);

  useEffect(() => {
    if (products && products.length > 0) {
      setProducts(products);
      setFilteredProducts(products);
      setLoading(false);
    } 
  }, [products]);

  // Optimized filter function with memoization
  const applyFilters = useCallback((
    productsList: ProductEdge[],
    searchTerm: string,
    min: number,
    max: number,
    stockIn: boolean,
    stockOut: boolean
  ) => {
    if (!productsList.length) return [];

    return productsList.filter((edge: ProductEdge) => {
      const product = edge.node;
      const price = product?.priceRange?.minVariantPrice?.amount || 0;
      const isAvailable = product?.availableForSale;
      
      // Search filter
      const matchesSearch = !searchTerm || 
        product.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Stock filter
      const matchesStock = (isAvailable && stockIn) || (!isAvailable && stockOut);
      
      // Price filter
      const matchesPrice = price >= min && price <= max;
      
      return matchesSearch && matchesStock && matchesPrice;
    });
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    const filtered = applyFilters(
      productsData,
      searchDebounced,
      minAmount,
      maxAmount,
      inStock,
      outOfStock
    );
    
 
    
    setFilteredProducts(filtered);
  }, [productsData, searchDebounced, minAmount, maxAmount, inStock, outOfStock, applyFilters]);

  const filter = useCallback((
    min: number,
    max: number,
    stockIn: boolean,
    stockOut: boolean,
  ) => {
    setMinAmount(min);
    setMaxAmount(max);
    setInStock(stockIn);
    setOutOfStock(stockOut);
    setshowFilterSheet(false);
    
    // Reset rendering state for new filter
    setHasRenderedInitial(false);
    setIsInitialRendering(true);
    
    // Clear existing timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    // Set new timeout
    renderTimeoutRef.current = setTimeout(() => {
      setIsInitialRendering(false);
      setHasRenderedInitial(true);
    }, 800);
    // Scroll to top after a short delay to ensure state is updated
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({offset: 0, animated: true});
    }, 100);
  }, []);

  const sort = useCallback((sortValue: any) => {
    logger.log("sortValue",sortValue)
    setshowSortSheet(false);
    // Reset rendering state for new sort
    setHasRenderedInitial(false);
    setIsInitialRendering(true);
    
    // Clear existing timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    // Set new timeout
    renderTimeoutRef.current = setTimeout(() => {
      setIsInitialRendering(false);
      setHasRenderedInitial(true);
    }, 800);
    
    // setFilteredProducts(sortedProducts);
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({offset: 0, animated: true});
    }, 100);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Reset rendering state
    setHasRenderedInitial(false);
    
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      setIsInitialRendering(true);
      
      // Set timeout for rendering completion
      renderTimeoutRef.current = setTimeout(() => {
        setIsInitialRendering(false);
        setHasRenderedInitial(true);
      }, 800);
    }, 1000);
  }, []);

  // Handle when FlatList layout changes (indicates rendering completion)
  const onLayoutChange = useCallback(() => {
    if (isInitialRendering && filteredProducts.length > 0) {
      // Clear timeout and hide loading after layout is complete
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
      
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsInitialRendering(false);
        setHasRenderedInitial(true);
      }, 300);
    }
  }, [isInitialRendering, filteredProducts.length]);

  // Simplified loading overlay - just indicator, no text or decoration
  const renderInitialLoadingOverlay = useCallback(() => {
    if (!isInitialRendering || filteredProducts.length === 0) return null;
    
    return (
      <View style={styles.initialLoadingOverlay}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }, [isInitialRendering, filteredProducts.length]);

  // Memoized navigation handler
  const handleProductPress = useCallback((item: ProductEdge) => {
    navigation.navigate(screens.productDetails, {
      id: item?.node?.id,
      handle: item?.node?.handle,
      pageNavigation: 'product_List',
    });
  }, [navigation]);

  // Memoized render item function
  const renderItem = useCallback(({item}: {item: ProductEdge}) => (
    <SectionItem
      onPress={() => handleProductPress(item)}
      marginLeft={25}
      price={item?.node?.priceRange?.minVariantPrice?.amount}
      image={{uri: item?.node?.images?.edges[0]?.node?.url}}
      name={item?.node?.title}
      offerPrice={item?.node?.variants?.edges[0]?.node?.compareAtPrice?.amount}
      offerList={offerList}
      category={category}
    />
  ), [handleProductPress, offerList, category]);

  // Memoized key extractor
  const keyExtractor = useCallback((item: ProductEdge, index: number) => 
    item?.node?.id || index.toString(), []);

  // Memoized empty component
  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <SvgIcon.SearchEmptyIcon />
      </View>
      <Text style={styles.emptyTitle}>No Products Found</Text>
    </View>
  ), []);

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearch('');
  }, []);

  const handleFilterPress = useCallback(() => {
    setshowFilterSheet(true);
  }, []);

  const handleSortPress = useCallback(() => {
    setshowSortSheet(true);
  }, []);

  const handleFilterClose = useCallback(() => {
    setshowFilterSheet(false);
  }, []);

  const handleSortClose = useCallback(() => {
    setshowSortSheet(false);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const screenName =
      navigation.getState().routes[navigation.getState().index]?.name;
    AppEventsLogger.logEvent('fb_mobile_content_view', {
      content_name: screenName,
      content_type: 'screen',
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={title}
        cartCount={count}
        onSearch={handleSearch}
        searchValue={search}
        hideSearch={true}
        onCloseSearch={handleCloseSearch}
        page="list"
      />

      <BannerStrip />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ProductListSkeleton />
        </View>
      ) : (
        <View style={styles.listWrapper}>
          <FlatList
            ref={flatListRef}
            data={filteredProducts}
            keyExtractor={keyExtractor}
            numColumns={2}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            initialNumToRender={200}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            getItemLayout={undefined}
            ListEmptyComponent={ListEmptyComponent}
            renderItem={renderItem}
            updateCellsBatchingPeriod={50}
            legacyImplementation={false}
            onEndReachedThreshold={0.1}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            progressViewOffset={50}
            onLayout={onLayoutChange}
          />
          
          {/* Simplified Loading Overlay - just spinner */}
          {renderInitialLoadingOverlay()}
        </View>
      )}
      
     { !loading && <View style={[styles.sortFilterContainer, {width: containerWidth}]}>
        <TouchableOpacity
          style={[
            CommonStyles.containerFlex1,
            CommonStyles.contentCenter,
            CommonStyles.flexRowContainer,
            styles.borderLine,
          ]}
          onPress={handleFilterPress}
          activeOpacity={0.7}>
          <SvgIcon.FilterIcon />
          <Text style={[styles.textFilter, {fontSize: textSize}]}>
            <Translation textKey={strings.filter} />
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            CommonStyles.containerFlex1,
            CommonStyles.contentCenter,
            CommonStyles.flexRowContainer,
          ]}
          onPress={handleSortPress}
          activeOpacity={0.7}>
          <SvgIcon.SortIcon width={iconSize} height={iconSize} />
          <Text style={[styles.textFilter, {fontSize: textSize}]}>
            <Translation textKey={strings.sort} />
          </Text>
        </TouchableOpacity>
      </View>}
      
      <BottomSheetFilter
        isVisible={showFilterSheet}
        onClose={handleFilterClose}
        onApply={filter}
      />
      <BottomSheetSort
        isVisible={showSortSheet}
        onClose={handleSortClose}
        onApply={sort}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  sortFilterContainer: {
    position: 'absolute',
    bottom: getHeight(99),
    minHeight: getHeight(16),
    backgroundColor: Colors.primary,
    alignSelf: 'center',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textFilter: {
    color: Colors.white,
    fontWeight: '500',
    marginLeft: 10,
  },
  borderLine: {
    borderRightWidth: 1,
    height: '60%',
    borderRightColor: Colors.white,
  },
  listContainer: {
    minHeight: getHeight(1),
    marginTop: getHeight(45),
    paddingRight: getHeight(45),
    paddingBottom: getHeight(4),
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconContainer: {
    marginBottom: getHeight(20),
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: getHeight(10),
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.subtitleTxt,
    marginBottom: getHeight(20),
  },
  emptyActionContainer: {
    marginTop: getHeight(20),
  },
  clearFiltersButton: {
    padding: getHeight(10),
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.white,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.black,
    textAlign: 'center',
  },
  // Simplified overlay - removed decorative container and text
  initialLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default ProductList;