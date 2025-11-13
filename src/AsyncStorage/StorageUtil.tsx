import AsyncStorage from '@react-native-async-storage/async-storage';

export const setLogin = async (value: any): Promise<void> => {
  try {
    await AsyncStorage.setItem('login', JSON.stringify(value));
  } catch (error) {
  }
};

export const getLogin = async () => {
  try {
    const value = await AsyncStorage.getItem('login');
    if (value !== null) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    return null;
  }
};
export const setReview = (review: string, bool: string) => {
  try {
    AsyncStorage.setItem(review, bool);
  } catch (error: any) {
    return null;
  }
};
export const getReview = async (data: string) => {
  try {
    const hasReviewed = await AsyncStorage.getItem(data);
    return hasReviewed;
  } catch (error) {
    return null;
  }
};
export const firstUser = async (user: string, status: string) => {
  try {
    await AsyncStorage.setItem(user, status);
  } catch (error) {
    return null;
  }
};
export const getFirstUser = async (user: string) => {
  try {
    const userStatus = await AsyncStorage.getItem(user);
    return userStatus;
  } catch (error) {
    return null;
  }
};
export const firstUserLaunch = async (user: string, status: string) => {
  try {
    await AsyncStorage.setItem(user, status);
  } catch (error) {
    return null;
  }
};
export const getFirstUserLaunch = async (user: string) => {
  try {
    const userStatus = await AsyncStorage.getItem(user);
    return userStatus;
  } catch (error) {
    return null;
  }
};
const isJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Set many key/value pairs in one call.
 *
 * @example
 * await setMulti([
 *   ['userId', 123],
 *   ['profile', { name: 'Ali', dark: true }],
 *   ['token', 'abc123'],
 * ]);
 */
export const setMulti = async (pairs: [string, any][]): Promise<void> => {
  const formatted: [string, string][] = pairs.map(([k, v]) => [
    k,
    typeof v === 'string' ? v : JSON.stringify(v),
  ]);
  try {
    await AsyncStorage.multiSet(formatted);
  } catch (e) {
    console.error('setMulti error:', e);
    throw e;
  }
};

/**
 * Get many keys in one call.
 *
 * Returns a **Map** (key → parsed value). Non-JSON values stay as strings.
 *
 * @example
 * const data = await getMulti(['userId', 'profile', 'token']);
 * console.log(data.get('profile')); // → { name: 'Ali', dark: true }
 */
export const getMulti = async (
  keys: string[]
): Promise<Map<string, any> | null> => {
  try {
    const result = await AsyncStorage.multiGet(keys);
    const map = new Map<string, any>();
    result.forEach(([k, v]) => {
      if (v === null) return;
      map.set(k, isJSON(v) ? JSON.parse(v) : v);
    });
    return map;
  } catch (e) {
    console.error('getMulti error:', e);
    return null;
  }
};

/**
 * All stored keys.
 */
export const getAllKeysAsync = async (): Promise<readonly string[]> => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (e) {
    console.error('getAllKeys error:', e);
    return [];
  }
};

/**
 * Wipe everything.
 */
export const clearAllAsync = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.error('clearAll error:', e);
    throw e;
  }
};

export const STORAGE_KEYS = {
  DISCOUNT_CODE: 'gift_discount_code',
  GIFT: 'gift_item',
  GIFT_THRESHOLD: 'gift_threshold',
  PRODUCT_ID: 'gift_product_id',
  ORIGINAL_PRICE: 'gift_original_price',
} as const;