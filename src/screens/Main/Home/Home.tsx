import {
  Image,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
  FC,
} from 'react';
import images from '../../../assets/Images';
import {getHeight, getWidth} from '../../../Theme/Constants';
import Colors from '../../../Theme/Colors';
import CategoryList from './CategoryList/CategoryList';
import {BannerStrip, OfferView, SectionView} from '../../../components';
import strings from '../../../assets/i18n/strings';
import {
  useGetProducts,
  useGetCollections,
  useGetHomeBannerList,
  useGetHomeSectionsFirst,
  useGetHomeSectionsTwo,
  useGetCart,
  useCreateCart,
} from '../../../Api/hooks';
import screens from '../../../Navigation/screens';
import Swiper from 'react-native-swiper';
import {useIsFocused} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import SpInAppUpdates, {
  NeedsUpdateResponse,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import {
  toggleLoader,
  updateSelectedTab,
} from '../../../redux/reducers/GlobalReducer';
import useToken from '../../../Api/hooks/useToken';
import {View} from 'react-native-animatable';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {t} from 'i18next';
import i18n from 'i18next';
import {requestNotifications} from 'react-native-permissions';
import InAppReview from 'react-native-in-app-review';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import useGetHomeSectionsThree from '../../../Api/hooks/useGetHomeSectionThree';
import SkeletonCard from '../../../components/skeletonCard/SkeletonCard';
import useGetCategoryProducts from '../../../Api/hooks/useGetCategoryProducts';
import useGetHomeSection from '../../../Api/hooks/useGetHomeSection';
import {homePush} from '../../../helpers/HomePush';
import Translation from '../../../assets/i18n/Translation';
import {RootState} from '../../../redux/store';
import axios from 'axios';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import {getReview, setReview} from '../../../AsyncStorage/StorageUtil';
import useGetOffer from '../../../Api/hooks/useGetOffer';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {useStallionUpdate, restart} from 'react-native-stallion';
import AnimatedModal from '../../../components/animatedModal/AnimatedModal';
import RestartModal from './RestartModal';

// Memoized constants to prevent recreation
const MOUNTING_CATEGORY = [
  {
    category: 'special-offer',
    title: strings.SpecialOffer,
    item: [],
    id: 1,
  },
  {
    category: 'new-arrivals',
    title: strings.newArrivals,
    item: [],
    id: 1,
  },
  {
    category: 'camping-goods-supplies',
    title: strings.campinggoods,
    item: [],
    id: 3,
    metaView: [],
    metaId: '15876423969',
  },
  {category: 'add-more-save-more', title: 'comboDeals', item: [], id: 3},
  {
    category: 'qr-1-qr-29-deals',
    title: 'under30',
    item: [],
    id: 4,
    metaView: [],
    metaId: '15876522273',
  },
  {
    category: 'kitchen-improvement',
    title: strings.kitchenImprovement,
    item: [],
    id: 5,
  },
  {
    category: 'home-organization',
    title: strings.Homeorganization,
    item: [],
    id: 6,
    metaView: [],
    metaId: '44402147617',
  },
  {category: 'home-care', title: 'Home Care', item: [], id: 7},
  {
    category: 'home-cleaning',
    title: strings.HomeCleaning,
    item: [],
    id: 8,
    metaView: [],
    metaId: '44902088993',
  },
  {category: 'racks-storage', title: strings.RacksStorage, item: [], id: 9},
  {
    category: 'cooking-appliances',
    title: strings.CookingAppliances,
    item: [],
    metaView: [],
    metaId: '44902220065',
    id: 10,
  },
  {category: 'bags-pouches', title: strings.Bags, item: [], id: 11},
  {
    category: 'bathroom-laundry-supplies',
    title: strings.BathCare,
    item: [],
    id: 12,
    metaView: [],
    metaId: '44902252833',
  },
  {
    category: 'fitness-personal-care',
    title: strings.BeautyFitness,
    item: [],
    id: 13,
  },
  {
    category: 'car-accessories',
    title: strings.CarAccessories,
    item: [],
    id: 14,
  },
];

const COLLECTION_HANDLE_1 = [
  'new-arrivals',
  'last-chance-deals',
  'qsales-choice',
  'qr-1-qr-29-deals',
  'add-more-save-more',
  'travel-bags-organization',
  'camping-outdoor',
  'wardrobe-organization',
];

const COLLECTION_HANDLE_2 = [
  'kitchen-organization',
  'bathroom-laundry-supplies',
  'home-care',
  'home-decor',
  'racks-storage',
  'baby-care',
  'car-accessories',
  'tech-gadgets',
];

// Types
interface BannerItemProps {
  item: BannerImage;
  index: number;
  navigation: NativeStackNavigationProp<any>;
}

interface BannerImage {
  image_url: string;
  type: 'collection' | 'product';
  target_handle: string;
}

interface Category {
  category: string;
  title: string;
  item: any[];
  id: number;
  metaView?: any[];
  metaId?: string;
}

interface SectionViewProps {
  viewAllPress: () => void;
  items: any[];
  title: string;
  page: string;
  offerList?: any;
}

interface OfferViewProps {
  data: any[];
}

interface HomeProps {
  navigation: NativeStackNavigationProp<any>;
}

// Memoized banner item component
const BannerItem: FC<BannerItemProps> = React.memo(
  ({item, index, navigation}) => {
    const handlePress = useCallback(() => {
      if (item.type === 'collection') {
        if (item.target_handle === 'all') {
          navigation.navigate(screens.explore);
        } else {
          navigation.navigate(screens.productList, {
            title: item?.target_handle.replace('-', ' '),
            category: item?.target_handle,
          });
        }
      }
      if (item.type === 'product') {
        navigation.navigate(screens.productDetails, {
          handle: item?.target_handle,
        });
      }
    }, [item, navigation]);

    return (
      <TouchableWithoutFeedback onPress={handlePress}>
        <Image
          resizeMode="stretch"
          style={styles.swiperContainer}
          source={{uri: item?.image_url}}
        />
      </TouchableWithoutFeedback>
    );
  },
);

const Home: FC<HomeProps> = ({navigation}) => {
  // Hooks
  const {collections} = useGetCollections(100);
  const {offerList} = useGetOffer();
  const {bannerImagesEN, bannerImagesAR} = useGetHomeBannerList();
  const {getProducts} = useGetCategoryProducts();
  const {cartDetails, getCartData} = useGetCart();
  const getSectionData = useGetHomeSection();
  const {cart, createCart} = useCreateCart();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  // State
  const [categories, setCategories] = useState<Category[]>(MOUNTING_CATEGORY);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [categoryList1, setCategoryList1] = useState<any[]>([]);
  const [categoryIndex, setCategoryIndex] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [isRestartModalVisible, setIsRestartModalVisible] =
    useState<boolean>(false);
  const [swiperData, setSwiperData]: [
    'en' | 'ar',
    (lang: 'en' | 'ar') => void,
  ] = useState<'en' | 'ar'>('en');

  // Refs for performance
  const hasInitialized = useRef<boolean>(false);
  const loadingRef = useRef<boolean>(false);

  // Selectors
  const language = useSelector((state: any) => state.AuthReducer.language);
  const launch = useSelector((state: any) => state.globalReducer.launch);

  // Get new arrivals data
  const newArrivals = useGetProducts(
    offerList?.hasVisible ? 'special-offer' : 'new-arrivals',
    12,
    '',
  );

  const {isRestartRequired} = useStallionUpdate();

  useEffect(() => {
    if (isRestartRequired) {
      setIsRestartModalVisible(true);
    }
  }, [isRestartRequired]);

  // Memoized banner images based on language
  const bannerImages = useMemo<BannerImage[]>(() => {
    return swiperData === 'en' ? bannerImagesEN : bannerImagesAR;
  }, [swiperData, bannerImagesEN, bannerImagesAR]);

  // Memoized collections processing
  const processCollections = useCallback(
    (collectionHandle: string[]): any[] => {
      if (!collections) return [];

      const filtered = collections.filter((val: any) =>
        collectionHandle.includes(val.node.handle),
      );

      return filtered.sort(
        (a: any, b: any) =>
          collectionHandle.indexOf(a?.node?.handle) -
          collectionHandle.indexOf(b?.node?.handle),
      );
    },
    [collections],
  );

  // Memoized category lists
  const memoizedCategoryList = useMemo<any[]>(
    () => processCollections(COLLECTION_HANDLE_1),
    [processCollections],
  );

  const memoizedCategoryList1 = useMemo<any[]>(
    () => processCollections(COLLECTION_HANDLE_2),
    [processCollections],
  );

  // Update category lists when collections change
  useEffect(() => {
    setCategoryList(memoizedCategoryList);
    setCategoryList1(memoizedCategoryList1);
  }, [memoizedCategoryList, memoizedCategoryList1]);

  // Initialize app on focus
  useEffect(() => {
    if (isFocused && !hasInitialized.current) {
      hasInitialized.current = true;
      Promise.all([
        requestNotificationPermission(),
        subscribeToMyTopic(),
        getCheckoutId(),
      ]).catch(console.error);

      dispatch(updateSelectedTab(0));
    }
  }, [isFocused]);

  // One-time initialization
  useEffect(() => {
    checkForUpdates();
    setupNotificationHandlers();
    checkAndRequestReview();

    const currentLanguage: any = i18n.language;
    setSwiperData(currentLanguage);

    // Language change listener
    const handleLanguageChange = (newLang: string) => {
      if (newLang === 'en' || newLang === 'ar') {
        setSwiperData(newLang as 'en' | 'ar');
      }
      navigation.navigate(screens.splash);
    };

    i18n.on('languageChanged', handleLanguageChange);

    // Remove loader after delay
    const timer = setTimeout(() => {
      dispatch(toggleLoader(false));
    }, 3000);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
      clearTimeout(timer);
    };
  }, []);

  // Update new arrivals list
  const updateNewList = useCallback(() => {
    if (!newArrivals?.products?.length || !categories.length) return;

    setCategories(prev => {
      const updatedCategories = [...prev];

      if (offerList?.hasVisible) {
        const specialOfferIndex = updatedCategories.findIndex(
          cat => cat.category === 'special-offer',
        );
        if (specialOfferIndex !== -1) {
          updatedCategories[specialOfferIndex].item = newArrivals.products;
        }
        setCategoryIndex(1);
      } else {
        const newArrivalsIndex = updatedCategories.findIndex(
          cat => cat.category === 'new-arrivals',
        );
        if (newArrivalsIndex !== -1) {
          updatedCategories[newArrivalsIndex].item = newArrivals.products;
        }
        setCategoryIndex(2);
      }
      return updatedCategories;
    });

    setLoading(false);
    setCategoriesLoading(false);
  }, [newArrivals?.products, offerList?.hasVisible, categories.length]);

  useEffect(() => {
    updateNewList();
  }, [updateNewList]);

  // Optimized category loading
  const getItem = useCallback(async () => {
    if (loadingRef.current || categoryIndex >= MOUNTING_CATEGORY.length) return;

    loadingRef.current = true;
    setCategoriesLoading(true);

    try {
      const products = await getProducts(
        MOUNTING_CATEGORY[categoryIndex]?.category,
        12,
      );

      const updatedCategories = [...categories];
      const findCategoryIndex = updatedCategories.findIndex(
        category =>
          category?.category === MOUNTING_CATEGORY[categoryIndex]?.category,
      );

      if (findCategoryIndex !== -1) {
        await homePush(updatedCategories, findCategoryIndex, products);

        if (updatedCategories[findCategoryIndex]?.metaId) {
          try {
            const sectionList = await getSectionData(
              updatedCategories[findCategoryIndex].metaId,
            );
            updatedCategories[findCategoryIndex].metaView = sectionList;
          } catch (error) {
            console.error('Section data error:', error);
          }
        }

        setCategories(updatedCategories);
        setCategoryIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Get item error:', error);
    } finally {
      setCategoriesLoading(false);
      loadingRef.current = false;
    }
  }, [categoryIndex, categories, getProducts, getSectionData]);

  const loadMoreCategory = useCallback(() => {
    if (!categoriesLoading && !loadingRef.current) {
      getItem();
    }
  }, [categoriesLoading, getItem]);

  // Async storage operations
  const storeCheckoutId = useCallback(async (value: string) => {
    try {
      await AsyncStorage.setItem('checkoutId', value);
    } catch (error) {
      console.error('Store checkout ID error:', error);
    }
  }, []);

  const getCheckoutId = useCallback(async () => {
    try {
      const value = await AsyncStorage.getItem('checkoutId');
      if (value) {
        getCartData();
      } else {
        createCart();
      }
    } catch (error) {
      console.error('Get checkout ID error:', error);
    }
  }, [getCartData, createCart]);

  useEffect(() => {
    if ((cart as any)?.cartCreate?.cart?.id) {
      storeCheckoutId((cart as any).cartCreate.cart.id);
    }
  }, [cart, storeCheckoutId]);

  // Notification setup
  const setupNotificationHandlers = useCallback(() => {
    const unsubscribeOnNotificationOpen = messaging().onNotificationOpenedApp(
      handleNotificationNavigation,
    );

    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      handleNotificationNavigation(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNotificationNavigation(remoteMessage);
        }
      });

    return () => {
      unsubscribeOnNotificationOpen();
      unsubscribeOnMessage();
    };
  }, []);

  const handleNotificationNavigation = useCallback(
    (remoteMessage: any) => {
      const {data} = remoteMessage;
      if (data?.action_to === 'PRODUCT') {
        navigation.navigate(screens.productDetails, {
          handle: data.action_handle,
        });
      } else if (data?.action_to === 'COLLECTION') {
        navigation.navigate(screens.productList, {
          title: data.action_handle.toString().replace('-', ' '),
          category: data.action_handle,
        });
      }
    },
    [navigation],
  );

  const subscribeToMyTopic = useCallback(async () => {
    try {
      await messaging().subscribeToTopic('promotions');
      console.log('Subscribed to topic!');
    } catch (error) {
      console.error('Error subscribing to promotions:', error);
    }
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          'android.permission.POST_NOTIFICATIONS',
        );
        if (!granted) {
          await PermissionsAndroid.request(
            'android.permission.POST_NOTIFICATIONS',
            {
              title: t('notification'),
              message: `${t('notifMessage1')} ${t('notifMessage2')}`,
              buttonNeutral: `${t('askMeLater')} `,
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
        }
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    } else if (Platform.OS === 'ios') {
      await requestNotifications(['alert', 'sound']);
    }
  }, []);

  const checkForUpdates = useCallback(async (useTestVersion = false) => {
    // Set true for debug logs
    const inAppUpdates = new SpInAppUpdates(false);

    try {
      const currentVersion = useTestVersion ? '2.0.1' : DeviceInfo.getVersion();

      const result = await inAppUpdates.checkNeedsUpdate({
        curVersion: currentVersion,
      });

      if (result.shouldUpdate) {
        const updateOptions =
          Platform.OS === 'android' ? {updateType: IAUUpdateKind.FLEXIBLE} : {};

        await inAppUpdates.startUpdate(updateOptions);
      }
    } catch (error: any) {
      const errorMessage = error?.message || '';

      // Gracefully ignore "App not owned" error
      if (
        errorMessage.includes('ERROR_APP_NOT_OWNED') ||
        errorMessage.includes('Install Error(-10)')
      ) {
        console.warn(
          'In-app update skipped: App is not installed via Play Store. Install it from Play Store to enable updates.',
        );
      } else {
        console.error('Error during update check:', error);
      }
    }
  }, []);
  const checkAndRequestReview = useCallback(async () => {
    try {
      const hasReviewed = await getReview('hasReviewed');
      if (!hasReviewed && InAppReview.isAvailable()) {
        setTimeout(async () => {
          try {
            await InAppReview.RequestInAppReview();
            await setReview('hasReviewed', 'true');
          } catch (error) {
            console.error('Error in in-app review:', error);
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Review check error:', error);
    }
  }, []);

  // Memoized render item
  const renderItem = useCallback(
    ({item}: any) => {
      if (!offerList?.hasVisible && item.category === 'special-offer') {
        return null;
      }
      return (
        <View key={item.id.toString()}>
          <SectionView
            viewAllPress={() =>
              navigation.navigate(screens.productList, {
                title: item.title,
                category: item.category,
                offerList: offerList || {},
              })
            }
            items={item.item}
            title={item.title}
            page="home"
            offerList={offerList}
            category={item?.category}
          />
          {item?.metaView?.length > 0 && <OfferView data={item.metaView} />}
        </View>
      );
    },
    [navigation, offerList],
  );

  // Track screen view
  useEffect(() => {
    const screenName =
      navigation.getState().routes[navigation.getState().index]?.name;
    AppEventsLogger.logEvent('fb_mobile_content_view', {
      content_name: screenName,
      content_type: 'screen',
    });
  }, [navigation]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled
      contentContainerStyle={styles.scrollContainer}>
      {/* Banner Swiper */}
      {bannerImages?.length > 0 && (
        <View>
          <Swiper
            key={bannerImages.length}
            autoplay
            autoplayTimeout={6}
            style={styles.swiperContainer}
            dotColor={Colors.white}
            activeDotColor={Colors.black}>
            {bannerImages.map((item, index) => (
              <BannerItem
                key={index}
                item={item}
                index={index}
                navigation={navigation}
              />
            ))}
          </Swiper>
        </View>
      )}

      {/* Delivery GIFs */}
      <FastImage
        source={
          language === 'en'
            ? require('../../../assets/Images/delivery_arb.gif')
            : require('../../../assets/Images/delivery_eng.gif')
        }
        style={styles.deliveryGif}
        resizeMode={FastImage.resizeMode.cover}
      />
      <FastImage
        source={require('../../../assets/Images/bannerTenPerc.gif')}
        style={styles.bannerGif}
        resizeMode={FastImage.resizeMode.cover}
      />

      {/* Categories Section */}
      <View style={styles.container}>
        <View style={styles.categoryHeader}>
          <TouchableOpacity style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                language === 'en'
                  ? {marginRight: getWidth(16)}
                  : {marginRight: getWidth(5)},
              ]}>
              <Translation textKey={strings.categories} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => navigation.navigate(screens.explore)}>
            <Text style={styles.viewTxt}>
              <Translation textKey="viewAll" />
            </Text>
            <Text style={styles.viewTxt}> {'>>'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <CategoryList data={categoryList} data1={categoryList1} />
        </ScrollView>

        <BannerStrip />
        <RestartModal
          isVisible={isRestartModalVisible}
          onClose={() => {
            setIsRestartModalVisible(false);
          }}
          onRestart={() => {
            restart();
          }}
        />
      </View>

      {/* Product Categories */}
      {!loading ? (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          onEndReached={loadMoreCategory}
          onEndReachedThreshold={0.3}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
          initialNumToRender={3}
        />
      ) : (
        <SkeletonCard
          data={[12, 34]}
          chaildVieWidth={2}
          childViewHeight={3}
          containerMarginTop={10}
          ContainerHeight={3}
        />
      )}
        {/* <AnimatedModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="BIG SALES"
      >
       
      </AnimatedModal> */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    minHeight: getHeight(1.5),
    backgroundColor: Colors.white,
  },
  swiperContainer: {
    height: getHeight(5),
    backgroundColor: Colors.placeholderColor,
  },
  deliveryGif: {
    width: getWidth(1),
    height: 20,
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  bannerGif: {
    width: getWidth(1),
    height: 20,
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  container: {
    minHeight: getHeight(8),
  },
  categoryHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleContainer: {
    width: getWidth(3),
    alignItems: 'flex-end',
    alignSelf: 'flex-start',
  },
  title: {
    fontWeight: '600',
    fontSize: getHeight(45),
    marginTop: getHeight(70),
    marginBottom: getHeight(55),
    color: Colors.black,
  },
  viewAll: {
    width: getWidth(3),
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: getWidth(10),
  },
  viewTxt: {
    color: Colors.primary,
    fontSize: getHeight(55),
    fontWeight: '500',
  },
  modalBodyText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  exampleContent: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  
});

export default React.memo(Home);
