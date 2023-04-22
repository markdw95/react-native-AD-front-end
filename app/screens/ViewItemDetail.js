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

const ViewItemDetail = ({route}) => {

  const navigation = useNavigation();
  const { itemInfoDetails } = route.params;

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
        leftHeading='View item record'
        subHeading= {'Item Number: ' + itemInfoDetails.ItemNumber}
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
        value={itemInfoDetails.SearchName}
        label='Item Name'
        placeholder='Item Name'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={itemInfoDetails.PrimaryVendorAccountNumber}
        label='Primary Vendor'
        placeholder='Primary Vendor'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={itemInfoDetails.ProductGroupId}
        label='Product Group Id'
        placeholder='Product Group Id'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={itemInfoDetails.ItemModelGroupId}
        label='Item Model Group Id'
        placeholder='Item Model Group Id'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={itemInfoDetails.UnitCost}
        label='Unit Cost'
        placeholder='Unit Cost'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={itemInfoDetails.InventoryUnitSymbol}
        label='Inventory Unit Symbol'
        placeholder='Inventory Unit Symbol'
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

export default ViewItemDetail