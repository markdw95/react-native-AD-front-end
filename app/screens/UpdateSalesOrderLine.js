import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions, AsyncStorage } from 'react-native';
import { Divider  } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import FormSubmitButton from '../components/FormSubmitButton';
import FormDeleteButton from '../components/FormDeleteButton';
import FormHeader from '../components/FormHeader';
import { useLogin } from '../context/LoginProvider';
import client from '../api/client';
import axios from 'axios';
import helpers from '../helpers/helper';

const { width } = Dimensions.get('window');

const UpdateSalesOrderLine = ({route}) => {

  const navigation = useNavigation();
  const { lineDetails } = route.params;

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState('');

  const { setIsLoggedIn, profile } = useLogin();

  const [orderedSalesQuantity, setOrderedSalesQuantity] = useState({
    OrderedSalesQuantity: '',
  });

  const { OrderedSalesQuantity } = orderedSalesQuantity;

  const handleOnChange = (value, fieldName) => {
    setOrderedSalesQuantity({ ...orderedSalesQuantity, [fieldName]: value });
  };

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

  const deleteLine = async () => {

    if (profile.user.offlineMode || lineDetails.SalesOrderNumber.includes("TMP_"))
    {
      //Find record and remove it from array
      var key = profile.user.email + "_Lines_" + "Order_" + lineDetails.SalesOrderNumber;

      const lines = await AsyncStorage.getItem(key);

      var salesLines = JSON.parse(lines);

      if (lineDetails.LineNumber > -1) { // only splice array when item is found
        salesLines.splice(lineDetails.LineNumber, 1); // 2nd parameter means remove one item only
      }

      await AsyncStorage.setItem(key, JSON.stringify(salesLines));

      var successMsg = "Successfully deleted sales order line.\n Click Back to return to the home screen.";
      setSuccess(successMsg);

      return;
    }

    try {
      setSuccess("");
      setError("");
      setLoading("Deleting sales line...");

      var userAuthInfo = await helpers.getAuthToken(profile);

      //Make call to D365 to get sales order header information
      const updateSalesOrderLine = userAuthInfo.D365ResourceURL + "/data/SalesOrderLines(InventoryLotId='" + lineDetails.InventoryLotId + "',dataAreaId='" + lineDetails.LegalEntity + "')";

      var userAuthToken = "Bearer " + userAuthInfo.userAuthToken;

      var statusError = false;

      const salesOrderLine = await axios({
        method: "delete", 
        url: updateSalesOrderLine,
        headers: { "Authorization": userAuthToken },
      }).catch( error => {
        statusError = true;

        errorMessage = JSON.stringify(error);

        if (errorMessage.includes("400"))
        {
          errorMessage = "Status code: 400" + "\n" + "Unable to delete sales line." + "\n";
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
      var successMsg = "Successfully deleted sales order line.\n Click Back to return to the home screen.";
      setSuccess(successMsg);
    }

     } catch (error) {
      console.log(error);
      var errorMessage = "Unable to delete sales order line.";
      setError(errorMessage);
      setLoading("");
     }

     setLoading("");
};

  const submitForm = async () => {

    if (profile.user.offlineMode || lineDetails.SalesOrderNumber.includes("TMP_"))
    {
      //Find record and update array
      var key = profile.user.email + "_Lines_" + "Order_" + lineDetails.SalesOrderNumber;

      const lines = await AsyncStorage.getItem(key);

      var salesLines = JSON.parse(lines);

      salesLines[lineDetails.LineNumber].OrderedSalesQuantity = orderedSalesQuantity.OrderedSalesQuantity;

      await AsyncStorage.setItem(key, JSON.stringify(salesLines));

      var successMsg = "Successfully updated sales order line.\n Click Back to return to the home screen.";
      setSuccess(successMsg);

      return;
    }

    try {
      setSuccess("");
      setError("");
      setLoading("Updating sales line...");

      var userAuthInfo = await helpers.getAuthToken(profile);
     
      //Make call to D365 to get sales order header information
      const updateSalesOrderLine = userAuthInfo.D365ResourceURL + "/data/SalesOrderLines(InventoryLotId='" + lineDetails.InventoryLotId + "',dataAreaId='" + lineDetails.LegalEntity + "')";

      const patchSalesOrderLineBody = {
        "OrderedSalesQuantity": parseInt(orderedSalesQuantity.OrderedSalesQuantity)
    }

      var userAuthToken = "Bearer " + userAuthInfo.userAuthToken;

      var statusError = false;

      const salesOrderLine = await axios({
        method: "patch", 
        url: updateSalesOrderLine,
        data: patchSalesOrderLineBody,
        headers: { "Authorization": userAuthToken },
      }).catch( error => {
        statusError = true;

        errorMessage = JSON.stringify(error);

        if (errorMessage.includes("400"))
        {
          errorMessage = "Status code: 400" + "\n" + "Unable to update sales line." + "\n";
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
      var successMsg = "Successfully updated sales order line.";
      setSuccess(successMsg);
    }

     } catch (error) {
      console.log(error);
      var errorMessage = "Unable to update sales order line.";
      setError(errorMessage);
      setLoading("");
     }

     setLoading("");
};

  return (

<View style={{ flex: 1, paddingTop: 120 }}>
  
    <View style={{ height: 80 }}>
      <FormHeader
        leftHeading='Update sales order line'
        subHeading= {'Order Number: ' + lineDetails.SalesOrderNumber}
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
        value={lineDetails.ItemNumber}
        label='Item Number'
        placeholder='Item number'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={OrderedSalesQuantity}
        onChangeText={value => handleOnChange(value, 'OrderedSalesQuantity')}
        label='Ordered Quantity'
        placeholder='Ordered quantity'
        autoCapitalize='none'
      />

      <Divider width={10} color={'#f0f3f5' }/>

      <FormSubmitButton onPress={submitForm} title='Update order line' />

      <Divider width={10} color={'#f0f3f5' }/>

      <FormDeleteButton onPress={deleteLine} title='Delete order line' />

    <Divider width={10} color={'#f0f3f5' }/>

      <FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Back' />
      
    </FormContainer>
    
    </View>

  );
};

export default UpdateSalesOrderLine