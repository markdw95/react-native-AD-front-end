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
                <CardButton>
                <Container screenWidth={screenWidth}>
                    <Cover>
                    <Image source={require('../../assets/ORANGE_2.jpg')} />
                    <Text style={styles.title}>Line creation number: {line.LineCreationSequenceNumber}</Text>
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
        <FormSubmitButton onPress={() => navigation.navigate("ARHome")} title='Back' />
    </FormContainer>

    </ScrollView>

</View>
);
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'left',
      justifyContent: 'center',
      backgroundColor: '#34495e',
      color: 'white',
      paddingLeft: 10,
      paddingTop: 10,
      paddingBottom: 10,
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
    title: { color: 'white', fontSize: 16, padding: 2, marginLeft: 10 },
    titleCaption: {color: 'white', fontSize: 24, padding: 8, textAlign: 'center'},
    lineTitle: {color: 'white', fontSize: 24, paddingTop: 25, textAlign: 'center'}
    });


export default ViewSalesOrderDetail
