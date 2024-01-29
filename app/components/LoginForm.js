import React, { useState, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import client from '../api/client';
import { useLogin } from '../context/LoginProvider';
import { Divider  } from 'react-native-elements'
import { isValidEmail, isValidObjField, updateError } from '../utils/methods';
import FormContainer from './FormContainer';
import FormInput from './FormInput';
import FormSubmitButton from './FormSubmitButton';
import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginForm = () => {
  const { setIsLoggedIn, setProfile } = useLogin();
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const { email, password } = userInfo;

  const handleOnChangeText = (value, fieldName) => {
    setUserInfo({ ...userInfo, [fieldName]: value });
  };


  useEffect(() => {
    loadJWTfromAsyncStorage()
  }, [])

  const loadJWTfromAsyncStorage = async () => {

      //Find JWT from Async Storage
      try {
        const jwtValue = await AsyncStorage.getItem('jwtToken');

        if (jwtValue !== null) {
          //Try to sign in with token
          try {
            const res = await client.post('/sign-in-with-token', { ...userInfo }, {
              headers: {
                Accept: 'application/json',
                authorization: `JWT ${jwtValue}`,
              },
            });

            if (res.data.success) 
            {
              //Set updated jwtToken in Async Storage
              await storeData(res.data.token);

              setUserInfo({ email: '', password: '' });
              setProfile(res.data);
              setIsLoggedIn(true);
            }
    
          } catch (error) 
          {
            //Remove JWT token from storage
            await AsyncStorage.removeItem('jwtToken');

            console.log(error);
          }

        }
      } catch(e) {
        // error reading value
        //console.log("Error on load");
      }

  }

  const isValidForm = () => {
    if (!isValidObjField(userInfo))
      return updateError('Required all fields!', setError);

    if (!isValidEmail(email)) return updateError('Invalid email!', setError);

    if (!password.trim() || password.length < 8)
      return updateError('Password is too short!', setError);

    return true;
  };

  const storeData = async (value) => {
    try {
      await AsyncStorage.setItem('jwtToken', value)
    } catch (e) {
      //console.log("Failed save");
    }
  }

  const continueOffline = async () => {

    if (!userInfo.email)
    {
      return updateError('Email address required for offline mode.', setError);
    }

    var profileData = {
      "user": {"avatar": "", "email": userInfo.email, "fullname": "Offline Mode", offlineMode: true}
    }

    setProfile(profileData);
    setIsLoggedIn(true);
  }

  const submitForm = async () => {
    if (isValidForm()) {
      try {
        //console.log(userInfo);

        const res = await client.post('/sign-in', { ...userInfo });

        //console.log(res.data);

        if (res.data.success) 
        {
          //Set updated jwtToken in Async Storage
          await storeData(res.data.token);

          //console.log(res.data);

          setUserInfo({ email: '', password: '' });
          setProfile(res.data);
          setIsLoggedIn(true);
        }

      } catch (error) 
      {
        updateError('Failed login', setError);

        console.log(error);
      }
    }
  };

  return (
    <FormContainer>
      {error ? (
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginBottom: 10  }}>
          {error}
        </Text>
      ) : null}
      <FormInput
        value={email}
        onChangeText={value => handleOnChangeText(value, 'email')}
        label='Email'
        placeholder='example@email.com'
        autoCapitalize='none'
      />
      <FormInput
        value={password}
        onChangeText={value => handleOnChangeText(value, 'password')}
        label='Password'
        placeholder='********'
        autoCapitalize='none'
        secureTextEntry
      />
      <FormSubmitButton onPress={submitForm} title='Login' />
      <Divider width={10} color={'#f0f3f5' }/>
      <FormSubmitButton onPress={continueOffline} title='Continue Offline' />
    </FormContainer>
  );
};

const styles = StyleSheet.create({});

export default LoginForm;
