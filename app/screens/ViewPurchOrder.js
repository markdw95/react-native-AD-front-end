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

const ViewPurchOrder = () => {

  const navigation = useNavigation();
  const { setIsLoggedIn, profile } = useLogin();

  const [purchOrder, setPurchOrder] = useState({
    PurchOrderNumber: '',
  });

  const { PurchOrderNumber } = purchOrder;

  const handleOnChangeText = (value, fieldName) => {
    setPurchOrder({ ...purchOrder, [fieldName]: value });
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
      const getPurchOrderHeader = D365ResourceURL + "/data/PurchaseOrderHeadersV2?$filter=PurchaseOrderNumber eq '" + purchOrder.PurchOrderNumber + "'";

      userAuthToken = "Bearer " + userAuthToken;

      const purchOrderHeader = await axios({
        method: "get",
        url: getPurchOrderHeader,
        headers: { "Authorization": userAuthToken },
      });

      //Parse out key fields
      const purchOrderHeaderDetails = {
        PurchaseOrderNumber: purchOrderHeader.data.value[0].PurchaseOrderNumber,
        OrderVendorAccountNumber: purchOrderHeader.data.value[0].OrderVendorAccountNumber,
        PurchaseOrderStatus: purchOrderHeader.data.value[0].PurchaseOrderStatus,
        PurchaseOrderPoolId: purchOrderHeader.data.value[0].PurchaseOrderPoolId,
        PaymentTermsName: purchOrderHeader.data.value[0].PaymentTermsName,
        PurchaseOrderName: purchOrderHeader.data.value[0].PurchaseOrderName
      }

      //Make call to D365 to get sales order line information
      const getPurchOrderLine = D365ResourceURL + "/data/PurchaseOrderLinesV2?$filter=PurchaseOrderNumber eq '" + purchOrder.PurchOrderNumber + "'";

      const purchOrderLines = await axios({
        method: "get",
        url: getPurchOrderLine,
        headers: { "Authorization": userAuthToken },
      });

      //Parse out key fields -> 1st only for now
      var lineArray = [];

      for (let line of purchOrderLines.data.value) {
        lineArray.push({
          PurchaseOrderNumber: line.PurchaseOrderNumber,
          ItemNumber: line.ItemNumber,
          LineNumber: line.LineNumber,
          OrderedPurchaseQuantity: line.OrderedPurchaseQuantity,
          PurchaseUnitSymbol: line.PurchaseUnitSymbol,
          ReceivingWarehouseId: line.ReceivingWarehouseId,
          ReceivingSiteId: line.ReceivingSiteId,
          PurchasePrice: line.PurchasePrice,
          PurchaseOrderLineStatus: line.PurchaseOrderLineStatus,
          LineDescription: line.LineDescription,
        });
      }

      const purchOrderLineDetails = {
        purchLines: lineArray
      }

      //Redirect to new screen -> send in sales order information
      navigation.navigate("ViewPurchOrderDetail", {purchOrderHeader: purchOrderHeaderDetails, purchOrderLines: purchOrderLineDetails});

     } catch (error) {
     }
};

  return (

<View style={{ flex: 1, paddingTop: 120 }}>
  
    <View style={{ height: 80 }}>
      <FormHeader
        leftHeading='View purchase order'
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
      <FormInput
        value={PurchOrderNumber}
        onChangeText={value => handleOnChangeText(value, 'PurchOrderNumber')}
        label='Purchase Order Number'
        placeholder='Purchase order number'
        autoCapitalize='none'
      />
      <FormSubmitButton onPress={submitForm} title='View Purchase Order' />

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

export default ViewPurchOrder