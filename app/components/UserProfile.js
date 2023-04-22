import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { Divider  } from 'react-native-elements'
import { useLogin } from '../context/LoginProvider';
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import FormDeleteButton from '../components/FormDeleteButton';
import FormHeader from '../components/FormHeader';
import axios from 'axios';
import client from '../api/client';

const { width } = Dimensions.get('window');

const UserProfile = () => {
  const { setIsLoggedIn, profile } = useLogin();

  const animation = useRef(new Animated.Value(0)).current;

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

  const deleteAccount = async () => {
    try
    {
      const deleteAccountEmail = {email: profile.user.email};

      const response = await client.post('/deleteAccount', deleteAccountEmail, {
        headers: {
          Accept: 'application/json',
          authorization: `JWT ${profile.token}`,
        },
      });

      setIsLoggedIn(false);
    }
    catch (error){
      console.log(error);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: 120 }}>
      
        <View style={{ height: 80 }}>
          <FormHeader
            leftHeading='View your information'
            subHeading='Account details'
            rightHeaderOpacity={rightHeaderOpacity}
            leftHeaderTranslateX={leftHeaderTranslateX}
            rightHeaderTranslateY={rightHeaderTranslateY}
          />
        </View>
          <FormContainer>
          <FormInput
            value={profile.user.email}
            label="Email"
            placeholder='Email'
            autoCapitalize='none'
            allowEdit='false'
            backgroundColor='lightgrey'
          />
          <FormInput
            value={profile.user.fullname}
            label="Name"
            placeholder='Name'
            autoCapitalize='none'
            allowEdit='false'
            backgroundColor='lightgrey'
          />
          <Divider width={10} color={'#f0f3f5' }/>
          
          <FormDeleteButton onPress={deleteAccount} title='Delete Account' />
          
        </FormContainer>
        
    </View>
  );
};


export default UserProfile;
