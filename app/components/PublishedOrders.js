import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  Text,
  FlatList,
  ScrollView,
  SafeAreaView,
  AsyncStorage
} from 'react-native';
import client from '../api/client';
import { Divider  } from 'react-native-elements'
import { useLogin } from '../context/LoginProvider';
import FormContainer from './FormContainer';
import FormInput from './FormInput';
import FormSubmitButton from './FormSubmitButton';
import { useNavigation } from "@react-navigation/native";
import FormHeader from './FormHeader';
import axios from 'axios';
import COLORS from "../config/COLORS";
import SPACING from "../config/SPACING";
import helpers from '../helpers/helper';
import { Form } from 'formik';

const { width } = Dimensions.get('window');

const PublishedOrders = ({route}) => {
  const { setIsLoggedIn, profile } = useLogin();
  const navigation = useNavigation();

  var [createdOrders, setCreatedOrders] = useState([]);
  var [partiallyCreatedOrders, setPartiallyCreatedOrders] = useState([]);
  var [failedOrders, setFailedOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {

    if (route.params != undefined)
    {
      setCreatedOrders(route.params.createdOrders);
      setPartiallyCreatedOrders(route.params.partiallyCreatedOrders);
      setFailedOrders(route.params.failedOrders);
    }

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

  return (
    <View style={{ flex: 1, paddingTop: 10, marginBottom: 50 }}>

          <ScrollView>
          <FormHeader
            leftHeading='Published Orders'
            rightHeaderOpacity={rightHeaderOpacity}
            leftHeaderTranslateX={leftHeaderTranslateX}
            rightHeaderTranslateY={rightHeaderTranslateY}
          />
          <View>
            <Text style={styles.groupHeaderText}>Created orders</Text>
            {createdOrders.map((item) => {
              return (
              <View style={styles.row} key={item}>
                <Text style={styles.rowText}>Order {item.SalesOrderNumber}: {item.message}</Text>
              </View>
              );
            })}
          </View>

          <View>
          <Text style={styles.groupHeaderText}>Partially created orders</Text>
            {partiallyCreatedOrders.map((item) => {
              return (
              <View style={styles.row} key={item}>
                <Text style={styles.rowText}>Order {item.SalesOrderNumber}: {item.message}</Text>
              </View>
              );
            })}
          </View>

          <View>
          <Text style={styles.groupHeaderText}>Failed orders</Text>
            {failedOrders.map((item) => {
              return (
              <View style={styles.row} key={item}>
                <Text style={styles.rowText}>Order {item.SalesOrderNumber}: {item.message}</Text>
              </View>
              );
            })}
          </View>

        </ScrollView>
        
        <FormContainer>
          {createdOrders.length + partiallyCreatedOrders.length + failedOrders.length != 1 ? null : (<FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Back' />)}
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
  groupHeaderText: {
    fontSize: 24,
    marginTop: 10,
    marginLeft: 10,
  },
});

export default PublishedOrders;
