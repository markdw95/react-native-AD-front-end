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

const CreateSalesOrderLine = ({route}) => {

  const navigation = useNavigation();

  const { salesOrderData } = route.params;

  const { setIsLoggedIn, profile } = useLogin();

  const [salesItemData, setSalesItemData] = useState({
    CustomerNumber: salesOrderData.CustAccount,
    ItemNumber: '',
    SalesQty: '',
    SalesOrderNumber: salesOrderData.SalesOrderNumber,
    LineNumber: salesOrderData.LineNumber
  });

  const { CustomerNumber, ItemNumber, SalesQty } = salesItemData;

  const handleOnChangeText = (value, fieldName) => {
    setSalesItemData({ ...salesItemData, [fieldName]: value });
  };

  useEffect(() => {
    updatePageData()
  }, [])

  const updatePageData = async () => {
    setSalesItemData({ ...salesItemData, [ItemNumber]: '' });
    setSalesItemData({ ...salesItemData, [SalesQty]: '' });
    setSalesItemData({ ...salesItemData, [LineNumber]: salesOrderData.LineNumber + 1 });
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
    //   //Make call to getUserConnectionInfo (send in email)
    //   const getConnectionInfo = {email: profile.user.email};

    //   const res = await client.post('/getConnectionInfo', getConnectionInfo, {
    //     headers: {
    //       Accept: 'application/json',
    //       authorization: `JWT ${profile.token}`,
    //     },
    //   });

    //   const D365ResourceURL   = res.data.formData.D365ResourceURL;
    //   const AuthHostURL       = res.data.formData.AuthHostURL;
    //   const AuthClientId      = res.data.formData.AuthClientId;
    //   const AuthClientSecret  = res.data.formData.AuthClientSecret;
    //   const AuthToken         = res.data.formData.AuthToken;
    //   const AuthTokenExp      = res.data.formData.AuthTokenExp;

    //   const currentTimeSeconds = new Date().getTime() / 1000;

    //   var userAuthToken;

    //   //Check auth token, if expired get new token and update token in data base (updateUserConnectionToken)
    //   if (AuthTokenExp == '' || AuthTokenExp < currentTimeSeconds)
    //   {
    //       //Set up new axios client based on connection info
    //        var formdata = new FormData();
    //        formdata.append("resource", D365ResourceURL);
    //        formdata.append("client_id", AuthClientId);
    //        formdata.append("client_secret", AuthClientSecret);
    //        formdata.append("grant_type", "client_credentials")

    //        const dynamicRes = await axios({
    //          method: "post",
    //          url: AuthHostURL,
    //          data: formdata,
    //          headers: { "Content-Type": "multipart/form-data" },
    //        })

    //        userAuthToken = dynamicRes.data.access_token;

    //        var updatedTokenExp = +currentTimeSeconds + +dynamicRes.data.expires_in;

    //        const updateUserConnectionToken = {email: profile.user.email, AuthTokenExp: updatedTokenExp, AuthToken: userAuthToken};

    //        const updatedTokenRes = await client.post('/updateUserConnectionToken', updateUserConnectionToken, {
    //         headers: {
    //           Accept: 'application/json',
    //           authorization: `JWT ${profile.token}`,
    //         },
    //       });

    //   }
    //   else
    //   {
    //     userAuthToken = AuthToken;
    //   }

    //   //Make call to D365 to get sales order header information
    //   const postSalesOrderLine = D365ResourceURL + "/data/SalesOrderLines";

    //   const postSalesOrderLineBody = {
    //     "SalesOrderNumber": salesItemData.SalesOrderNumber,
    //     "ItemNumber": salesItemData.ItemNumber,
    //     "OrderedSalesQuantity":parseInt(salesItemData.SalesQty)
    // };

    //   userAuthToken = "Bearer " + userAuthToken;

    //   const salesOrderLine = await axios({
    //     method: "post",
    //     url: postSalesOrderLine,
    //     data: postSalesOrderLineBody,
    //     headers: { "Authorization": userAuthToken, "Content-Type": "application/json" },
    //   });

    //Update the line number for the next line
    var updateLineNum = salesItemData.LineNumber + 1;

    //This will clear the data for the next line to be inserted
    setSalesItemData({ 
        CustomerNumber: salesOrderData.CustAccount,
        ItemNumber: '',
        SalesQty: '',
        SalesOrderNumber: salesOrderData.SalesOrderNumber,
        LineNumber: updateLineNum
    });

    //TO:DO:: Update thie logic to check the response status code, if it is 201 show build successMsg, else show error code/message
    //Replicate this logic to CreateSalesOrder as well
    var exampleError = false;

    if (exampleError)
    {
        setError("Failed");
    }
    else
    {
        var successMsg = "Successfully created line number " + salesItemData.LineNumber;
        setSuccess(successMsg);
    }

    } catch (error) {
    }
};

  return (

<View style={{ flex: 1, paddingTop: 120 }}>
  
    <View style={{ height: 80, marginBottom: 20 }}>
      <FormHeader
        leftHeading='Create sales line'
        subHeading={'Sales order: ' + salesOrderData.SalesOrderNumber 
               + '\n Customer Account: ' + salesOrderData.CustAccount }
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
        value={SalesQty}
        onChangeText={value => handleOnChangeText(value, 'SalesQty')}
        label='Sales Quantity'
      />
      <FormSubmitButton onPress={submitForm} title={'Save line'} />

      <Divider width={10} color={'white' }/>

      <FormSubmitButton onPress={() => navigation.navigate("ARHome")} title='Finish order' />
      
    </FormContainer>
    
    </View>

  );
};

export default CreateSalesOrderLine