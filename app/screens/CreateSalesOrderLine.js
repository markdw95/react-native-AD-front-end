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
import AsyncStorage from "@react-native-async-storage/async-storage";

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

    //Offline mode
    if (profile.user.offlineMode || salesItemData.SalesOrderNumber.includes("TMP_"))
    {
      var key = profile.user.email + "_Lines_" + "Order_" + salesItemData.SalesOrderNumber;

      const postSalesOrderLineBody = {
        "SalesOrderNumber": salesItemData.SalesOrderNumber,
        "ItemNumber": salesItemData.ItemNumber,
        "OrderedSalesQuantity":parseInt(salesItemData.SalesQty)
      };

      var salesOrderLines = [];

      const prevSalesOrderLines = await AsyncStorage.getItem(key);

      if (prevSalesOrderLines)
      {
        salesOrderLines = JSON.parse(prevSalesOrderLines);
      }
      else
      {
        await AsyncStorage.setItem(key, JSON.stringify([]));
      }

      salesOrderLines.push(postSalesOrderLineBody);

      await AsyncStorage.setItem(key, JSON.stringify(salesOrderLines));

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


      var successMsg = "Successfully created sales line";
      setSuccess(successMsg);

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
      const postSalesOrderLine = D365ResourceURL + "/data/SalesOrderLines";

      const postSalesOrderLineBody = {
        "SalesOrderNumber": salesItemData.SalesOrderNumber,
        "ItemNumber": salesItemData.ItemNumber,
        "OrderedSalesQuantity":parseInt(salesItemData.SalesQty)
    };

      userAuthToken = "Bearer " + userAuthToken;

      var statusError = false;
      var errorMessage = "";

      setError(errorMessage);

      const salesOrderLine = await axios({
        method: "post",
        url: postSalesOrderLine,
        data: postSalesOrderLineBody,
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
    var updateLineNum = salesItemData.LineNumber + 1;

    //This will clear the data for the next line to be inserted
    setSalesItemData({ 
        CustomerNumber: salesOrderData.CustAccount,
        ItemNumber: '',
        SalesQty: '',
        SalesOrderNumber: salesOrderData.SalesOrderNumber,
        LineNumber: updateLineNum
    });


    var successMsg = "Successfully created sales line";
    setSuccess(successMsg);

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

      <Divider width={10} color={'#f0f3f5' }/>

      <FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Finish order' />
      
    </FormContainer>
    
    </View>

  );
};

export default CreateSalesOrderLine