
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { getHeight, getWidth, lightenColor } from '../../Theme/Constants';
import images from '../../assets/Images';
import SvgIcon from '../../assets/SvgIcon';
import Colors from '../../Theme/Colors';
import LanguageModel from '../LanguageModel/LanguageModel';
import { useNavigation } from '@react-navigation/native';
import screens from '../../Navigation/screens';
import { useTranslation } from 'react-i18next';
import LinearGradient from 'react-native-linear-gradient';




const HomeHeader: React.FC = () => {
  const [languageVisible, setVisible] = useState<boolean>(false);
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[lightenColor(Colors.yellow, 10), lightenColor(Colors.yellow, 80)]}

      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* Header Logo */}
        <TouchableOpacity style={styles.logoContainer}>
          <Image
            resizeMode="contain"
            style={styles.headerIcon}
            source={images.HeaderIcon}
          />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate(screens.search)}
            style={styles.searchBox}
            activeOpacity={0.8}
          >
            <SvgIcon.SearchIcon height={getHeight(35)} />
            <Text style={styles.searchPlaceholder}>
              {t('search')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Language Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={() => setVisible(true)}
            style={styles.languageBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.languageText}>E/A</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            onPress={() => navigation.navigate(screens.notification)}
            style={styles.notificationBtn}
            activeOpacity={0.8}
          >
            <SvgIcon.NotificationIcon
              width={getHeight(25)}
              height={getHeight(25)}
            />
          </TouchableOpacity>
        </View>
      </View>

      <LanguageModel 
        onClose={() => setVisible(false)} 
        visible={languageVisible} 
      />
    </LinearGradient>
  );
};

export default HomeHeader;

const styles = StyleSheet.create({
  container: {
    height: getHeight(8),
    width: '100%',
    paddingHorizontal: getWidth(20),
    paddingTop: getHeight(20),
    paddingBottom: getHeight(20),
    display:"flex",
    justifyContent: "space-between",
    // alignItems:"center"
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
    paddingHorizontal: getWidth(40),
  },
  logoContainer: {
    flex: 2,
    height: '200%',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerIcon: {
    width: '100%',
    height: '100%',
    maxWidth: getWidth(3),
    maxHeight: getHeight(10),
  },
  searchContainer: {
    flex: 4,
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getWidth(50),
  },
  searchBox: {
    width: '100%',
    height: '100%',
    backgroundColor: lightenColor(Colors.white,10),
    borderRadius: getHeight(60),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getWidth(50),
    minHeight: getHeight(25),
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: getWidth(80),
    fontSize: getHeight(50),
    color: Colors.black,
    opacity: 0.7,
  },
  actionContainer: {
    flex: 1,
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageBtn: {
    width: getHeight(20),
    height: getHeight(20),
    backgroundColor: 'rgba(226, 206, 221, 0.3)',
    borderWidth: 1,
    borderColor: '#e2cedd',
    borderRadius: getHeight(80),
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageText: {
    color: Colors.black,
    fontSize: getHeight(60),
    fontWeight: '500',
  },
  notificationBtn: {
    width: getHeight(20),
    height: getHeight(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
});