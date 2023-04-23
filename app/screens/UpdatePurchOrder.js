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
import { getIn } from 'formik';

const { width } = Dimensions.get('window');

const UpdatePurchOrder = () => {

  const navigation = useNavigation();
  const { setIsLoggedIn, profile } = useLogin();

  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState({
    PurchaseOrderNumber: '',
  });

  const { PurchaseOrderNumber } = purchaseOrderNumber;

  const handleOnChangeOrderNumber = (value, fieldName) => {
    setPurchaseOrderNumber({ ...purchaseOrderNumber, [fieldName]: value });
  };

  const [lineNumber, setLineNumber] = useState({
    LineNumber: '',
  });

  const { LineNumber } = lineNumber;

  const handleOnChangeLineNumber = (value, fieldName) => {
    setLineNumber({ ...lineNumber, [fieldName]: value });
  };

  const [legalEntity, setLegalEntity] = useState({
    LegalEntity: '',
  });

  const { LegalEntity } = legalEntity;

  const handleOnChangeLegalEntity = (value, fieldName) => {
    setLegalEntity({ ...legalEntity, [fieldName]: value });
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
      const getLine = D365ResourceURL + "/data/PurchaseOrderLinesV2?$filter=PurchaseOrderNumber eq '" + purchaseOrderNumber.PurchaseOrderNumber + "' and LineNumber eq " + lineNumber.LineNumber;

      userAuthToken = "Bearer " + userAuthToken;

      var statusError;
      var errorMessage;

      const line = await axios({
        method: "get", 
        url: getLine,
        headers: { "Authorization": userAuthToken },
      }).catch( error => {
        statusError = true;

        errorMessage = JSON.stringify(error);

        if (errorMessage.includes("400"))
        {
          errorMessage = "Status code: 400" + "\n" + "Confirm data is valid." + "\n";
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

    if (line.data.value[0] == undefined)
    {
      statusError = true;
      errorMessage = "An error occured." + "\n" + "No purchase order line found." + "\n";
    }
    
    if (statusError)
    {
      setError(errorMessage);
      throw(errorMessage);
    }

      //Parse out key fields
      const lineDetails = {
        PurchaseOrderNumber: line.data.value[0].PurchaseOrderNumber,
        ItemNumber: line.data.value[0].ItemNumber,
        LineNumber: line.data.value[0].LineNumber,
        OrderedPurchaseQuantity: line.data.value[0].OrderedPurchaseQuantity.toString(),
        LegalEntity: legalEntity.LegalEntity
      }

      //Redirect to new screen -> send in sales order information
      navigation.navigate("UpdatePurchOrderLine", {lineDetails: lineDetails});

     } catch (error) {
      console.log(error);
     }
};

  return (

<View style={{ flex: 1, paddingTop: 120 }}>
  
    <View style={{ height: 80 }}>
      <FormHeader
        leftHeading='Update purchase order'
        subHeading='Enter purchase order line information'
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
        value={PurchaseOrderNumber}
        onChangeText={value => handleOnChangeOrderNumber(value, 'PurchaseOrderNumber')}
        label='Purchase Order Number'
        placeholder='Purchase order number'
        autoCapitalize='none'
      />
      <FormInput
        value={LineNumber}
        onChangeText={value => handleOnChangeLineNumber(value, 'LineNumber')}
        label='Line Number'
        placeholder='Line number'
        autoCapitalize='none'
      />
        <FormInput
        value={LegalEntity}
        onChangeText={value => handleOnChangeLegalEntity(value, 'LegalEntity')}
        label='Legal Entity'
        placeholder='Legal entity'
        autoCapitalize='none'
      />
      <FormSubmitButton onPress={submitForm} title='Update order line' />

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

export default UpdatePurchOrder