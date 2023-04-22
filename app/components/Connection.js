import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import client from '../api/client';
import { Divider  } from 'react-native-elements'
import { useLogin } from '../context/LoginProvider';
import FormContainer from './FormContainer';
import FormInput from './FormInput';
import FormSubmitButton from './FormSubmitButton';
import FormHeader from './FormHeader';
import axios from 'axios';

const { width } = Dimensions.get('window');

const Connection = () => {
  const { setIsLoggedIn, profile } = useLogin();
  const [connectionInfo, setConnectionInfo] = useState({
    D365ResourceURL: '',
    AuthHostURL: '',
    AuthClientId: '',
    AuthClientSecret: '',
    email: profile.user.email
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { D365ResourceURL, AuthHostURL, AuthClientId, AuthClientSecret, email } = connectionInfo;

  const handleOnChangeText = (value, fieldName) => {
    setConnectionInfo({ ...connectionInfo, [fieldName]: value });
  };

  useEffect(() => {
    loadConnectionData()
  }, [])

  const loadConnectionData = async () => {
    const getConnectionInfo = {email: profile.user.email};

    const res = await client.post('/getConnectionInfo', getConnectionInfo, {
      headers: {
        Accept: 'application/json',
        authorization: `JWT ${profile.token}`,
      },
    });

    setConnectionInfo(res.data.formData);
  }

  const submitForm = async () => {
    try {
          var errorMessage = "";
          setError(errorMessage);

          //Validate connection information
          const D365ResourceURL   = connectionInfo.D365ResourceURL;
          const AuthHostURL       = connectionInfo.AuthHostURL;
          const AuthClientId      = connectionInfo.AuthClientId;
          const AuthClientSecret  = connectionInfo.AuthClientSecret;

          //Set up new axios client based on connection info
          var formdata = new FormData();
          formdata.append("resource", D365ResourceURL);
          formdata.append("client_id", AuthClientId);
          formdata.append("client_secret", AuthClientSecret);
          formdata.append("grant_type", "client_credentials");

          const dynamicRes = await axios({
            method: "post",
            url: AuthHostURL,
            data: formdata,
            headers: { "Content-Type": "multipart/form-data" },
          });

          var userAuthToken = dynamicRes.data.access_token;

          //Make call to D365 to get sales order header information
          const getData = D365ResourceURL + "/data/";
          
          userAuthToken = "Bearer " + userAuthToken;

          const D365Entities = await axios({
            method: "get",
            url: getData,
            headers: { "Authorization": userAuthToken, "Content-Type": "application/json" },
          });

          var successMsg = "Successfully Verified Connection";
          setSuccess(successMsg);

        //Save connection information
        setConnectionInfo({ ...connectionInfo, email: profile.user.email });

        const response = await client.post('/addConnection', connectionInfo, {
          headers: {
            Accept: 'application/json',
            authorization: `JWT ${profile.token}`,
          },
        });

        setConnectionInfo(response.data.formData);
        setConnectionInfo({ ...connectionInfo, email: profile.user.email });

      } catch (error) {
        error = "Failed Connection Verification";
        setError(error);
      }
  };

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

  return (
    <View style={{ flex: 1, paddingTop: 120}}>
    <View style={{ height: 80 }}>
      <FormHeader
        leftHeading='Connection'
        subHeading='D365 Connection Information'
        rightHeaderOpacity={rightHeaderOpacity}
        leftHeaderTranslateX={leftHeaderTranslateX}
        rightHeaderTranslateY={rightHeaderTranslateY}
      />
    </View>
      <FormContainer>
      {error ? (
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginBottom: 15 }}>
          {error}
        </Text>
      ) : null}
      {success ? (
        <Text style={{ color: 'green', fontSize: 18, textAlign: 'center', marginBottom: 15 }}>
          {success}
        </Text>
      ) : null}
      <FormInput
        value={D365ResourceURL}
        onChangeText={value => handleOnChangeText(value, 'D365ResourceURL')}
        label='D365 Resource URL'
        placeholder='D365 Resource URL'
        autoCapitalize='none'
      />
      <FormInput
        value={AuthHostURL}
        onChangeText={value => handleOnChangeText(value, 'AuthHostURL')}
        label='Auth Host URL'
        placeholder='Auth Host URL'
        autoCapitalize='none'
      />
      <FormInput
        value={AuthClientId}
        onChangeText={value => handleOnChangeText(value, 'AuthClientId')}
        label='Auth Client Id'
        placeholder='Auth Client Id'
        autoCapitalize='none'
      />
      <FormInput
        value={AuthClientSecret}
        onChangeText={value => handleOnChangeText(value, 'AuthClientSecret')}
        label='Auth Client Secret'
        placeholder='Auth Client Secret'
        autoCapitalize='none'
      />
      <Divider width={10} color={'#f0f3f5' }/>
      <FormSubmitButton onPress={submitForm} title='Save Connection' />
    </FormContainer>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Connection;
