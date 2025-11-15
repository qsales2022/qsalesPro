// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Linking,
// } from "react-native";
// import React, { useState, useEffect } from "react";
// import { getHeight } from "../../Theme/Constants";
// import Colors from "../../Theme/Colors";
// import SvgIcon from "../../assets/SvgIcon";
// import screens from "../screens";
// import strings from "../../assets/i18n/strings";
// import Translation from "../../assets/i18n/Translation";
// import { useNavigation } from "@react-navigation/native";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../redux/store";
// import { updateSelectedTab } from "../../redux/reducers/GlobalReducer";
// import { triggerHaptic } from "../../Utils";

// interface CartIconWithBadgeProps {
//   cartCount: number;
// }

// const CustomTab: React.FC<CartIconWithBadgeProps> = ({ cartCount }) => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const { selectedTab } = useSelector(
//     (state: RootState) => state.globalReducer
//   );
//   const menus = [
//     {
//       id: 1,
//       label: strings.home,
//       screen: screens.home,
//       icon: SvgIcon.HomeIcon,
//       showBadge: false,
//     },
//     {
//       id: 2,
//       screen: screens.explore,
//       label: strings.explore,
//       icon: SvgIcon.ExploreIcon,
//       showBadge: false,
//     },
//     // {
//     //   id: 3,
//     //   screen: "message",
//     //   label: strings.message,
//     //   icon: SvgIcon.MessageIcon,
//     //   showBadge: false,
//     // },
//     {
//       id: 4,
//       screen: screens.cart,
//       label: strings.cart,
//       icon: SvgIcon.CartIcon,
//       showBadge: true,
//     },
//     {
//       id: 5,
//       screen: screens.account,
//       label: strings.account,
//       icon: SvgIcon.AccountIcon,
//       showBadge: false,
//     },
//   ];
//   const openWhatsApp = async () => {
//     const whatsappLink =
//       "https://api.whatsapp.com/send?phone=+97470119277&text=Hai";

//     // Check if WhatsApp is available on the device.
//     const canOpenWhatsApp = await Linking.canOpenURL(whatsappLink);
//     if (!canOpenWhatsApp) {
//       Linking.openURL(whatsappLink)
//         .then((data) => {
//         })
//         .catch((error) => {
//         });
//     } else {
//       // Handle the case where WhatsApp is not available on the device.
//       // console.log("WhatsApp is not available on this device.");
//       // You can provide a fallback option here.
//     }
//   };
//   useEffect(() => {
//     // console.log(selectedTab, "TAb====");
//   }, [selectedTab]);
//   return (
//     <View style={styles.container}>
//       {menus.map((item: any, index: number) => {
//         let Icon = item?.icon;
//         console.log(
//           index == selectedTab ? selectedTab : null,
//           "INDEXXXXXXX",
//           selectedTab
//         );
//         return (
//           <TouchableOpacity
//             onPress={() => {

//               if (item.screen) {
//                 if (item.screen === "message") {
//                   openWhatsApp();
//                 } else {
//                   dispatch(updateSelectedTab(index));
//                   navigation.navigate(item?.screen);
//                 }
//               }
//               triggerHaptic("impactHeavy")
//             }}
//             key={index}
//             style={styles.bottomIconContainer}
//           >
//             {item.icon ? (
//               item.showBadge ? (
//                 <View style={styles.container2}>
//                   <Icon
//                     // fill={
//                     //   (index === selectedTab && index !== 2) ||
//                     //   (selectedTab == 2 && index == 3)
//                     //     ? Colors.primary
//                     //     : Colors.iconGray
//                     // }
//                     fill={index === selectedTab ? Colors.primary : Colors.iconGray}
//                     height={getHeight(28)}
//                     width={getHeight(28)}
//                   />
//                   {cartCount > 0 && (
//                     <View style={styles.badge}>
//                       <Text style={styles.badgeText}>{cartCount}</Text>
//                     </View>
//                   )}
//                 </View>
//               ) : (
//                 <Icon
//                     // fill={
//                     //   (index === selectedTab && index !== 2) ||
//                     //   (selectedTab == 2 && index == 3)
//                     //     ? Colors.primary
//                     //     : Colors.iconGray
//                     // }
//                     fill={index === selectedTab ? Colors.primary : Colors.iconGray}
//                   height={getHeight(28)}
//                   width={getHeight(28)}
//                 />
//               )
//             ) : null}
//             <Text
//               style={[
//                 styles.menuTxt,
//                 {
//                   color: index === selectedTab ? Colors.primary : Colors.iconGray
//                   // (index === selectedTab && index !== 2) ||
//                   // (selectedTab == 2 && index == 3)
//                   //   ? Colors.primary
//                   //   : Colors.black,
//                 },
//               ]}
//             >
//               <Translation textKey={item.label} />
//             </Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// };
// const styles = StyleSheet.create({
//   container: {
//     height: getHeight(15),
//     flexDirection: "row",
//     borderTopWidth: 1,
//     borderTopColor: Colors.borderGray,
//     backgroundColor: Colors.white,
//   },
//   bottomIconContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   menuTxt: {
//     fontSize: getHeight(65),
//   },
//   container2: {
//     position: "relative",
//   },
//   badge: {
//     position: "absolute",
//     top: -2,
//     right: -2,
//     backgroundColor: "black",
//     borderRadius: 7,
//     width: 14,
//     height: 14,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   badgeText: {
//     color: "white",
//     fontWeight: "bold",
//     fontSize: 9,
//   },
// });
// export default CustomTab;

// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Linking,
//   Platform,
//   TouchableNativeFeedback,
// } from 'react-native';
// import React, { useState, useEffect } from 'react';
// import { getHeight, getWidth } from '../../Theme/Constants';
// import Colors from '../../Theme/Colors';
// import SvgIcon from '../../assets/SvgIcon';
// import screens from '../screens';
// import strings from '../../assets/i18n/strings';
// import Translation from '../../assets/i18n/Translation';
// import { useNavigation } from '@react-navigation/native';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../../redux/store';
// import { updateSelectedTab } from '../../redux/reducers/GlobalReducer';
// import { triggerHaptic } from '../../Utils';

// interface CartIconWithBadgeProps {
//   cartCount: number;
// }

// const CustomTab: React.FC<CartIconWithBadgeProps> = ({ cartCount }) => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const { selectedTab } = useSelector(
//     (state: RootState) => state.globalReducer,
//   );
//   const menus = [
//     {
//       id: 1,
//       label: strings.home,
//       screen: screens.home,
//       icon: SvgIcon.HomeIcon,
//       showBadge: false,
//     },
//     {
//       id: 2,
//       screen: screens.explore,
//       label: strings.explore,
//       icon: SvgIcon.ExploreIcon,
//       showBadge: false,
//     },
//     // {
//     //   id: 3,
//     //   screen: "message",
//     //   label: strings.message,
//     //   icon: SvgIcon.MessageIcon,
//     //   showBadge: false,
//     // },
//     {
//       id: 4,
//       screen: screens.cart,
//       label: strings.cart,
//       icon: SvgIcon.CartIcon,
//       showBadge: true,
//     },
//     {
//       id: 5,
//       screen: screens.account,
//       label: strings.account,
//       icon: SvgIcon.AccountIcon,
//       showBadge: false,
//     },
//   ];

//   const openWhatsApp = async () => {
//     const whatsappLink =
//       'https://api.whatsapp.com/send?phone=+97470119277&text=Hai';

//     // Check if WhatsApp is available on the device.
//     const canOpenWhatsApp = await Linking.canOpenURL(whatsappLink);
//     if (!canOpenWhatsApp) {
//       Linking.openURL(whatsappLink)
//         .then(data => {})
//         .catch(error => {});
//     } else {
//       // Handle the case where WhatsApp is not available on the device.
//       // console.log("WhatsApp is not available on this device.");
//       // You can provide a fallback option here.
//     }
//   };

//   useEffect(() => {
//     // console.log(selectedTab, "TAb====");
//   }, [selectedTab]);

//   return (
//     <View style={styles.container}>
//       {menus.map((item: any, index: number) => {
//         let Icon = item?.icon;
//         console.log(
//           index == selectedTab ? selectedTab : null,
//           'INDEXXXXXXX',
//           selectedTab,
//         );
//         const TouchableComponent =
//           Platform.OS === 'android'
//             ? TouchableNativeFeedback
//             : TouchableOpacity;
//         const touchableProps =
//           Platform.OS === 'android'
//             ? {
//                 background: TouchableNativeFeedback.Ripple(
//                   Colors.placeholderColor,
//                   true,
//                 ),
//                 useForeground: true,
//               }
//             : {
//                 activeOpacity: 0.7,
//               };

//         // Wrap TouchableComponent in a View with overflow: 'hidden' and circular borderRadius
//         return (
//           <View key={index} style={styles.bottomIconContainer}>
//             <View style={styles.rippleWrapper}>
//               <TouchableComponent
//                 onPress={() => {
//                   if (item.screen) {
//                     if (item.screen === 'message') {
//                       openWhatsApp();
//                     } else {
//                       dispatch(updateSelectedTab(index));
//                       navigation.navigate(item?.screen);
//                     }
//                   }
//                   triggerHaptic('impactHeavy');
//                 }}
//                 // style={styles.touchableArea}
//                 {...touchableProps}
//               >
//                 <View style={styles.tabItemWrapper}>
//                   {item.icon ? (
//                     item.showBadge ? (
//                       <View style={styles.container2}>
//                         <Icon
//                           fill={
//                             index === selectedTab
//                               ? Colors.primary
//                               : Colors.iconGray
//                           }
//                           height={getHeight(28)}
//                           width={getHeight(28)}
//                         />
//                         {cartCount > 0 && (
//                           <View style={styles.badge}>
//                             <Text style={styles.badgeText}>{cartCount}</Text>
//                           </View>
//                         )}
//                       </View>
//                     ) : (
//                       <Icon
//                         fill={
//                           index === selectedTab
//                             ? Colors.primary
//                             : Colors.iconGray
//                         }
//                         height={getHeight(28)}
//                         width={getHeight(28)}
//                       />
//                     )
//                   ) : null}
//                   <Text
//                     style={[
//                       styles.menuTxt,
//                       {
//                         color:
//                           index === selectedTab
//                             ? Colors.primary
//                             : Colors.iconGray,
//                       },
//                     ]}
//                   >
//                     <Translation textKey={item.label} />
//                   </Text>
//                 </View>
//               </TouchableComponent>
//             </View>
//           </View>
//         );
//       })}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     height: getHeight(13),
//     flexDirection: 'row',
//     borderTopWidth: 1,
//     borderTopColor: Colors.borderGray,
//     backgroundColor: Colors.white,
//   },
//   bottomIconContainer: {
//     flex: 1,
//     margin: 4,
//     // No overflow or borderRadius here, handled by rippleWrapper
//   },
//   rippleWrapper: {
//     flex: 1,
//     borderRadius: 50, // match icon size for circular ripple
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   touchableArea: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//   },
//   tabItemWrapper: {
//   justifyContent: 'center',
//   alignItems: 'center',
//   width: getWidth(4),
//   height: getWidth(4),
//   borderRadius: getWidth(4) / 2,
// },

//   menuTxt: {
//     fontSize: getHeight(65),
//     marginTop: 2,
//   },
//   container2: {
//     position: 'relative',
//   },
//   badge: {
//     position: 'absolute',
//     top: -2,
//     right: -2,
//     backgroundColor: 'black',
//     borderRadius: 7,
//     width: 14,
//     height: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   badgeText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 9,
//   },
// });

// export default CustomTab;





import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  TouchableNativeFeedback,
} from "react-native";
import React, { useState, useEffect } from "react";
import { getHeight, lightenColor } from "../../Theme/Constants";
import Colors from "../../Theme/Colors";
import SvgIcon from "../../assets/SvgIcon";
import screens from "../screens";
import strings from "../../assets/i18n/strings";
import Translation from "../../assets/i18n/Translation";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { updateSelectedTab } from "../../redux/reducers/GlobalReducer";
import { triggerHaptic } from "../../Utils";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface CartIconWithBadgeProps {
  cartCount: number;
}

const CustomTab: React.FC<CartIconWithBadgeProps> = ({ cartCount }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { selectedTab } = useSelector(
    (state: RootState) => state.globalReducer
  );
  const menus = [
    {
      id: 1,
      label: strings.home,
      screen: screens.home,
      icon: SvgIcon.HomeIcon,
      showBadge: false,
    },
    {
      id: 2,
      screen: screens.explore,
      label: strings.explore,
      icon: SvgIcon.ExploreIcon,
      showBadge: false,
    },
    // {
    //   id: 3,
    //   screen: "message",
    //   label: strings.message,
    //   icon: SvgIcon.MessageIcon,
    //   showBadge: false,
    // },
    {
      id: 4,
      screen: screens.cart,
      label: strings.cart,
      icon: SvgIcon.CartIcon,
      showBadge: true,
    },
    {
      id: 5,
      screen: screens.account,
      label: strings.account,
      icon: SvgIcon.AccountIcon,
      showBadge: false,
    },
  ];
  
  const openWhatsApp = async () => {
    const whatsappLink =
      "https://api.whatsapp.com/send?phone=+97470119277&text=Hai";

    // Check if WhatsApp is available on the device.
    const canOpenWhatsApp = await Linking.canOpenURL(whatsappLink);
    if (!canOpenWhatsApp) {
      Linking.openURL(whatsappLink)
        .then((data) => {
        })
        .catch((error) => {
        });
    } else {
      // Handle the case where WhatsApp is not available on the device.
      // console.log("WhatsApp is not available on this device.");
      // You can provide a fallback option here.
    }
  };
  
  useEffect(() => {
    // console.log(selectedTab, "TAb====");
  }, [selectedTab]);
  
  return (
    <View style={styles.container}>
      {menus.map((item: any, index: number) => {
        let Icon = item?.icon;
        console.log(
          index == selectedTab ? selectedTab : null,
          "INDEXXXXXXX",
          selectedTab
        );
        const TouchableComponent = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
        const touchableProps = Platform.OS === 'android' 
          ? {
              background: TouchableNativeFeedback.Ripple(lightenColor(Colors.red,10) , true,33),
              useForeground: true,
            }
          : {
              activeOpacity: 0.7,
            };

        return (
          <View key={index} style={styles.bottomIconContainer}>
            <TouchableComponent
              onPress={() => {
                if (item.screen) {
                  if (item.screen === "message") {
                    openWhatsApp();
                  } else {
                    dispatch(updateSelectedTab(index));
                    navigation.navigate(item?.screen);
                  }
                }
                triggerHaptic("impactHeavy")
              }}
              style={styles.touchableArea}
              {...touchableProps}
            >
            <View style={styles.tabItemWrapper}>
              {item.icon ? (
                item.showBadge ? (
                  <View style={styles.container2}>
                    <Icon
                      fill={index === selectedTab ? Colors.primary : Colors.iconGray}
                      height={getHeight(28)}
                      width={getHeight(28)}
                    />
                    {cartCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{cartCount}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Icon
                    fill={index === selectedTab ? Colors.primary : Colors.iconGray}
                    height={getHeight(28)}
                    width={getHeight(28)}
                  />
                )
              ) : null}
              <Text
                style={[
                  styles.menuTxt,
                  {
                    color: index === selectedTab ? Colors.primary : Colors.iconGray
                  },
                ]}
              >
                <Translation textKey={item.label} />
              </Text>
            </View>
            </TouchableComponent>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: getHeight(13),
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.borderGray,
    backgroundColor: Colors.white,
  },
  bottomIconContainer: {
    flex: 1,
    borderRadius: 50,
    margin: 4,
    overflow: 'visible',
  },
  touchableArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: 'green',
    width: '100%',
  },
  tabItemWrapper: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  menuTxt: {
    fontSize: getHeight(75),
    marginTop: 2,
  },
  container2: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "black",
    borderRadius: 7,
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 9,
  },
});

export default CustomTab;