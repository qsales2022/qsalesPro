import {createSlice} from '@reduxjs/toolkit';
export interface GlobalSliceInterface {
  isLoading: boolean;
  sum: number;
  accessToken: string;
  refreshToken: string;
  showAlert: {
    title: string;
    message: string;
    isOpen: boolean;
  };
  selectedEquipment: any;
  selectedTab: any;
  launch: boolean;
  details:{
    discountCode: string;
    gift: boolean;
    giftThreshold: number;
    productId: string;
    originalPrice?: number;
  }

}
const initialState: GlobalSliceInterface = {
  isLoading: false,
  showAlert: {
    title: '',
    message: '',
    isOpen: false,
  },
  accessToken: '',
  refreshToken: '',
  sum: 0,
  selectedEquipment: null,
  selectedTab: 0,
  launch: false,
  details:{
    discountCode: '',
    gift: false,
    giftThreshold: 0,
    productId: '',
    originalPrice: 0,
  }
};
export const globalSlice = createSlice({
  name: 'globalReducer',
  initialState,
  reducers: {
    toggleLoader: (state, action) => {
      state.isLoading = action.payload;
    },
    showAlert: (state, action) => {
      let alert = {...action.payload, isOpen: true};
      state.showAlert = alert;
    },
    hideAlert: state => {
      state.showAlert = initialState.showAlert;
    },
    updateEquipment: (state, action) => {
      state.selectedEquipment = action.payload;
    },
    updateSelectedTab: (state, action) => {
      state.selectedTab = action.payload;
    },
    updateSum: (state, action) => {
      state.sum = action.payload;
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload.accessToken;
    },
    updateLaunch: (state, action) => {      
      state.launch = action.payload;
    },
    giftDetails: (state, action) => {
      state.details = action.payload;
    }
  },
});
export const {
  toggleLoader,
  updateSum,
  updateEquipment,
  updateAccessToken,
  updateSelectedTab,
  updateLaunch,
  giftDetails
} = globalSlice.actions;
export default globalSlice.reducer;
