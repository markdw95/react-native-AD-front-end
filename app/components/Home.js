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
import ViewPurchOrderDetail from '../screens/ViewPurchOrderDetail';
import UpdatePurchOrder from '../screens/UpdatePurchOrder';
import CreatePurchOrder from '../screens/CreatePurchOrder';
import CreatePurchLine from '../screens/CreatePurchLine';
import ViewCustomerDetail from '../screens/ViewCustomerDetail';
import ViewVendorDetail from '../screens/ViewVendorDetail';
import ViewItemDetail from '../screens/ViewItemDetail';
import ViewWarehouseDetail from '../screens/ViewWarehouseDetail';
import ViewInventoryDetail from '../screens/ViewInventoryDetail';
import DeletePurchOrder from '../screens/DeletePurchOrder';
import DeleteSalesOrder from '../screens/DeleteSalesOrder';
import UpdateSalesOrder from '../screens/UpdateSalesOrder';
import UpdateSalesOrderLine from '../screens/UpdateSalesOrderLine';
import UpdatePurchOrderLine from '../screens/UpdatePurchOrderLine';

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
        <Stack.Screen name="DeleteSalesOrder" component={DeleteSalesOrder} />
        <Stack.Screen name="UpdateSalesOrder" component={UpdateSalesOrder} />
        <Stack.Screen name="UpdateSalesOrderLine" component={UpdateSalesOrderLine} />
        <Stack.Screen name="ViewSalesOrderDetail" component={ViewSalesOrderDetail} />
        <Stack.Screen name="ViewPurchOrder" component={ViewPurchOrder} />
        <Stack.Screen name="ViewPurchOrderDetail" component={ViewPurchOrderDetail} />
        <Stack.Screen name="CreatePurchOrder" component={CreatePurchOrder} />
        <Stack.Screen name="CreatePurchLine" component={CreatePurchLine} />
        <Stack.Screen name="UpdatePurchOrder" component={UpdatePurchOrder} />
        <Stack.Screen name="UpdatePurchOrderLine" component={UpdatePurchOrderLine} />
        <Stack.Screen name="DeletePurchOrder" component={DeletePurchOrder} />
        <Stack.Screen name="ViewCustomer" component={ViewCustomer} />
        <Stack.Screen name="ViewCustomerDetail" component={ViewCustomerDetail} />
        <Stack.Screen name="ViewVendor" component={ViewVendor} />
        <Stack.Screen name="ViewVendorDetail" component={ViewVendorDetail} />
        <Stack.Screen name="ViewItem" component={ViewItem} />
        <Stack.Screen name="ViewItemDetail" component={ViewItemDetail} />
        <Stack.Screen name="ViewInventory" component={ViewInventory} />
        <Stack.Screen name="ViewInventoryDetail" component={ViewInventoryDetail} />
        <Stack.Screen name="ViewWarehouse" component={ViewWarehouse} />
        <Stack.Screen name="ViewWarehouseDetail" component={ViewWarehouseDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Home;