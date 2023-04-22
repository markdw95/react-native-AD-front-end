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

const ViewInventoryDetail = ({route}) => {

  const navigation = useNavigation();
  const { inventoryDetail } = route.params;

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
        leftHeading='View inventory record'
        subHeading= {'Item Number: ' + inventoryDetail.ItemNumber + ' Site Number: ' + inventoryDetail.InventorySiteId}
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
        value={inventoryDetail.TotalAvailableQuantity}
        label='Total Available Quantity'
        placeholder='Total Available Quantity'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={inventoryDetail.OnHandQuantity}
        label='On Hand Quantity'
        placeholder='On Hand Quantity'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={inventoryDetail.AvailableOrderedQuantity}
        label='Available Ordered Quantity'
        placeholder='Available Ordered Quantity'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={inventoryDetail.ReservedOnHandQuantity}
        label='Reserved On Hand Quantity'
        placeholder='Reserved On Hand Quantity'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={inventoryDetail.OrderedQuantity}
        label='Ordered Quantity'
        placeholder='Ordered Quantity'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={inventoryDetail.OnOrderQuantity}
        label='On Order Quantity'
        placeholder='On Order Quantity'
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

export default ViewInventoryDetail