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

const ViewSalesOrderDetail = ({route}) => {

  const navigation = useNavigation();

  const { salesOrderHeader, salesOrderLines } = route.params;

return (
  <View>

  <ScrollView
    vertical
    contentContainerStyle={{ paddingRight: 20, paddingBottom: 30, paddingTop: 15 }}
  >
    <CardButton>
        <Cover>
        <Image source={require('../../assets/ORANGE_2.jpg')} />
            <Caption style={styles.titleCaption}>Sales Order Header Data</Caption>
                <Text style={styles.title}>Sales order: {salesOrderHeader.SalesOrderNumber}</Text>
                <Text style={styles.title}>Customer: {salesOrderHeader.OrderingCustomerAccountNumber}</Text>
                <Text style={styles.title}>Status: {salesOrderHeader.SalesOrderStatus}</Text>
                <Text style={styles.title}>Pool: {salesOrderHeader.SalesOrderPoolId}</Text>
                <Text style={styles.title}>Payment terms: {salesOrderHeader.PaymentTermsName}</Text>
                <Text style={styles.title}>Name: {salesOrderHeader.SalesOrderName}</Text>
        </Cover>
    </CardButton>

    <Caption style={styles.lineTitle}>Sales Order Line Data</Caption>

  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingRight: 20, paddingBottom: 30, paddingTop: 15 }}
  >

    {
        salesOrderLines.salesLines.map((line) => {
            return (
                <CardButton key={line.LineCreationSequenceNumber}>
                <Container screenWidth={screenWidth}>
                    <Cover style={styles.container}>
                    <Image source={require('../../assets/ORANGE_2.jpg')} />
                    <Text style={styles.titleFirst}>Line Creation Number: {line.LineCreationSequenceNumber}</Text>
                        <Text style={styles.title}>Item Number: {line.ItemNumber}</Text>
                        <Text style={styles.title}>Sales Quantity: {line.OrderedSalesQuantity}</Text>
                        <Text style={styles.title}>Sales UOM: {line.SalesUnitSymbol}</Text>
                        <Text style={styles.title}>Shipping Warehouse: {line.ShippingWarehouseId}</Text>
                        <Text style={styles.title}>Shipping Site: {line.ShippingSiteId}</Text>
                        <Text style={styles.title}>Sales Line Status: {line.SalesOrderLineStatus}</Text>
                        <Text style={styles.title}>Line Description: {line.LineDescription}</Text>
                    </Cover>
                    <Content>
                    <Wrapper>
                        <Caption>Sales Order: {line.SalesOrderNumber}</Caption>
                        <Subtitle>Order item number: {line.LineCreationSequenceNumber}</Subtitle>
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


export default ViewSalesOrderDetail
