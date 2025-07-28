import React, { useState, useRef, useEffect, FC, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Image,
  TextInput,
  StyleSheet,
} from "react-native";
import { getHeight, getWidth } from "../../Theme/Constants";
import icons from "../../assets/icons";
import Colors from "../../Theme/Colors";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

interface BottomSheetInterFace {
  isVisible: boolean;
  onClose(): any;
  onApply(minAmount: number, maxAmount: number, inStock: boolean, outOfStock: boolean): any;
}

const BottomSheetFilter: FC<BottomSheetInterFace> = ({
  isVisible,
  onClose,
  onApply,
}) => {
  const translateY = useRef<Animated.Value>(
    new Animated.Value(Dimensions.get("window").height)
  ).current;

  const [minAmount, setMinAmount] = useState(0);
  const [maxAmount, setMaxAmount] = useState(10000);
  const [inStock, setInStock] = useState(true);
  const [outOfStock, setOutOfStock] = useState(true);
  const [sliderOneChanging, setSliderOneChanging] = useState(false);

  // Memoized values to prevent unnecessary re-renders
  const sliderLength = useMemo(() => getWidth(1.2), []);
  const closeIconSize = useMemo(() => getHeight(55), []);

  // Memoized callbacks to prevent re-creation on every render
  const sliderOneValuesChangeStart = useCallback(() => setSliderOneChanging(true), []);
  const sliderOneValuesChangeFinish = useCallback(() => setSliderOneChanging(false), []);

  const handleValuesChange = useCallback((values: number[]) => {
    setMinAmount(values[0]);
    setMaxAmount(values[1]);
  }, []);

  const handleInStockToggle = useCallback(() => {
    setInStock(prev => !prev);
  }, []);

  const handleOutOfStockToggle = useCallback(() => {
    setOutOfStock(prev => !prev);
  }, []);

  const handleApply = useCallback(() => {
    onApply(minAmount, maxAmount, inStock, outOfStock);
  }, [minAmount, maxAmount, inStock, outOfStock, onApply]);

  useEffect(() => {
    if (isVisible) {
      showBottomSheet();
    }
  }, [isVisible]);

  const showBottomSheet = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [translateY]);

  const hideBottomSheet = useCallback(() => {
    Animated.timing(translateY, {
      toValue: Dimensions.get("window").height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [translateY, onClose]);

  // Memoized custom marker component
  const CustomMarker = useMemo(() => () => (
    <View style={styles.sliderMarker} />
  ), []);

  // Memoized checkbox components
  const CheckboxComponent = useCallback(({ isChecked }: { isChecked: boolean }) => (
    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
      {isChecked && <View style={styles.checkboxInner} />}
    </View>
  ), []);

  return (
    <Modal
      animationType="none" // Changed from "slide" to avoid conflict with custom animation
      transparent
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalBackground}>
        <Animated.View 
          style={[
            styles.bottomSheet,
            { transform: [{ translateY }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Image
                style={[styles.closeIcon, { height: closeIconSize, width: closeIconSize }]}
                source={icons.close}
              />
            </TouchableOpacity>
          </View>

          {/* Price Section */}
          <Text style={styles.sectionTitle}>Price</Text>
          <View style={styles.priceInputContainer}>
            <View style={styles.priceInput}>
              <Text style={styles.inputLabel}>Min</Text>
              <TextInput
                inputMode="numeric"
                value={String(minAmount)}
                editable={false}
                selectTextOnFocus={false}
                style={styles.inputText}
              />
            </View>
            <View style={styles.priceInput}>
              <Text style={styles.inputLabel}>Max</Text>
              <TextInput
                inputMode="numeric"
                value={String(maxAmount)}
                editable={false}
                selectTextOnFocus={false}
                style={styles.inputText}
              />
            </View>
          </View>

          {/* Slider */}
          <View style={styles.sliderContainer}>
            <MultiSlider
              values={[minAmount, maxAmount]}
              onValuesChange={handleValuesChange}
              onValuesChangeStart={sliderOneValuesChangeStart}
              onValuesChangeFinish={sliderOneValuesChangeFinish}
              min={0}
              max={1000}
              step={1}
              sliderLength={sliderLength}
              allowOverlap={false}
              snapped
              minMarkerOverlapDistance={30}
              selectedStyle={styles.sliderSelected}
              unselectedStyle={styles.sliderUnselected}
              trackStyle={styles.sliderTrack}
              customMarker={CustomMarker}
            />
          </View>

          {/* Availability Section */}
          <Text style={styles.availabilityTitle}>Availability</Text>
          
          <TouchableOpacity onPress={handleInStockToggle} activeOpacity={0.7}>
            <View style={styles.checkboxRow}>
              <CheckboxComponent isChecked={inStock} />
              <Text style={styles.checkboxLabel}>In stock</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOutOfStockToggle} activeOpacity={0.7}>
            <View style={[styles.checkboxRow, styles.lastCheckboxRow]}>
              <CheckboxComponent isChecked={outOfStock} />
              <Text style={styles.checkboxLabel}>Out of stock</Text>
            </View>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelButton}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={styles.applyButton}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 8,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    flexDirection: "row",
  },
  headerTitle: {
    flex: 1,
    alignSelf: "center",
    padding: 16,
    color: "black",
    fontWeight: "600",
    fontSize: 16,
  },
  closeButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  closeIcon: {
    // Dynamic dimensions will be applied inline
  },
  sectionTitle: {
    padding: 16,
    color: "black",
    fontSize: 16,
    fontWeight: "500",
  },
  priceInputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  priceInput: {
    backgroundColor: Colors.accent,
    flex: 1,
    borderColor: Colors.primary,
    borderWidth: 0.5,
    borderRadius: 6,
    marginHorizontal: 4,
    padding: 8,
  },
  inputLabel: {
    color: "#666",
    fontSize: 12,
    marginBottom: 4,
  },
  inputText: {
    color: "black",
    fontWeight: "500",
    fontSize: 14,
  },
  sliderContainer: {
    justifyContent: "center",
    marginHorizontal: 16,
    alignSelf: "center",
    marginTop: 16,
  },
  sliderSelected: {
    backgroundColor: Colors.black,
  },
  sliderUnselected: {
    backgroundColor: "silver",
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderMarker: {
    height: 20,
    width: 20,
    backgroundColor: Colors.black,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  availabilityTitle: {
    color: "black",
    marginLeft: 16,
    marginTop: 24,
    fontSize: 16,
    fontWeight: "500",
  },
  checkboxRow: {
    flexDirection: "row",
    marginLeft: 16,
    marginTop: 16,
    alignItems: "center",
  },
  lastCheckboxRow: {
    marginBottom: 24,
  },
  checkbox: {
    borderWidth: 0.5,
    height: 20,
    width: 20,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    height: 12,
    width: 12,
    backgroundColor: "white",
  },
  checkboxLabel: {
    marginLeft: 8,
    color: "black",
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    margin: 16,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: Colors.primary,
    marginRight: 8,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: Colors.primary,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  applyButton: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginLeft: 8,
    paddingVertical: 12,
  },
  applyButtonText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default BottomSheetFilter;