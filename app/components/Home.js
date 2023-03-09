import React from 'react';
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import ARHome from "../screens/ARHome";
import CreateSalesOrder from "../screens/CreateSalesOrder";
import CreateSalesOrderLine from "../screens/CreateSalesOrderLine.js";
import ViewSalesOrder from "../screens/ViewSalesOrder";
import ViewSalesOrderDetail from "../screens/ViewSalesOrderDetail";

const Home = () => {

  const Stack = createStackNavigator();

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#070a2d' }
        }}
        initialRouteName="ARHome"
      >
        <Stack.Screen name="ARHome" component={ARHome} />
        <Stack.Screen name="CreateSalesOrder" component={CreateSalesOrder} />
        <Stack.Screen name="CreateSalesOrderLine" component={CreateSalesOrderLine} />
        <Stack.Screen name="ViewSalesOrder" component={ViewSalesOrder} />
        <Stack.Screen name="ViewSalesOrderDetail" component={ViewSalesOrderDetail} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Home;