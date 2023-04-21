import React from 'react';
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import CreateSalesOrder from "../screens/CreateSalesOrder";
import CreateSalesOrderLine from "../screens/CreateSalesOrderLine.js";
import ViewSalesOrder from "../screens/ViewSalesOrder";
import ViewSalesOrderDetail from "../screens/ViewSalesOrderDetail";
import ViewCustomer from "../screens/ViewCustomer"
import ViewVendor from "../screens/ViewVendor"
import ViewItem from "../screens/ViewItem"
import ViewInventory from "../screens/ViewInventory"
import ViewWarehouse from "../screens/ViewWarehouse"
import ViewPurchOrder from '../screens/ViewPurchOrder';
import CreatePurchOrder from '../screens/CreatePurchOrder';
import ViewCustomerDetail from '../screens/ViewCustomerDetail';
import ViewVendorDetail from '../screens/ViewVendorDetail';

const Home = () => {

  const Stack = createStackNavigator();

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
        initialRouteName="HomeScreen"
      >
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="CreateSalesOrder" component={CreateSalesOrder} />
        <Stack.Screen name="CreateSalesOrderLine" component={CreateSalesOrderLine} />
        <Stack.Screen name="ViewSalesOrder" component={ViewSalesOrder} />
        <Stack.Screen name="ViewSalesOrderDetail" component={ViewSalesOrderDetail} />
        <Stack.Screen name="ViewPurchOrder" component={ViewPurchOrder} />
        <Stack.Screen name="CreatePurchOrder" component={CreatePurchOrder} />
        <Stack.Screen name="ViewCustomer" component={ViewCustomer} />
        <Stack.Screen name="ViewCustomerDetail" component={ViewCustomerDetail} />
        <Stack.Screen name="ViewVendor" component={ViewVendor} />
        <Stack.Screen name="ViewVendorDetail" component={ViewVendorDetail} />
        <Stack.Screen name="ViewItem" component={ViewItem} />
        <Stack.Screen name="ViewInventory" component={ViewInventory} />
        <Stack.Screen name="ViewWarehouse" component={ViewWarehouse} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Home;