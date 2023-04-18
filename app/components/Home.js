import React from 'react';
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import CreateSalesOrder from "../screens/CreateSalesOrder";
import CreateSalesOrderLine from "../screens/CreateSalesOrderLine.js";
import ViewSalesOrder from "../screens/ViewSalesOrder";
import ViewSalesOrderDetail from "../screens/ViewSalesOrderDetail";
import ViewCustomer from "../screens/ViewCustomer"

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
        <Stack.Screen name="ViewCustomer" component={ViewCustomer} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Home;