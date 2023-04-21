import React from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Container, Cover, Image, CSTitle, Content, Wrapper, Caption, Subtitle } from '../components/Card_Styles';
import FormContainer from '../components/FormContainer';
import FormSubmitButton from '../components/FormSubmitButton';

import {
  CardButton,
} from './HomeScreen_Styles';

const screenWidth = Dimensions.get('window').width;

const ViewPurchOrderDetail = ({route}) => {

  const navigation = useNavigation();

  const { purchOrderHeader, purchOrderLines } = route.params;

return (
  <View>

  <ScrollView
    vertical
    contentContainerStyle={{ paddingRight: 20, paddingBottom: 30, paddingTop: 15 }}
  >
    <CardButton>
        <Cover>
        <Image source={require('../../assets/ORANGE_2.jpg')} />
            <Caption style={styles.titleCaption}>Purchase Order Header Data</Caption>
                <Text style={styles.title}>Purchase order: {purchOrderHeader.PurchaseOrderNumber}</Text>
                <Text style={styles.title}>Vendor: {purchOrderHeader.OrderVendorAccountNumber}</Text>
                <Text style={styles.title}>Status: {purchOrderHeader.PurchaseOrderStatus}</Text>
                <Text style={styles.title}>Pool: {purchOrderHeader.PurchaseOrderPoolId}</Text>
                <Text style={styles.title}>Payment terms: {purchOrderHeader.PaymentTermsName}</Text>
                <Text style={styles.title}>Name: {purchOrderHeader.PurchaseOrderName}</Text>
        </Cover>
    </CardButton>

    <Caption style={styles.lineTitle}>Purchase Order Line Data</Caption>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingRight: 20, paddingBottom: 30, paddingTop: 15 }}
  >

    {
        purchOrderLines.purchLines.map((line) => {
            return (
                <CardButton key={line.LineCreationSequenceNumber}>
                <Container screenWidth={screenWidth}>
                    <Cover style={styles.container}>
                    <Image source={require('../../assets/ORANGE_2.jpg')} height="100%"/>
                    <Text style={styles.titleFirst}>Line Number: {line.LineNumber}</Text>
                        <Text style={styles.title}>Item Number: {line.ItemNumber}</Text>
                        <Text style={styles.title}>Purchase Quantity: {line.OrderedPurchaseQuantity}</Text>
                        <Text style={styles.title}>Purchase UOM: {line.PurchaseUnitSymbol}</Text>
                        <Text style={styles.title}>Recieving Warehouse: {line.ReceivingWarehouseId}</Text>
                        <Text style={styles.title}>Recieving Site: {line.ReceivingSiteId}</Text>
                        <Text style={styles.title}>Purchase Price: {line.PurchasePrice}</Text>
                        <Text style={styles.title}>Purchase Line Status: {line.PurchaseOrderLineStatus}</Text>
                        <Text style={styles.title}>Line Description: {line.LineDescription}</Text>
                    </Cover>
                    <Content>
                    <Wrapper>
                        <Caption>Purchase Order: {line.PurchaseOrderNumber}</Caption>
                        <Subtitle>Order item number: {line.LineNumber}</Subtitle>
                    </Wrapper>
                    </Content>
                    </Container>
                </CardButton>
            );
        })
    }


  </ScrollView>

    <FormContainer>
        <FormSubmitButton onPress={() => navigation.navigate("HomeScreen")} title='Back' />
    </FormContainer>

    </ScrollView>

</View>
);
};

const styles = StyleSheet.create({
    container: {
      height: 225
    },
    lineCard: {
      backgroundColor: '#34495e',
      color: 'black',
    },
    paragraph: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#34495e',
    },
    title: { color: 'black', fontSize: 16, padding: 2, marginLeft: 10 },
    titleFirst: { color: 'black', fontSize: 16, padding: 2, marginLeft: 10, marginTop: 10 },
    titleCaption: {color: 'black', fontSize: 24, padding: 8, textAlign: 'center'},
    lineTitle: {color: 'black', fontSize: 24, paddingTop: 25, textAlign: 'center'}
    });


export default ViewPurchOrderDetail
