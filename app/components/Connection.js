import React, { useRef, useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Animated,
  Dimensions,
  Text,
  TextInput,
} from 'react-native';
import client from '../api/client';
import { useLogin } from '../context/LoginProvider';
import FormContainer from './FormContainer';
import FormInput from './FormInput';
import FormSubmitButton from './FormSubmitButton';
import FormHeader from './FormHeader';

const { width } = Dimensions.get('window');

const Connection = () => {
  const { setIsLoggedIn, profile } = useLogin();
  const [connectionInfo, setConnectionInfo] = useState({
    D365ResourceURL: '',
    AuthTenant: '',
    AuthHostURL: '',
    AuthClientId: '',
    AuthClientSecret: '',
    email: profile.email
  });

  const [error, setError] = useState('');

  const { D365ResourceURL, AuthTenant, AuthHostURL, AuthClientId, AuthClientSecret, email } = connectionInfo;

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

    console.log(res);

    setConnectionInfo(res.data.formData);
  }

  const submitForm = async () => {
      try {
        setConnectionInfo({ ...connectionInfo, email: profile.user.email });

        const res = await client.post('/addConnection', connectionInfo, {
          headers: {
            Accept: 'application/json',
            authorization: `JWT ${profile.token}`,
          },
        });

        if (res.data.success) {
          setConnectionInfo({ D365ResourceURL: '', AuthTenant: '' , email: profile.user.email});
        }

        setConnectionInfo(res.data.formData);

      } catch (error) {
        console.log(error);
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
    <View style={{ flex: 1, paddingTop: 120, backgroundColor:  '#070a2d'}}>
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
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}
      <FormInput
        value={D365ResourceURL}
        onChangeText={value => handleOnChangeText(value, 'D365ResourceURL')}
        label='D365 Resource URL'
        placeholder='D365ResourceURL'
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
      <FormSubmitButton onPress={submitForm} title='Enable Connection' />
    </FormContainer>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Connection;
