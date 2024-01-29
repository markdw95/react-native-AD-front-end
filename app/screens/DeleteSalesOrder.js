import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { Divider  } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import FormSubmitButton from '../components/FormSubmitButton';
import FormHeader from '../components/FormHeader';
import { useLogin } from '../context/LoginProvider';
import client from '../api/client';
import axios from 'axios';
import PendingOrders from '../components/PendingOrders';
import helpers from '../helpers/helper';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get('window');

const DeleteSalesOrder = () => {

  const navigation = useNavigation();
  const { setIsLoggedIn, profile } = useLogin();

  const [salesOrderNumber, setSalesOrderNumber] = useState({
    SalesOrderNumber: '',
  });

  const { SalesOrderNumber } = salesOrderNumber;

  const handleOnChangeItem = (value, fieldName) => {
    setSalesOrderNumber({ ...salesOrderNumber, [fieldName]: value });
  };

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState('');

  const animation = useRef(new Animated.Value(0)).current;
  const scrollView = useRef(); 

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

  const submitForm = async () => {

    if (profile.user.offlineMode || salesOrderNumber.SalesOrderNumber.includes("TMP_"))
    {
      //Remove order from local storage
      var keyLine = profile.user.email + "_Lines_" + "Order_" + salesOrderNumber.SalesOrderNumber;

      await AsyncStorage.removeItem(keyLine);

      var keyHeader = profile.user.email + "_Header_" + "Order_" + salesOrderNumber.SalesOrderNumber;

      await AsyncStorage.removeItem(keyHeader);

      var successMsg = "Successfully deleted sales order.";
      setSuccess(successMsg);

      PendingOrders.loadOrders();

      return;
    }

    try {

      setLoading("Deleting sales order...");

      var userAuthInfo = await helpers.getAuthToken(profile);

      var dataAreaId = await helpers.getDataAreaId(salesOrderNumber.SalesOrderNumber, userAuthInfo);

      //Make call to D365 to get sales order header information
      const deleteSalesOrder = userAuthInfo.D365ResourceURL + "/data/SalesOrderHeadersV2(SalesOrderNumber= '" + salesOrderNumber.SalesOrderNumber + "', dataAreaId='" + dataAreaId + "')"

      var userAuthToken = "Bearer " + userAuthInfo.userAuthToken;

      var statusError = false;

      const salesOrder = await axios({
        method: "delete", 
        url: deleteSalesOrder,
        headers: { "Authorization": userAuthToken },
      }).catch( error => {
        statusError = true;

        errorMessage = JSON.stringify(error);

        if (errorMessage.includes("400"))
        {
          errorMessage = "Status code: 400" + "\n" + "Confirm order number and legal entity are valid." + "\n";
        }
        else if (errorMessage.includes("500"))
        {
          errorMessage = "Status code: 500" + "\n" + "Confirm connection & data is valid." + "\n";
        }
        else
        {
          errorMessage = "An error occured." + "\n" + "Confirm connection is valid." + "\n";
        }

      }
    );

    if (statusError)
    {
      setSuccess("");
      setError(errorMessage);
    }
    else
    {
      setError("");
      var successMsg = "Successfully deleted sales order.";
      setSuccess(successMsg);
    }

     } catch (error) {
      console.log(error);
      var errorMessage = "Unable to delete sales order.";
      setError(errorMessage);
      setLoading("");
     }

     setLoading("");
};

  return (

<View style={{ flex: 1, paddingTop: 120 }}>
  
    <View style={{ height: 80 }}>
      <FormHeader
        leftHeading='Delete Sales Order'
        subHeading='Enter order number'
        rightHeaderOpacity={rightHeaderOpacity}
        leftHeaderTranslateX={leftHeaderTranslateX}
        rightHeaderTranslateY={rightHeaderTranslateY}
      />
    </View>
      <FormContainer>
      {error ? (
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
          {error}
        </Text>
      ) : null}
      {success ? (
        <Text style={{ color: 'green', fontSize: 18, textAlign: 'center', marginBottom: 15 }}>
          {success}
        </Text>
      ) : null}
      {loading ? (
        <Text style={{ color: 'orange', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
          {loading}
        </Text>
      ) : null}
      <FormInput
        value={SalesOrderNumber}
        onChangeText={value => handleOnChangeItem(value, 'SalesOrderNumber')}
        label='Sales Order Number'
        placeholder='Sales Order number'
        autoCapitalize='none'
      />
      <FormSubmitButton onPress={submitForm} title='Delete sales order' />

      <Divider width={10} color={'#f0f3f5' }/>

      <FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Back' />
      
    </FormContainer>
    
    </View>

  );
};

export default DeleteSalesOrder