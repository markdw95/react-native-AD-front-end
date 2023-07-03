import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, Dimensions, AsyncStorage } from 'react-native';
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

  const [legalEntity, setLegalEntity] = useState({
    LegalEntity: '',
  });

  const { LegalEntity } = legalEntity;

  const handleOnChangeSite = (value, fieldName) => {
    setLegalEntity({ ...legalEntity, [fieldName]: value });
  };

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const deleteSalesOrder = D365ResourceURL + "/data/SalesOrderHeadersV2(SalesOrderNumber= '" + salesOrderNumber.SalesOrderNumber + "', dataAreaId='" + legalEntity.LegalEntity + "')"

      userAuthToken = "Bearer " + userAuthToken;

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
     }
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
      <FormInput
        value={SalesOrderNumber}
        onChangeText={value => handleOnChangeItem(value, 'SalesOrderNumber')}
        label='Sales Order Number'
        placeholder='Sales Order number'
        autoCapitalize='none'
      />
      {profile.user.offlineMode ? null : (
      <FormInput
        value={LegalEntity}
        onChangeText={value => handleOnChangeSite(value, 'LegalEntity')}
        label='Legal Entity'
        placeholder='Legal Entity'
        autoCapitalize='none'
      />)}
      <FormSubmitButton onPress={submitForm} title='Delete sales order' />

      <Divider width={10} color={'#f0f3f5' }/>

      <FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Back' />
      
    </FormContainer>
    
    </View>

  );
};

export default DeleteSalesOrder