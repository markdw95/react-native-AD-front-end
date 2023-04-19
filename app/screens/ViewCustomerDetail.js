import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions } from 'react-native';
import { Divider  } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import FormSubmitButton from '../components/FormSubmitButton';
import FormHeader from '../components/FormHeader';
import { useLogin } from '../context/LoginProvider';

const { width } = Dimensions.get('window');

const ViewCustomerDetail = ({route}) => {

  const navigation = useNavigation();
  const { customerInfoDetails } = route.params;

  const [error, setError] = useState('');

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

  return (

<View style={{ flex: 1, paddingTop: 30 }}>
  
    <View style={{ height: 80 }}>
      <FormHeader
        leftHeading='View customer record'
        subHeading= {'Customer Number: ' + customerInfoDetails.CustomerAccount}
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
        value={customerInfoDetails.NameAlias}
        label='Name'
        placeholder='Name'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={customerInfoDetails.PrimaryContactEmail}
        label='Primary Email'
        placeholder='Primary Email'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={customerInfoDetails.PrimaryContactPhone}
        label='Phone Number'
        placeholder='Phone Number'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={customerInfoDetails.FullPrimaryAddress}
        label='Primary Address'
        placeholder='Primary Address'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={customerInfoDetails.DeliveryTerms}
        label='Delivery Terms'
        placeholder='Delivery Terms'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={customerInfoDetails.PaymentMethod}
        label='Payment Method'
        placeholder='Payment Method'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={customerInfoDetails.PaymentTerms}
        label='Payment Terms'
        placeholder='Payment Terms'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />

      <Divider width={10} color={'#f0f3f5' }/>

      <FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Back' />
      
    </FormContainer>
    
    </View>

  );
};

export default ViewCustomerDetail