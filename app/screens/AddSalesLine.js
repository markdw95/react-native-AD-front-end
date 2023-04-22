import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { Divider  } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import FormSubmitButton from '../components/FormSubmitButton';
import FormHeader from '../components/FormHeader';
import { useLogin } from '../context/LoginProvider';
import client from '../api/client';
import axios from 'axios';

const { width } = Dimensions.get('window');

const AddSalesLine = () => {

  const navigation = useNavigation();
  const { setIsLoggedIn, profile } = useLogin();

  const [salesOrder, setSalesOrder] = useState({
    SalesOrderNumber: '',
  });

  const { SalesOrderNumber } = salesOrder;

  const handleOnChangeText = (value, fieldName) => {
    setSalesOrder({ ...salesOrder, [fieldName]: value });
  };

  const [error, setError] = useState('');

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

    try {
      //Make call to getUserConnectionInfo (send in email)
      const getConnectionInfo = {email: profile.user.email};

      const res = await client.post('/getConnectionInfo', getConnectionInfo, {
        headers: {
          Accept: 'application/json',
          authorization: `JWT ${profile.token}`,
        },
      });
      
      const D365ResourceURL   = res.data.formData.D365ResourceURL;
      const AuthHostURL       = res.data.formData.AuthHostURL;
      const AuthClientId      = res.data.formData.AuthClientId;
      const AuthClientSecret  = res.data.formData.AuthClientSecret;
      const AuthToken         = res.data.formData.AuthToken;
      const AuthTokenExp      = res.data.formData.AuthTokenExp;

      //No connection found
      if (D365ResourceURL == '' || AuthHostURL == '' || AuthClientId == '' || AuthClientSecret == '')
      {
          var noConnectionFound = "No connection found.\n Please enter a valid connection and try again."
          setError(noConnectionFound);
          throw error(noConnectionFound);
      }

      const currentTimeSeconds = new Date().getTime() / 1000;

      var userAuthToken;

      //Check auth token, if expired get new token and update token in data base (updateUserConnectionToken)
      if (AuthTokenExp == '' || AuthTokenExp < currentTimeSeconds)
      {
          //Set up new axios client based on connection info
           var formdata = new FormData();
           formdata.append("resource", D365ResourceURL);
           formdata.append("client_id", AuthClientId);
           formdata.append("client_secret", AuthClientSecret);
           formdata.append("grant_type", "client_credentials")

           const dynamicRes = await axios({
             method: "post",
             url: AuthHostURL,
             data: formdata,
             headers: { "Content-Type": "multipart/form-data" },
           })

           userAuthToken = dynamicRes.data.access_token;

           var updatedTokenExp = +currentTimeSeconds + +dynamicRes.data.expires_in;

           const updateUserConnectionToken = {email: profile.user.email, AuthTokenExp: updatedTokenExp, AuthToken: userAuthToken};

           const updatedTokenRes = await client.post('/updateUserConnectionToken', updateUserConnectionToken, {
            headers: {
              Accept: 'application/json',
              authorization: `JWT ${profile.token}`,
            },
          });

      }
      else
      {
        userAuthToken = AuthToken;
      }

      //Make call to D365 to get sales order header information
      const getSalesOrderHeader = D365ResourceURL + "/data/SalesOrderHeadersV2?$filter=SalesOrderNumber eq '" + salesOrder.SalesOrderNumber + "'";

      userAuthToken = "Bearer " + userAuthToken;

      const salesOrderHeader = await axios({
        method: "get",
        url: getSalesOrderHeader,
        headers: { "Authorization": userAuthToken },
      });

      //Parse out key fields
      const salesOrderHeaderDetails = {
        SalesOrderNumber: salesOrderHeader.data.value[0].SalesOrderNumber,
        OrderingCustomerAccountNumber: salesOrderHeader.data.value[0].OrderingCustomerAccountNumber
      }

      //Make call to D365 to get sales order line information
      const getSalesOrderLine = D365ResourceURL + "/data/SalesOrderLines?$filter=SalesOrderNumber eq '" + salesOrder.SalesOrderNumber + "'";

      const salesOrdeLines = await axios({
        method: "get",
        url: getSalesOrderLine,
        headers: { "Authorization": userAuthToken },
      });

      //Parse out key fields -> 1st only for now
      var newLineNumber = 0;

      for (let line of salesOrdeLines.data.value) {
        newLineNumber = Math.max(newLineNumber, line.LineNumber);
      }

      newLineNumber++;

      //Parse out key fields
      const salesOrderData = {
        CustAccount: salesOrderHeaderDetails.OrderingCustomerAccountNumber,
        SalesOrderNumber: salesOrderHeaderDetails.SalesOrderNumber,
        LineNumber: newLineNumber
      }

      //Redirect to new screen -> send in sales order information
      navigation.navigate("CreateSalesOrderLine", {salesOrderData: salesOrderData});
      
     } catch (error) {
      console.log(error);
     }
};

  return (

<View style={{ flex: 1, paddingTop: 120 }}>
  
    <View style={{ height: 80 }}>
      <FormHeader
        leftHeading='View sales order'
        subHeading='Enter sales order number'
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
      <FormInput
        value={SalesOrderNumber}
        onChangeText={value => handleOnChangeText(value, 'SalesOrderNumber')}
        label='Sales Order Number'
        placeholder='Sales order number'
        autoCapitalize='none'
      />
      <FormSubmitButton onPress={submitForm} title='View sales order' />

      <Divider width={10} color={'#f0f3f5' }/>

      <FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Back' />
      
    </FormContainer>
    
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
  },
  });

export default AddSalesLine