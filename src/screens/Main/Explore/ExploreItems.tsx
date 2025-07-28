import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
} from "react-native";
import React, { FC } from "react";
import { getHeight, getWidth } from "../../../Theme/Constants";
import Colors from "../../../Theme/Colors";
import FastImage from "react-native-fast-image";
import Translation from "../../../assets/i18n/Translation";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import screens from "../../../Navigation/screens";

interface ExploreViewInterface {
  title: string;
  items: any[];
  viewAllPress: any;
}

const ExploreItems: FC<ExploreViewInterface> = ({
  title = "Best",
  items = [],
  viewAllPress,
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamListBase>>();
  console.log(items, 'this is items');
  
  return (
    <>
      <View style={styles.listContainer}>
        <View style={styles.listView}>
          <Text style={styles.title}>
            <Translation textKey={title} />
          </Text>
          <TouchableOpacity 
            style={{ display: 'flex', flexDirection: 'row' }}
            onPress={viewAllPress}
          >
            <Text style={styles.textView1}>
              <Translation textKey={"viewAll"} />
            </Text>
            <Text style={styles.textView1}>{' >>'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <FlatList
        data={items}
        horizontal
        removeClippedSubviews={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item?.node?.handle || index.toString()}
        contentContainerStyle={{ paddingVertical: getHeight(60) }}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity 
              style={styles.childContainer}
              onPress={() => {
                navigation.navigate(screens.productList, {
                  title: `${item?.node?.title}`,
                  category: `${item?.node?.handle}`,
                })
              }}
            >
              <View style={{ marginLeft: getWidth(80) }}>
                <Text style={styles.BoxText}>
                  <Translation textKey={item?.node?.title} />
                </Text>
              </View>

              <View
                style={{
                  flex: 1,
                  alignItems: "flex-end",
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: getHeight(95),
                }}
              >
                <FastImage
                  style={{ width: 80, height: 105, borderRadius: 10 }}
                  source={{
                    uri: item?.node?.image?.originalSrc,
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </>
  );
};

export default ExploreItems;

const styles = StyleSheet.create({
  listContainer: {
    // marginTop: getHeight(20),
    marginHorizontal: getHeight(40), 

  },
  listView: {
    width: "100%",
    height: getHeight(20),
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 3,
  },
  textView1: {
    color: Colors.primary,
    fontSize: getHeight(55),
    fontWeight: "500",
  },
  title: {
    fontSize: getHeight(45),
    fontWeight: "600",
    color: Colors.black,
  },
  childContainer: {
    width: getWidth(3.5),
    minHeight: getHeight(25), 
    backgroundColor: "#F9F18F",
    marginHorizontal: getHeight(40), 
    marginRight: getHeight(80), 
    borderRadius: 10,
    paddingVertical: getHeight(95),
  },
  BoxText: {
    fontWeight: "900",
    color: Colors.black,
    fontSize: getHeight(65),
    marginHorizontal: getHeight(80),
    flexWrap: 'wrap', // Allow text to wrap if needed
  },
});