import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import { Account, Cart, Explore, Home } from '../screens';
import CustomTab from './CustomTab';
import CommonStyles from '../Theme/CommonStyles';
import { HomeHeader } from '../components';
import Colors from '../Theme/Colors';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCreateCart, useGetCart } from '../Api/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { updateCount } from '../redux/reducers/CartReducer';
import { updateLaunch } from '../redux/reducers/GlobalReducer';
import LinearGradient from 'react-native-linear-gradient';
import { View } from 'react-native-animatable';
import { getHeight, lightenColor } from '../Theme/Constants';

const HomeTabs = () => {
  const isFocused = useIsFocused();
  const Tab = createBottomTabNavigator();
  const { cartDetails, getCartData }: any = useGetCart();
  const { cart, createCart }: any = useCreateCart();
  const dispatch = useDispatch();
  //const [count, setCount] = useState<any>(0);
  const { count } = useSelector((state: RootState) => state.CartReducer);
  const customTabMenu = (props: any) => {
    return <CustomTab cartCount={count} />;
  };
  const setHomeHeader = (props: any) => {
    return <HomeHeader {...props} />;
  };

  useEffect(() => {
    if (isFocused) {
      getCheckoutId();
    }
  }, [isFocused]);

  const storeCheckoutId = async (value: any) => {
    try {
      console.log('Storing checkoutId:', value);

      await AsyncStorage.setItem('checkoutId', value);
    } catch (e) {
      // saving error
    }
  };

  const getCheckoutId = async () => {
    try {
      const value = await AsyncStorage.getItem('checkoutId');
      console.log(value, 'valuevalue');

      if (value !== null) {
        getCartData();
      } else {
        //create cart if no checkoutId present
        await AsyncStorage.removeItem('checkoutId');
        createCart();
      }
    } catch (e) {
      // error reading value
    }
  };

  // get cartId (checkoutId) after creating cart and store to local storage
  useEffect(() => {
    if (cart) {
      storeCheckoutId(cart?.cartCreate?.cart?.id);
      // storeCheckoutId(cart?.checkoutCreate?.checkout?.id)
    }
  }, [cart]);

  return (
    <>
      <View style={styles.container}>
        {/* Transparent StatusBar */}
        <StatusBar
          barStyle="dark-content"
          translucent
          backgroundColor="transparent"
        />

        {/* Gradient background for the top */}

        {/* Your Tab Navigator */}
        
        <Tab.Navigator
          screenOptions={{
            header: () => null,
            // tabBarStyle: styles.tabBar,
          }}
          tabBar={customTabMenu}
        >
          <Tab.Screen
            options={{ header: props => setHomeHeader(props) }}
            name="HOME"
            component={Home}
          />
          <Tab.Screen name="EXPLORE" component={Explore} />
          <Tab.Screen name="CART" component={Cart} />
          <Tab.Screen name="ACCOUNT" component={Account} />
        </Tab.Navigator>
      </View>
    </>
  );
};
export default HomeTabs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: getHeight(1),
  },
});
