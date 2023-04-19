import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import COLORS from '../app/config/COLORS'
import SPACING from "../app/config/SPACING";
import Home from './components/Home';
import Connection from './components/Connection';
import { useLogin } from './context/LoginProvider';

const Drawer = createDrawerNavigator();

const CustomDrawer = props => {
  const { setIsLoggedIn, profile } = useLogin();
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
        onPress={() => setIsLoggedIn(false)}
      >
        <Text>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const DrawerNavigator = () => {
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
          <View style={{right: 30}}>
          
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
      drawerContentOptions= {{
         activeTintColor :COLORS.primary,
         inactiveTintColor :COLORS.dark,
      }}
    >
      <Drawer.Screen component={Home} name='Home' />
      <Drawer.Screen component={Connection} name='Connection'/>
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
