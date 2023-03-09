import React from 'react';
import { View, StyleSheet, Text, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Container, Cover, Image, CSTitle, Content, Wrapper, Caption, Subtitle } from '../components/Card_Styles';

import {
  CardButton,
} from './HomeScreen_Styles';

const screenWidth = Dimensions.get('window').width;

const ARHome = () => {

  const navigation = useNavigation();

return (
  <View style={styles.screen}>
  <Text style={styles.paragraph}>Mobile order entry</Text>
  <SafeAreaView>

  <ScrollView
    vertical
    contentContainerStyle={{ paddingRight: 20, paddingBottom: 30, paddingTop: 15 }}
  >

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingRight: 20, paddingBottom: 30, paddingTop: 15 }}
  >

    <CardButton onPress={() => navigation.navigate("CreateSalesOrder")}>
    <Container screenWidth={screenWidth}>
        <Cover>
        <Image source={require('../../assets/ImageOne.jpg')} />
          <CSTitle>Create sales order</CSTitle>
        </Cover>
        <Content>
          <Wrapper>
            <Caption>Create new sales order</Caption>
            <Subtitle>Mobile sales order entry</Subtitle>
          </Wrapper>
        </Content>
      </Container>
    </CardButton>

    <CardButton onPress={() => navigation.navigate("ViewSalesOrder")}>
    <Container screenWidth={screenWidth}>
        <Cover>
        <Image source={require('../../assets/ImageTwo.jpg')} />
          <CSTitle>View sales order</CSTitle>
        </Cover>
        <Content>
          <Wrapper>
            <Caption>View existing sales order</Caption>
            <Subtitle>Find order details</Subtitle>
          </Wrapper>
        </Content>
      </Container>
    </CardButton>

  </ScrollView>

  </ScrollView>

  </SafeAreaView>

</View>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: 40,
  backgroundColor: '#ecf0f1',
},
paragraph: {
  margin: 24,
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
  color: 'white',
},
screen: {
  backgroundColor: '#070a2d'
},
});

export default ARHome
