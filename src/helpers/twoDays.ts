import AsyncStorage from '@react-native-async-storage/async-storage';
const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

 export const callFunctionEveryTwoDays = async () => {
  const lastRun = await AsyncStorage.getItem('lastRun');
  const now = new Date().getTime();

  if (!lastRun || now - parseInt(lastRun) >TWO_DAYS) {
    // Call your function
     await AsyncStorage.setItem('cartId','');
    // Save current time
    await AsyncStorage.setItem('lastRun', now.toString());
  }
};
