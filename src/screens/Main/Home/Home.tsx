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
import { getHeight, getWidth } from '../../../Theme/Constants';
import Colors from '../../../Theme/Colors';
import CategoryList from './CategoryList/CategoryList';
import { BannerStrip, OfferView, SectionView } from '../../../components';
import strings from '../../../assets/i18n/strings';

import {
  useGetProducts,
  useGetCollections,
  useGetHomeBannerList,
  useGetCart,
  useCreateCart,
} from '../../../Api/hooks';
import screens from '../../../Navigation/screens';
import Swiper from 'react-native-swiper';
import { useIsFocused } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
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
import { View } from 'react-native-animatable';
import FastImage from 'react-native-fast-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t } from 'i18next';
import i18n from 'i18next';
import { requestNotifications } from 'react-native-permissions';
import InAppReview from 'react-native-in-app-review';
import messaging from '@react-native-firebase/messaging';
import firebase from '@react-native-firebase/app';
import SkeletonCard from '../../../components/skeletonCard/SkeletonCard';
import useGetCategoryProducts from '../../../Api/hooks/useGetCategoryProducts';
import useGetHomeSection from '../../../Api/hooks/useGetHomeSection';
import { homePush } from '../../../helpers/HomePush';
import Translation from '../../../assets/i18n/Translation';
import { RootState } from '../../../redux/store';
import axios from 'axios';
import { AppEventsLogger } from 'react-native-fbsdk-next';
import { getReview, setReview } from '../../../AsyncStorage/StorageUtil';
import useGetOffer from '../../../Api/hooks/useGetOffer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useStallionUpdate, restart } from 'react-native-stallion';
import AnimatedModal from '../../../components/animatedModal/AnimatedModal';
import RestartModal from './RestartModal';
import { triggerHaptic } from '../../../Utils';

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
    id: 2,
  },
  {
    category: 'camping-goods-supplies',
    title: strings.campinggoods,
    item: [],
    id: 3,
    metaView: [],
    metaId: '15876423969',
  },
  { category: 'add-more-save-more', title: 'comboDeals', item: [], id: 4 },
  {
    category: 'qr-1-qr-29-deals',
    title: 'under30',
    item: [],
    id: 5,
    metaView: [],
    metaId: '15876522273',
  },
  {
    category: 'kitchen-improvement',
    title: strings.kitchenImprovement,
    item: [],
    id: 6,
  },
  {
    category: 'home-organization',
    title: strings.Homeorganization,
    item: [],
    id: 7,
    metaView: [],
    metaId: '44402147617',
  },
  { category: 'home-care', title: 'Home Care', item: [], id: 8 },
  {
    category: 'home-cleaning',
    title: strings.HomeCleaning,
    item: [],
    id: 9,
    metaView: [],
    metaId: '44902088993',
  },
  { category: 'racks-storage', title: strings.RacksStorage, item: [], id: 10 },
  {
    category: 'cooking-appliances',
    title: strings.CookingAppliances,
    item: [],
    metaView: [],
    metaId: '44902220065',
    id: 11,
  },
  { category: 'bags-pouches', title: strings.Bags, item: [], id: 12 },
  {
    category: 'bathroom-laundry-supplies',
    title: strings.BathCare,
    item: [],
    id: 13,
    metaView: [],
    metaId: '44902252833',
  },
  {
    category: 'fitness-personal-care',
    title: strings.BeautyFitness,
    item: [],
    id: 14,
  },
  {
    category: 'car-accessories',
    title: strings.CarAccessories,
    item: [],
    id: 15,
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

interface HomeProps {
  navigation: NativeStackNavigationProp<any>;
}

// Memoized banner item component
const BannerItem: FC<BannerItemProps> = React.memo(
  ({ item, index, navigation }) => {
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
          source={{ uri: item?.image_url }}
        />
      </TouchableWithoutFeedback>
    );
  },
);

const Home: FC<HomeProps> = ({ navigation }) => {
  // Hooks
  const { collections } = useGetCollections(100);
  const { offerList } = useGetOffer();
  const { bannerImagesEN, bannerImagesAR } = useGetHomeBannerList();
  const { getProducts } = useGetCategoryProducts();
  const { cartDetails, getCartData } = useGetCart();
  const getSectionData = useGetHomeSection();
  const { cart, createCart } = useCreateCart();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  // State
  const [categories, setCategories] = useState<Category[]>(MOUNTING_CATEGORY);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [categoryList1, setCategoryList1] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [isRestartModalVisible, setIsRestartModalVisible] =
    useState<boolean>(false);
  const [swiperData, setSwiperData] = useState<'en' | 'ar'>('en');
  const [flatListKey, setFlatListKey] = useState<string>('initial');

  // State to track initial categories loading
  const [initialCategoriesLoaded, setInitialCategoriesLoaded] = useState({
    specialOffer: false,
    newArrivals: false,
  });

  // const offerList = {
  //   hasVisible: false,
  // };
  // State for parallel loading
  const [isParallelLoading, setIsParallelLoading] = useState<boolean>(false);
  const [parallelLoadingComplete, setParallelLoadingComplete] =
    useState<boolean>(false);

  // Refs for performance
  const hasInitialized = useRef<boolean>(false);
  const loadingRef = useRef<boolean>(false);

  // Selectors
  const language = useSelector((state: any) => state.AuthReducer.language);
  const launch = useSelector((state: any) => state.globalReducer.launch);

  // Product hooks for initial categories
  const newArrivals = useGetProducts('new-arrivals', 12, '', 'CREATED_AT_DESC');
  const specialOffers: any = useGetProducts('special-offer', 12, '');

  const { isRestartRequired } = useStallionUpdate();

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

  // Parallel category fetching function
  const fetchAllCategoriesInParallel = useCallback(async (): Promise<void> => {
    if (isParallelLoading || parallelLoadingComplete) {
      console.log('Skipping parallel fetch: already loading or complete');
      return;
    }

    setIsParallelLoading(true);
    setCategoriesLoading(true);

    const categoriesToFetch = MOUNTING_CATEGORY.filter(
      cat =>
        cat.category !== 'special-offer' && cat.category !== 'new-arrivals',
    );

    try {
      console.log(
        'Starting parallel fetch for',
        categoriesToFetch.length,
        'categories',
      );

      const categoryPromises = categoriesToFetch.map(async category => {
        try {
          console.log(`Fetching products for: ${category.category}`);
          const products = await getProducts(category.category, 12);
          let metaView: any[] = [];
          if (category.metaId) {
            try {
              metaView = (await getSectionData(category.metaId)) || [];
              console.log(
                `Fetched section data for ${category.category}:`,
                metaView.length,
              );
            } catch (error) {
              console.error(
                `Section data error for ${category.category}:`,
                error,
              );
            }
          }

          return {
            ...category,
            item: Array.isArray(products) ? products : [],
            metaView: metaView,
          };
        } catch (error) {
          console.error(`Error fetching ${category.category}:`, error);
          return {
            ...category,
            item: [],
            metaView: [],
          };
        }
      });

      console.log('Waiting for all category promises to resolve...');
      const results = await Promise.all(categoryPromises);
      console.log('All category promises resolved, updating state');

      setCategories(prev => {
        const updatedCategories = [...prev];

        results.forEach(result => {
          const findIndex = updatedCategories.findIndex(
            cat => cat.category === result.category,
          );
          if (findIndex !== -1) {
            updatedCategories[findIndex] = {
              ...updatedCategories[findIndex],
              item: result.item,
              metaView: result.metaView || [],
            };
            console.log(
              `Updated ${result.category} with ${
                result.item.length
              } products and ${result.metaView?.length || 0} meta items`,
            );
          }
        });

        console.log('Updated all categories with parallel fetch results');
        return updatedCategories;
      });

      setParallelLoadingComplete(true);
    } catch (error) {
      console.error('Parallel category fetch error:', error);
    } finally {
      setCategoriesLoading(false);
      setIsParallelLoading(false);
    }
  }, [getProducts, getSectionData, isParallelLoading, parallelLoadingComplete]);

  // Optimized function to handle initial categories

  // const updateInitialCategories = useCallback(() => {
  //   console.log('Updating initial categories:', {
  //     specialOffers: {
  //       products: specialOffers?.products?.length || 0,
  //       loading: specialOffers?.loading,
  //       error: specialOffers?.error,
  //     },
  //     newArrivals: {
  //       products: newArrivals?.products?.length || 0,
  //       loading: newArrivals?.loading,
  //       error: newArrivals?.error,
  //     },
  //     offerVisible: offerList?.hasVisible,
  //   });

  //   setCategories(prev => {
  //     const updatedCategories = [...prev];
  //     let hasUpdates = false;

  //     // Update special-offer
  //     if (
  //       !initialCategoriesLoaded.specialOffer &&
  //       offerList?.hasVisible !== undefined
  //     ) {
  //       const specialOfferIndex = updatedCategories.findIndex(
  //         cat => cat.category === 'special-offer',
  //       );
  //       if (specialOfferIndex !== -1) {
  //         if (offerList?.hasVisible === false) {
  //           updatedCategories[specialOfferIndex] = {
  //             ...updatedCategories[specialOfferIndex],
  //             item: [],
  //           };
  //           console.log(
  //             'Special-offer disabled (hasVisible=false), set empty array',
  //           );
  //           setInitialCategoriesLoaded(prev => ({
  //             ...prev,
  //             specialOffer: true,
  //           }));
  //           hasUpdates = true;
  //         } else {
  //           // Set products immediately, even if still loading
  //           const products = Array.isArray(specialOffers?.products)
  //             ? specialOffers?.products
  //             : [];
  //           updatedCategories[specialOfferIndex] = {
  //             ...updatedCategories[specialOfferIndex],
  //             item: products,
  //           };
  //           console.log(
  //             'Special-offer enabled, set products:',
  //             products.length,
  //           );
  //           setInitialCategoriesLoaded(prev => ({
  //             ...prev,
  //             specialOffer: true,
  //           }));
  //           hasUpdates = true;
  //         }
  //       }
  //     }

  //     // Update new-arrivals
  //     if (!initialCategoriesLoaded.newArrivals && !newArrivals?.loading) {
  //       const newArrivalsIndex = updatedCategories.findIndex(
  //         cat => cat.category === 'new-arrivals',
  //       );
  //       if (newArrivalsIndex !== -1) {
  //         const products = Array.isArray(newArrivals?.products)
  //           ? newArrivals?.products
  //           : [];
  //         updatedCategories[newArrivalsIndex] = {
  //           ...updatedCategories[newArrivalsIndex],
  //           item: products,
  //         };
  //         console.log('Updated new-arrivals with', products.length, 'products');
  //         setInitialCategoriesLoaded(prev => ({ ...prev, newArrivals: true }));
  //         hasUpdates = true;
  //       }
  //     }

  //     // Start parallel loading as soon as offer status is known and new-arrivals is done
  //     if (
  //       offerList?.hasVisible !== undefined &&
  //       !newArrivals?.loading &&
  //       !parallelLoadingComplete &&
  //       !isParallelLoading
  //     ) {
  //       console.log(
  //         'Starting parallel loading - offer status known:',
  //         offerList?.hasVisible,
  //       );
  //       fetchAllCategoriesInParallel();
  //     }

  //     return hasUpdates ? updatedCategories : prev;
  //   });
  // }, [
  //   newArrivals?.products,
  //   newArrivals?.loading,
  //   specialOffers?.products,
  //   specialOffers?.loading,
  //   offerList?.hasVisible,
  //   initialCategoriesLoaded,
  //   parallelLoadingComplete,
  //   isParallelLoading,
  //   fetchAllCategoriesInParallel,
  // ]);

  const updateInitialCategories = useCallback(() => {
    console.log('Updating initial categories:', {
      specialOffers: {
        products: specialOffers?.products?.length || 0,
        loading: specialOffers?.loading,
        error: specialOffers?.error,
      },
      newArrivals: {
        products: newArrivals?.products?.length || 0,
        loading: newArrivals?.loading,
        error: newArrivals?.error,
      },
      offerVisible: offerList?.hasVisible,
    });

    setCategories(prev => {
      const updatedCategories = [...prev];
      let hasUpdates = false;

      // Update special-offer - Fix the logic here
      if (!initialCategoriesLoaded.specialOffer && !specialOffers?.loading) {
        const specialOfferIndex = updatedCategories.findIndex(
          cat => cat.category === 'special-offer',
        );

        if (specialOfferIndex !== -1) {
          // Check if offers are disabled
          if (offerList?.hasVisible === false) {
            updatedCategories[specialOfferIndex] = {
              ...updatedCategories[specialOfferIndex],
              item: [],
            };
            console.log(
              'Special-offer disabled (hasVisible=false), set empty array',
            );
          } else {
            // Set products if available
            const products = Array.isArray(specialOffers?.products)
              ? specialOffers?.products
              : [];
            updatedCategories[specialOfferIndex] = {
              ...updatedCategories[specialOfferIndex],
              item: products,
            };
            console.log(
              'Special-offer enabled, set products:',
              products.length,
            );
          }

          setInitialCategoriesLoaded(prev => ({
            ...prev,
            specialOffer: true,
          }));
          hasUpdates = true;
        }
      }

      // Rest of your logic remains the same...
      // Update new-arrivals
      if (!initialCategoriesLoaded.newArrivals && !newArrivals?.loading) {
        const newArrivalsIndex = updatedCategories.findIndex(
          cat => cat.category === 'new-arrivals',
        );
        if (newArrivalsIndex !== -1) {
          const products = Array.isArray(newArrivals?.products)
            ? newArrivals?.products
            : [];
          updatedCategories[newArrivalsIndex] = {
            ...updatedCategories[newArrivalsIndex],
            item: products,
          };
          console.log('Updated new-arrivals with', products.length, 'products');
          setInitialCategoriesLoaded(prev => ({ ...prev, newArrivals: true }));
          hasUpdates = true;
        }
      }

      // Start parallel loading when both are ready
      if (
        !specialOffers?.loading &&
        !newArrivals?.loading &&
        !parallelLoadingComplete &&
        !isParallelLoading
      ) {
        console.log('Starting parallel loading - initial categories loaded');
        fetchAllCategoriesInParallel();
      }

      return hasUpdates ? updatedCategories : prev;
    });
  }, [
    newArrivals?.products,
    newArrivals?.loading,
    specialOffers?.products,
    specialOffers?.loading,
    offerList?.hasVisible,
    initialCategoriesLoaded,
    parallelLoadingComplete,
    isParallelLoading,
    fetchAllCategoriesInParallel,
  ]);

  // Effect to update initial categories
  useEffect(() => {
    updateInitialCategories();
  }, [updateInitialCategories]);

  // Handle loading state
  useEffect(() => {
    if (
      initialCategoriesLoaded.specialOffer &&
      initialCategoriesLoaded.newArrivals &&
      loading
    ) {
      setLoading(false);
    }
  }, [initialCategoriesLoaded, loading]);

  // Timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn(
          'Initial categories loading timed out, forcing loading to false',
        );
        setLoading(false);
        if (!parallelLoadingComplete && !isParallelLoading) {
          fetchAllCategoriesInParallel();
        }
        setCategories(prev => {
          const updatedCategories = [...prev];
          if (!initialCategoriesLoaded.specialOffer) {
            const specialOfferIndex = updatedCategories.findIndex(
              cat => cat.category === 'special-offer',
            );
            if (specialOfferIndex !== -1) {
              updatedCategories[specialOfferIndex] = {
                ...updatedCategories[specialOfferIndex],
                item: [],
              };
              setInitialCategoriesLoaded(prev => ({
                ...prev,
                specialOffer: true,
              }));
              console.log('Timeout: Forced special-offer to empty array');
            }
          }
          return updatedCategories;
        });
        setFlatListKey(`timeout-${Date.now()}`);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [
    loading,
    initialCategoriesLoaded,
    parallelLoadingComplete,
    isParallelLoading,
  ]);

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
      const { data } = remoteMessage;
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
    const inAppUpdates = new SpInAppUpdates(false);

    try {
      const currentVersion = useTestVersion ? '2.0.1' : DeviceInfo.getVersion();

      const result = await inAppUpdates.checkNeedsUpdate({
        curVersion: currentVersion,
      });

      if (result.shouldUpdate) {
        const updateOptions =
          Platform.OS === 'android'
            ? { updateType: IAUUpdateKind.FLEXIBLE }
            : {};

        await inAppUpdates.startUpdate(updateOptions);
      }
    } catch (error: any) {
      const errorMessage = error?.message || '';

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
    ({ item }: any) => {
      if (
        item.category === 'special-offer' &&
        offerList?.hasVisible === false
      ) {
        console.log('Skipping special-offer render: hasVisible=false');
        return null;
      }

      return (
        <View key={item.id.toString()}>
          <SectionView
            viewAllPress={() => {
              triggerHaptic('impactHeavy');
              navigation.navigate(screens.productList, {
                title: item.title,
                category: item.category,
                offerList: offerList || {},
              });
            }}
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
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Banner Swiper */}
      {bannerImages?.length > 0 && (
        <View>
          <Swiper
            key={bannerImages.length}
            autoplay
            autoplayTimeout={6}
            style={styles.swiperContainer}
            dotColor={Colors.white}
            activeDotColor={Colors.black}
          >
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
                  ? { marginRight: getWidth(16) }
                  : { marginRight: getWidth(5) },
              ]}
            >
              <Translation textKey={strings.categories} />
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewAll}
            onPress={() => navigation.navigate(screens.explore)}
          >
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
      {loading ? (
        <SkeletonCard
          data={[12, 34]}
          chaildVieWidth={2}
          childViewHeight={3}
          containerMarginTop={10}
          ContainerHeight={3}
        />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          key={flatListKey}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={7}
          initialNumToRender={5}
          ListFooterComponent={
            categoriesLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : null
          }
        />
      )}
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
