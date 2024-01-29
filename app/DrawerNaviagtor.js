import React from 'react';
import { View, Text, TouchableOpacity, Image, AsyncStorage } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import COLORS from '../app/config/COLORS'
import SPACING from "../app/config/SPACING";
import Home from './components/Home';
import Connection from './components/Connection';
import PendingOrders from './components/PendingOrders';
import PublishedOrders from './components/PublishedOrders';
import { useLogin } from './context/LoginProvider';
import UserProfile from './components/UserProfile';

const Drawer = createDrawerNavigator();

const CustomDrawer = props => {
  const { setIsLoggedIn, profile } = useLogin();

  const logOutUser = async () => {
    await AsyncStorage.removeItem('jwtToken');
    setIsLoggedIn(false);
  }

  return (
    <View style={{ flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            backgroundColor: COLORS.light,
            marginBottom: 20,
          }}
        >
          <View>
            <Text>{profile.user.fullname}</Text>
            <Text>{profile.user.email}</Text>
          </View>
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 0,
          left: 0,
          bottom: 50,
          backgroundColor: COLORS.light,
          padding: 20,
        }}
        onPress={() => logOutUser()}
      >
        <Text>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const DrawerNavigator = () => {
  const { setIsLoggedIn, profile } = useLogin();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f0f3f5',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitle: '',
        headerTintColor: COLORS.primary,
        headerRight: () => (
          <View style={{right: 85}}>
          
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: SPACING * 3,
                  fontWeight: "bold",
                  color: COLORS.dark,
                }}
              >
                AcquireDynamics
              </Text>
              <Image
                style={{
                  height: SPACING * 5,
                  width: SPACING * 5,
                  borderRadius: SPACING * 5,
                  left: 25
                }}
                source={require("../assets/images/clear-tabIcon.png")}
              />
            </View>
            </View>
        ),
      }}
      drawerContent={props => <CustomDrawer {...props} />}
    >
      <Drawer.Screen component={Home} name='Home' />
      {profile.user.offlineMode ? null : (<Drawer.Screen component={Connection} name='Connection'/>)}
      {profile.user.offlineMode ? null : (<Drawer.Screen component={UserProfile} name='User Information'/>)}
      <Drawer.Screen component={PublishedOrders} name='Published orders'/>
      <Drawer.Screen component={PendingOrders} name='Pending orders' />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
