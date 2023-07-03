import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import React, { useState } from "react";
import CATEGORIES from "../config/CATEGORIES";
import COLORS from "../config/COLORS";
import SPACING from "../config/SPACING";
import { useNavigation } from "@react-navigation/native";
import { useLogin } from '../context/LoginProvider';

const WIDTH = Dimensions.get("screen").width;

const HomeScreen = () => {

  const [activeCategory, setActiveCategory] = useState(0);
  const navigation = useNavigation();

  const { setIsLoggedIn, profile } = useLogin();

  return (
    <SafeAreaView>
      <View style={{ padding: SPACING * 2 }}>
        <ScrollView style={{ marginVertical: SPACING * 2 }} horizontal>
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(index)}
              style={{ marginRight: SPACING }}
              key={category.id}
            >

            {((profile.user.offlineMode && category.offline) || !profile.user.offlineMode) ? (
            <Text
                style={[
                  { fontSize: SPACING * 2, color: COLORS.dark },
                  activeCategory === index && { color: COLORS.primary },
                ]}
              >
                {category.title}
              </Text>) : null}

            </TouchableOpacity>
          ))}
        </ScrollView>
        <Text style={{ fontSize: SPACING * 1.7, color: COLORS.dark }}>
          {CATEGORIES[activeCategory].title + " Actions"}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={WIDTH * 0.7}
          decelerationRate="fast"
          pagingEnabled
          style={{ marginVertical: SPACING * 2 }}
        >
          {CATEGORIES[activeCategory].operations.map((operations, index) => (
            <TouchableOpacity
              style={{
                width: WIDTH * 0.7,
                height: WIDTH * 0.9,
                overflow: "hidden",
                borderRadius: SPACING * 2,
                marginRight: SPACING * 2,
              }}
              key={index}
              onPress={() => navigation.navigate(operations.path)}
            >
              <View
                style={{
                  position: "absolute",
                  zIndex: 1,
                  height: "100%",
                  width: "100%",
                  backgroundColor: COLORS.transparent,
                  justifyContent: "space-between",
                  padding: SPACING,
                }}
              >
                <TouchableOpacity
                  style={{
                    alignSelf: "flex-end",
                    padding: SPACING / 2,
                    borderRadius: SPACING * 5,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: SPACING * 2,
                    color: COLORS.white,
                    fontWeight: "700",
                    marginLeft: SPACING,
                  }}
                >
                  {operations.title}
                </Text>
              </View>
              <Image
                source={operations.image}
                style={{ width: "100%", height: "100%" }}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >

        {profile.user.offlineMode ? null : (
            <Text
              style={{
                fontSize: SPACING * 2,
                fontWeight: "bold",
                color: COLORS.dark,
              }}
            >
              Need more information?
            </Text>
          )}

        </View>

        {profile.user.offlineMode ? null : (
          <ScrollView
            horizontal
            pagingEnabled
            style={{ marginVertical: SPACING * 2, width: WIDTH }}
            showsHorizontalScrollIndicator={false}
          >
            {CATEGORIES[activeCategory].info.map((info) => (
              <TouchableOpacity
                key={info.id}
                style={{
                  marginRight: SPACING * 3,
                  padding: SPACING,
                  alignItems: "center",
                }}
                onPress={() => navigation.navigate(info.path)}
              >
                <View style={{ width: SPACING * 3, height: SPACING * 3 }}>
                  <Image
                    source={info.image}
                    resizeMode="contain"
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
                <Text
                  style={{
                    textTransform: "uppercase",
                    fontSize: SPACING,
                    marginTop: SPACING,
                  }}
                >
                  {info.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          )}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({});
