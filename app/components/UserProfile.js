import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions, AsyncStorage } from 'react-native';
import { Divider  } from 'react-native-elements'
import { useLogin } from '../context/LoginProvider';
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import FormDeleteButton from '../components/FormDeleteButton';
import FormHeader from '../components/FormHeader';
import FormSubmitButton from '../components/FormSubmitButton';
import client from '../api/client';
import { useNavigation } from "@react-navigation/native";
import helpers from '../helpers/helper';
import referenceGetter from '../helpers/referenceGetter';

const { width } = Dimensions.get('window');

const UserProfile = () => {
  const { setIsLoggedIn, profile } = useLogin();
  const navigation = useNavigation();

  const animation = useRef(new Animated.Value(0)).current;

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState('');

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

  const updateReferenceData = async () => {

    if (profile.user.offlineMode)
    {
      setError("Can not update reference data in offline mode.");
    }
    else
    {
      setSuccess('');
      setLoading("Pulling reference data...");

      var userAuthInfo = await helpers.getAuthToken(profile);

      var customerData = await referenceGetter.getCustomerData(userAuthInfo);

      var key = profile.user.email + "_Customers";

      await AsyncStorage.setItem(key, JSON.stringify(customerData));

      var itemData = await referenceGetter.getItemData(userAuthInfo);

      var key = profile.user.email + "_Items";

      await AsyncStorage.setItem(key, JSON.stringify(itemData));

      setLoading('');
      setSuccess("Reference data updated.");
    }
  }


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

  async function removePendingOrders(keys) {

    for (var key of keys)
    {
      if (key.includes(profile.user.email + "_"))
      {
        await AsyncStorage.removeItem(key);
      }
    }

    navigation.navigate("Pending orders");
  }

  const clearPendingOrders = async () => {

      //Get keys to clear
      const keys = await AsyncStorage.getAllKeys();

      //Only get header/line information for this offline user via email
      await removePendingOrders(keys);
  }

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
            {error ? (
            <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', paddingBottom: 10 }}>
              {error}
            </Text>
          ) : null}
          {loading ? (
            <Text style={{ color: 'orange', fontSize: 18, textAlign: 'center', paddingBottom: 10 }}>
              {loading}
            </Text>
          ) : null}
            {success ? (
            <Text style={{ color: 'green', fontSize: 18, textAlign: 'center', paddingBottom: 10 }}>
              {success}
            </Text>
          ) : null}
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
          <Divider width={10} color={'#f0f3f5' }/>
          <FormDeleteButton onPress={clearPendingOrders} title='Clear Users Local Data' />
          <Divider width={10} color={'#f0f3f5' }/>
          <FormSubmitButton onPress={updateReferenceData} title='Update Reference Data' />
          
        </FormContainer>
        
    </View>
  );
};


export default UserProfile;
