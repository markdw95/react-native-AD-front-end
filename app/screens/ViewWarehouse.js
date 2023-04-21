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

const ViewWarehouse = () => {

  const navigation = useNavigation();
  const { setIsLoggedIn, profile } = useLogin();

  const [warehouseNumber, setWarehouseNumber] = useState({
    WarehouseNumber: '',
  });

  const { WarehouseNumber } = warehouseNumber;

  const handleOnChangeText = (value, fieldName) => {
    setWarehouseNumber({ ...warehouseNumber, [fieldName]: value });
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
      const getWarehouseInfo = D365ResourceURL + "/data/Warehouses?$filter=WarehouseId eq '" + warehouseNumber.WarehouseNumber + "'";

      userAuthToken = "Bearer " + userAuthToken;

      const warehouseInfo = await axios({
        method: "get",
        url: getWarehouseInfo,
        headers: { "Authorization": userAuthToken },
      });

      //Parse out key fields
      const warehouseInfoDetails = {
        WarehouseId: warehouseInfo.data.value[0].WarehouseId,
        WarehouseName: warehouseInfo.data.value[0].WarehouseName,
        OperationalSiteId: warehouseInfo.data.value[0].OperationalSiteId,
        WarehouseType: warehouseInfo.data.value[0].WarehouseType,
        FormattedPrimaryAddress: warehouseInfo.data.value[0].FormattedPrimaryAddress,
        QuarantineWarehouseId: warehouseInfo.data.value[0].QuarantineWarehouseId,
        TransitWarehouseId: warehouseInfo.data.value[0].TransitWarehouseId
      }

      //Redirect to new screen -> send in sales order information
      navigation.navigate("ViewWarehouseDetail", {warehouseInfoDetails: warehouseInfoDetails});

     } catch (error) {
     }
};

  return (
<View>

<View style={{ flex: 1, paddingTop: 120 }}>
  
    <View style={{ height: 80 }}>
      <FormHeader
        leftHeading='View warehouse record'
        subHeading='Enter warehouse number'
        rightHeaderOpacity={rightHeaderOpacity}
        leftHeaderTranslateX={leftHeaderTranslateX}
        rightHeaderTranslateY={rightHeaderTranslateY}
      />
    </View>
      <FormContainer>
      {error ? (
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}
      <FormInput
        value={WarehouseNumber}
        onChangeText={value => handleOnChangeText(value, 'WarehouseNumber')}
        label='Warehouse Number'
        placeholder='Warehouse number'
        autoCapitalize='none'
      />
      <FormSubmitButton onPress={submitForm} title='View warehouse' />

      <Divider width={10} color={'#f0f3f5' }/>

      <FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Back' />
      
    </FormContainer>
    
    </View>

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

export default ViewWarehouse