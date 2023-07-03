import React from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions, AsyncStorage } from 'react-native';
import { Divider  } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import { Container, Cover, Image, CSTitle, Content, Wrapper, Caption, Subtitle } from '../components/Card_Styles';
import FormContainer from '../components/FormContainer';
import FormSubmitButton from '../components/FormSubmitButton';
import helpers from '../helpers/helper';
import { useLogin } from '../context/LoginProvider';

import {
  CardButton,
} from './HomeScreen_Styles';

const screenWidth = Dimensions.get('window').width;

const ViewSalesOrderDetail = ({route}) => {

  const navigation = useNavigation();
  const { setIsLoggedIn, profile } = useLogin();

  const { salesOrderHeader, salesOrderLines } = route.params;

  const createPendingOrder = async () => {
    if (profile.user.offlineMode)
    {
      setError("Can not publish orders in offline mode");
    }

    else
    {

      var userAuthInfo = await helpers.getAuthToken(profile);

      var createdOrders = [];
      var partiallyCreatedOrders = [];
      var failedOrders = [];

      var key = profile.user.email + "_Header_" + "Order_" + salesOrderHeader.SalesOrderNumber;

      var pendingOrder = await AsyncStorage.getItem(key);

      var currentPendingOrder = JSON.parse(pendingOrder);

      //Create order header
      const returnHeaderValue = await helpers.createSalesOrderHeader(currentPendingOrder, userAuthInfo);

      if (returnHeaderValue.status == "Created")
      {
            //Get pending order line data
            const currentPendingOrderLinesKey = profile.user.email + "_Lines_Order_" + salesOrderHeader.SalesOrderNumber;

            var currentPendingOrderLines = await AsyncStorage.getItem(currentPendingOrderLinesKey);

            currentPendingOrderLines = JSON.parse(currentPendingOrderLines);

            var linesCreated = true;

            //Create each line
            for (var currentPendingOrderLine of currentPendingOrderLines)
            {
              currentPendingOrderLine.PendingNumber = returnHeaderValue.SalesOrderNumber;

              //Create order line - Log if there is an error
              const returnLineValue = await helpers.createSalesOrderLine(currentPendingOrderLine, userAuthInfo);

              if (returnLineValue.status != "Created")
              {
                  linesCreated = false;
                  returnHeaderValue.message += " - " + returnLineValue.message;
              }
            }

            if (linesCreated)
            {
              createdOrders.push(returnHeaderValue);
            }
            else
            {
              partiallyCreatedOrders.push(returnHeaderValue);
            }

            //Remove lines from storage
            await AsyncStorage.removeItem(currentPendingOrderLinesKey);

            //Remove header from storage
            const currentPendingOrderHeaderKey = profile.user.email + "_Header_Order_" + salesOrderHeader.SalesOrderNumber;
            await AsyncStorage.removeItem(currentPendingOrderHeaderKey);
      }
      else
      {
        failedOrders.push(returnHeaderValue);
      }


      //Navigate to a 'Published page' - send in createdOrders, PartiallyCreatedOrders, and failedOrders
      navigation.navigate("PublishedOrders", {createdOrders: createdOrders, partiallyCreatedOrders: partiallyCreatedOrders, failedOrders: failedOrders});
    }
  }

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

        <Divider width={10} color={'#f0f3f5' }/>

        {salesOrderHeader.SalesOrderNumber.includes("TMP_") ? (<FormSubmitButton onPress={createPendingOrder} title='Publish Pending Order' />) : null}

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
