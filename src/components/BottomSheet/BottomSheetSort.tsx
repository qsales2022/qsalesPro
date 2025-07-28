import React, { useState, useRef, useEffect, FC, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Image,
  StyleSheet,
} from "react-native";
import { getHeight, getWidth } from "../../Theme/Constants";
import icons from "../../assets/icons";
import Colors from "../../Theme/Colors";
import { logger } from "../../Utils";

export const enum sortType {
  MANUAL = "MANUAL",
  PRICE_ASC = "PRICE_ASC",
  PRICE_DESC = "PRICE_DESC",
  TITLE_ASC = "TITLE_ASC",
  TITLE_DESC = "TITLE_DESC",
  BEST_SELLING = "BEST_SELLING",
  CREATED_AT_ASC = "CREATED_AT_ASC",
  CREATED_AT_DESC = "CREATED_AT_DESC",
}

interface BottomSheetInterFace {
  isVisible: boolean;
  onClose(): any;
  onApply(sortType: sortType): any;
  selectedSort: sortType;
  setSelectedSort: (sortType: sortType) => void;
}

interface SortOption {
  value: sortType;
  label: string;
}

const BottomSheetSort: FC<BottomSheetInterFace> = ({
  isVisible,
  onClose,
  onApply,
  selectedSort, 
  setSelectedSort,
}) => {
  const translateY = useRef<Animated.Value>(
    new Animated.Value(Dimensions.get("window").height)
  ).current;




  // Memoized sort options to prevent re-creation
  const sortOptions: SortOption[] = useMemo(() => [
    { value: sortType.MANUAL, label: "Featured" },
    { value: sortType.PRICE_ASC, label: "Price (Low to high)" },
    { value: sortType.PRICE_DESC, label: "Price (High to low)" },
    { value: sortType.BEST_SELLING, label: "Best selling" },
    { value: sortType.CREATED_AT_ASC, label: "Date, old to new" },
    { value: sortType.CREATED_AT_DESC, label: "Date, new to old" },

  ], []);

  // Memoized close icon size
  const closeIconSize = useMemo(() => getHeight(55), []);

  // Memoized callbacks
  const handleApply = useCallback(() => {
    onApply(selectedSort);
  }, [selectedSort, onApply]);

  const handleSortSelect = useCallback((sort: sortType) => {
    setSelectedSort(sort);
  }, []);

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

  // Memoized Radio Button Component
  const RadioButton = useMemo(() => ({ isSelected }: { isSelected: boolean }) => (
    <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
      {isSelected && <View style={styles.radioButtonInner} />}
    </View>
  ), []);

  // Memoized Sort Item Component
  const SortItem = useCallback(({ option }: { option: SortOption }) => (
    <TouchableOpacity
      onPress={() => handleSortSelect(option.value)}
      style={styles.sortItem}
      activeOpacity={0.7}
    >
      <View style={styles.sortItemContent}>
        <RadioButton isSelected={selectedSort === option.value} />
        <Text style={styles.sortItemText}>{option.label}</Text>
      </View>
    </TouchableOpacity>
  ), [selectedSort, handleSortSelect, RadioButton]);

  return (
    <Modal
      animationType="none"
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
            <Text style={styles.headerTitle}>Sort</Text>
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

          {/* Sort Options */}
          <View style={styles.sortOptionsContainer}>
            {sortOptions.map((option) => (
              <SortItem key={option.value} option={option} />
            ))}
          </View>

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
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
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
  sortOptionsContainer: {
    paddingVertical: 8,
  },
  sortItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortItemText: {
    marginLeft: 12,
    color: "black",
    fontSize: 14,
    flex: 1,
  },
  radioButton: {
    borderWidth: 0.5,
    height: 20,
    width: 20,
    borderRadius: 10,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    backgroundColor: Colors.primary,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    margin: 16,
    marginTop: 8,
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

export default BottomSheetSort;