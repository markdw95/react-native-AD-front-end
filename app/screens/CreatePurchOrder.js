import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { Card, ListItem, Button, Icon, Divider  } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import FormSubmitButton from '../components/FormSubmitButton';
import FormHeader from '../components/FormHeader';
import { useLogin } from '../context/LoginProvider';
import client from '../api/client';
import axios from 'axios';

const { width } = Dimensions.get('window');

const CreatePurchOrder = () => {

  const navigation = useNavigation();
  const { setIsLoggedIn, profile } = useLogin();

  const [vendorNumber, setVendorNumber] = useState({
    VendorNumber: '',
  });

  const { VendorNumber } = vendorNumber;

  const handleOnChangeText = (value, fieldName) => {
    setVendorNumber({ ...vendorNumber, [fieldName]: value });
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
      const postPurchOrderHeader = D365ResourceURL + "/data/PurchaseOrderHeadersV2";

      const postPurchOrderHeaderBody = {
        "OrderVendorAccountNumber": vendorNumber.VendorNumber
    }
    
      userAuthToken = "Bearer " + userAuthToken;

      var statusError;
      var errorMessage;

      const purchOrderHeader = await axios({
        method: "post",
        url: postPurchOrderHeader,
        data: postPurchOrderHeaderBody,
        headers: { "Authorization": userAuthToken, "Content-Type": "application/json" },
      }).catch( error => {
          statusError = true;

          errorMessage = JSON.stringify(error);

          if (errorMessage.includes("400"))
          {
            errorMessage = "Status code: 400" + "\n" + "Confirm vendor is valid." + "\n";
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
        setError(errorMessage);
        throw error(errorMessage);
      }

      //Parse out key fields
      const purchOrderData = {
        OrderVendorAccountNumber: purchOrderHeader.data.OrderVendorAccountNumber,
        PurchaseOrderNumber: purchOrderHeader.data.PurchaseOrderNumber,
        LineNumber: 1 
      }

      //Redirect to new screen -> send in sales order information
      navigation.navigate("CreatePurchLine", {purchOrderData: purchOrderData});

    } catch (error) {
      error = "Failed order creation";
    }
};

  return (

<View style={{ flex: 1, paddingTop: 120 }}>
  
    <View style={{ height: 80 }}>
      <FormHeader
        leftHeading='Create purchase order'
        subHeading='Enter vendor number'
        rightHeaderOpacity={rightHeaderOpacity}
        leftHeaderTranslateX={leftHeaderTranslateX}
        rightHeaderTranslateY={rightHeaderTranslateY}
      />
    </View>
      <FormContainer>
      {error ? (
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginBottom: 10}}>
          {error}
        </Text>
      ) : null}
      <FormInput
        value={VendorNumber}
        onChangeText={value => handleOnChangeText(value, 'VendorNumber')}
        label='Vendor Number'
        placeholder='Vendor number'
        autoCapitalize='none'
      />
      <FormSubmitButton onPress={submitForm} title='Create purchase order' />

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
    color: '#34495e',
  },
  });

export default CreatePurchOrder