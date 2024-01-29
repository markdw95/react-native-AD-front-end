import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  Text,
  FlatList,
  ScrollView,
  SafeAreaView
} from 'react-native';
import client from '../api/client';
import { Divider  } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import { useLogin } from '../context/LoginProvider';
import FormContainer from './FormContainer';
import FormInput from './FormInput';
import FormSubmitButton from './FormSubmitButton';
import FormHeader from './FormHeader';
import axios from 'axios';
import COLORS from "../config/COLORS";
import SPACING from "../config/SPACING";
import helpers from '../helpers/helper';
import { string } from 'yup';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

const PendingOrders = () => {
  const navigation = useNavigation();
  const { setIsLoggedIn, profile } = useLogin();

  const [orders, setOrders] = useState([])
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  useEffect(() => {
    loadOrders()
  })

  const animation = useRef(new Animated.Value(0)).current;

  const rightHeaderOpacity = animation.interpolate({
    inputRange: [0, width],
    outputRange: [1, 0],
  });

  const leftHeaderTranslateX = animation.interpolate({
    inputRange: [0, width],
    outputRange: [0, 40],
  });
  const rightHeaderTranslateY = animation.interpolate({
    inputRange: [0, width],
    outputRange: [0, -20],
  });

  const loadOrders = async () => {

    //Find all keys
    const keys = await AsyncStorage.getAllKeys();

    //Only get header information for this offline user via email
    const allPendingOrders = await getPendingOrders(keys);

    //Set orders to show on list
    setOrders(allPendingOrders);
  }

  async function getPendingOrders(keys) {
    var allPendingOrders = [];

    for (var key of keys)
    {
      if (key.includes(profile.user.email + "_Header"))
      {
        var pendingOrder = await AsyncStorage.getItem(key);

        allPendingOrders.push(JSON.parse(pendingOrder));

      }
    }

    return allPendingOrders;
  }

  const PublishAll = async () => {
    if (profile.user.offlineMode)
    {
      setError("Can not publish orders in offline mode");
    }
    else
    {
      setLoading("Publishing orders to D365...");

      var userAuthInfo = await helpers.getAuthToken(profile);

      var createdOrders = [];
      var partiallyCreatedOrders = [];
      var failedOrders = [];

      //Loop over all of the pending orders
      for (var currentPendingOrder of orders)
      {
        //Create order header
        const returnHeaderValue = await helpers.createSalesOrderHeader(currentPendingOrder, userAuthInfo);

        if (returnHeaderValue.status == "Created")
        {
             //Get pending order line data
              const currentPendingOrderLinesKey = profile.user.email + "_Lines_Order_" + currentPendingOrder.PendingNumber;

              var currentPendingOrderLines = await AsyncStorage.getItem(currentPendingOrderLinesKey);

              currentPendingOrderLines = JSON.parse(currentPendingOrderLines);

              var linesCreated = true;

              //Create each line
              for (var currentPendingOrderLine of currentPendingOrderLines)
              {
                currentPendingOrderLine.PendingNumber = returnHeaderValue.SalesOrderNumber;

                //Create order line - Log if there is an error
                const returnLineValue = await helpers.createSalesOrderLine(currentPendingOrderLine, userAuthInfo);

                if (returnLineValue.status != "Created")
                {
                    linesCreated = false;
                    returnHeaderValue.message += " - " + returnLineValue.message;
                }
              }

              if (linesCreated)
              {
                createdOrders.push(returnHeaderValue);
              }
              else
              {
                partiallyCreatedOrders.push(returnHeaderValue);
              }

              //Remove lines from storage
              await AsyncStorage.removeItem(currentPendingOrderLinesKey);

              //Remove header from storage
              const currentPendingOrderHeaderKey = profile.user.email + "_Header_Order_" + currentPendingOrder.PendingNumber;
              await AsyncStorage.removeItem(currentPendingOrderHeaderKey);
        }
        else
        {
          failedOrders.push(returnHeaderValue);
        }

      }

      //Reset offline order number
      if (!partiallyCreatedOrders && !failedOrders)
      {
          var pendingOrderKey = profile.user.email + "_PendingOrderNumber";
      
          await AsyncStorage.removeItem(pendingOrderKey);
      }

      //Navigate to a 'Published page' - send in createdOrders, PartiallyCreatedOrders, and failedOrders
      navigation.navigate("Published orders", {createdOrders: createdOrders, partiallyCreatedOrders: partiallyCreatedOrders, failedOrders: failedOrders});
    }
  }
  
  return (
    <View style={{ flex: 1, paddingTop: 10, marginBottom: 50 }}>

          <ScrollView>
          <FormHeader
            leftHeading='Pending Orders'
            rightHeaderOpacity={rightHeaderOpacity}
            leftHeaderTranslateX={leftHeaderTranslateX}
            rightHeaderTranslateY={rightHeaderTranslateY}
          />
          <View>
            {orders.length != 0 ? orders.map((item) => {
              return (
            <View style={styles.row}>
                <Text style={styles.rowText}>Customer: {item ? item.Customer : ""}</Text>
                <Text style={styles.rowText}>Order: {item ? item.PendingNumber : ""}</Text>
              </View>
              );
            }) : null}
          </View>

        </ScrollView>
        
        <FormContainer>
        {error ? (
          <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
            {error}
          </Text>
        ) : null}
        {loading ? (
          <Text style={{ color: 'orange', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
            {loading}
          </Text>
        ) : null}
        <FormSubmitButton onPress={PublishAll} title='Publish All' />
        </FormContainer>

      </View>
  );
};

// Screen styles
const styles = StyleSheet.create({
  screen: {
    marginTop: 30,
  },
  row: {
    margin: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  rowText: {
    fontSize: 18,
  },
});

export default PendingOrders;
