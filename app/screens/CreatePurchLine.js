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

const CreatePurchLine = ({route}) => {

  const navigation = useNavigation();

  const { purchOrderData } = route.params;

  const { setIsLoggedIn, profile } = useLogin();

  const [purchItemData, setPurchItemData] = useState({
    OrderVendorAccountNumber: purchOrderData.OrderVendorAccountNumber,
    ItemNumber: '',
    OrderedPurchaseQuantity: '',
    PurchaseOrderNumber: purchOrderData.PurchaseOrderNumber,
    LineNumber: purchOrderData.LineNumber
  });

  const { OrderVendorAccountNumber, ItemNumber, OrderedPurchaseQuantity } = purchItemData;

  const handleOnChangeText = (value, fieldName) => {
    setPurchItemData({ ...purchItemData, [fieldName]: value });
  };

  useEffect(() => {
    updatePageData()
  }, [])

  const updatePageData = async () => {
    setPurchItemData({ ...purchOrderData, [ItemNumber]: '' });
    setPurchItemData({ ...purchOrderData, [OrderedPurchaseQuantity]: '' });
    setPurchItemData({ ...purchOrderData, [LineNumber]: purchOrderData.LineNumber + 1 });
  }

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

      //Post purchase order line
      const postPurchOrderLine = D365ResourceURL + "/data/PurchaseOrderLinesV2";

      const postPurchOrderLineBody = {
        "PurchaseOrderNumber": purchItemData.PurchaseOrderNumber,
        "ItemNumber": purchItemData.ItemNumber,
        "OrderedPurchaseQuantity":parseInt(purchItemData.OrderedPurchaseQuantity),
        "LineNumber": parseInt(purchItemData.LineNumber)
    };

      userAuthToken = "Bearer " + userAuthToken;

      var statusError = false;
      var errorMessage = "";

      setError(errorMessage);

      console.log(postPurchOrderLine);
      console.log(userAuthToken);
      console.log(postPurchOrderLineBody);

      const purchOrderLine = await axios({
        method: "post",
        url: postPurchOrderLine,
        data: postPurchOrderLineBody,
        headers: { "Authorization": userAuthToken, "Content-Type": "application/json" },
      }).catch( error => {
        statusError = true;

        if (errorMessage.includes("400"))
        {
          errorMessage = "Status code: 400" + "\n" + "Confirm item is valid." + "\n";
        }
        else if (errorMessage.includes("500"))
        {
          errorMessage = "Status code: 500" + "\n" + "Confirm connection is valid." + "\n";
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
    };

    //Update the line number for the next line
    var updateLineNum = purchItemData.LineNumber + 1;

    //This will clear the data for the next line to be inserted
    setPurchItemData({ 
        OrderVendorAccountNumber: purchItemData.OrderVendorAccountNumber,
        ItemNumber: '',
        OrderedPurchaseQuantity: '',
        PurchaseOrderNumber: purchItemData.PurchaseOrderNumber,
        LineNumber: updateLineNum
    });


    var successMsg = "Successfully created line number " + purchItemData.LineNumber;
    setSuccess(successMsg);

    } catch (error) {
    }
};

  return (

<View style={{ flex: 1, paddingTop: 120 }}>
  
    <View style={{ height: 80, marginBottom: 20 }}>
      <FormHeader
        leftHeading='Create purchase order line'
        subHeading={'Purchase order: ' + purchItemData.PurchaseOrderNumber 
               + '\n Vendor Account: ' + purchItemData.OrderVendorAccountNumber }
        rightHeaderOpacity={rightHeaderOpacity}
        leftHeaderTranslateX={leftHeaderTranslateX}
        rightHeaderTranslateY={rightHeaderTranslateY}
      />
    </View>
    
      <FormContainer>
      {error ? (
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', paddingBottom: 10 }}>
          {error}
        </Text>
      ) : null}
        {success ? (
        <Text style={{ color: 'green', fontSize: 18, textAlign: 'center', paddingBottom: 10 }}>
          {success}
        </Text>
      ) : null}
     <FormInput
        value={ItemNumber}
        onChangeText={value => handleOnChangeText(value, 'ItemNumber')}
        label='Item Number'
      />
     <FormInput
        value={OrderedPurchaseQuantity}
        onChangeText={value => handleOnChangeText(value, 'OrderedPurchaseQuantity')}
        label='Purchase Quantity'
      />
      <FormSubmitButton onPress={submitForm} title={'Save line'} />

      <Divider width={10} color={'#f0f3f5' }/>

      <FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Finish order' />
      
    </FormContainer>
    
    </View>

  );
};

export default CreatePurchLine