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

const ViewWarehouseDetail = ({route}) => {

  const navigation = useNavigation();
  const { warehouseInfoDetails } = route.params;

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
        leftHeading='View warehouse record'
        subHeading= {'Warehouse Number: ' + warehouseInfoDetails.WarehouseId}
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
        value={warehouseInfoDetails.WarehouseName}
        label='Warehouse Name'
        placeholder='Warehouse Name'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={warehouseInfoDetails.OperationalSiteId}
        label='Site Number'
        placeholder='Sute Number'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={warehouseInfoDetails.WarehouseType}
        label='Warehouse Type'
        placeholder='Warehouse Type'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={warehouseInfoDetails.FormattedPrimaryAddress}
        label='Primary Address'
        placeholder='Primary Address'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={warehouseInfoDetails.QuarantineWarehouseId}
        label='Quarantine Warehouse Number'
        placeholder='Unit Cost'
        autoCapitalize='none'
        allowEdit='false'
        backgroundColor='lightgrey'
      />
      <FormInput
        value={warehouseInfoDetails.TransitWarehouseId}
        label='Transit Warehouse Number'
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

export default ViewWarehouseDetail