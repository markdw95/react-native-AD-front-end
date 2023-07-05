import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Animated, Dimensions, AsyncStorage, ScrollView } from 'react-native';
import { Card, ListItem, Button, Icon, Divider  } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import FormContainer from '../components/FormContainer';
import FormRowInput from '../components/FormRowInput';
import FormSubmitButton from '../components/FormSubmitButton';
import FormHeader from '../components/FormHeader';
import { useLogin } from '../context/LoginProvider';
import client from '../api/client';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import FormSubmitRowButton from '../components/FormSubmitRowButton';
import helpers from '../helpers/helper';

const { width } = Dimensions.get('window');

const CreateSalesOrderEntryLines = ({route}) => {

  const navigation = useNavigation();

  const { salesOrderData } = route.params;

  const { setIsLoggedIn, profile } = useLogin();

  const [salesLines, setSalesLines] = useState([]);

  useEffect(() => {
    initLineData();
  })

  useEffect(() => {
    loadReferenceData();
  }, [])

  const loadReferenceData = async () => {

    var key = profile.user.email + "_Items";

    const localItemData = await AsyncStorage.getItem(key);

    var itemData = [];

    if (localItemData){
      itemData = JSON.parse(localItemData);
    }

    setReferenceData(itemData);
  }

  const initLineData = async () => {

    if (salesLines.length === 0)
    {
      const startingLine = [{
        "ItemNumber": '',
        "OrderedSalesQuantity": '',
        "SalesOrderNumber": salesOrderData.SalesOrderNumber,
        "LineNumber": 1
      }]
  
      setSalesLines(startingLine);
    }
  }


  const handleOnChangeItem = (value, LineNumber) => {

    salesLines[LineNumber - 1].ItemNumber = value;

    const newSalesLines = [...salesLines];

    setSalesLines(newSalesLines);
  };

  const handleOnChangeQty = (value, LineNumber) => {

    salesLines[LineNumber - 1].OrderedSalesQuantity = value;

    const newSalesLines = [...salesLines];

    setSalesLines(newSalesLines);
  };

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState('');
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [referenceData, setReferenceData] = useState([]);

  const animation = useRef(new Animated.Value(0)).current;
  const scrollView = useRef(); 

  const rightHeaderOpacity = animation.interpolate({
    inputRange: [0, width],
    outputRange: [1, 0],
  });

  const leftHeaderTranslateX = animation.interpolate({
    inputRange: [0, width],
    outputRange: [0, 40],
  });
  const rightHeaderTranslateY = animation.interpolate({
    inputRange: [0, width],
    outputRange: [0, -20],
  });

  const replaceLastOrder = async () => {
    console.log("Replace last order");

    if (profile.user.offline)
    {
      setError("Can not replace an order in offline mode");
    }
    else
    {
      setLoading('Pulling lines from latest order...');

       //remove from D365
       var userAuthInfo = await helpers.getAuthToken(profile);

       const localSalesLines = await helpers.replaceLastOrder(salesOrderData, userAuthInfo);

       setSalesLines(localSalesLines);

       setLoading('');
    }
  }

  const addNewLine = async () => {
    salesLines.push({
      "ItemNumber": '',
      "OrderedSalesQuantity": '',
      "SalesOrderNumber": salesOrderData.SalesOrderNumber,
      "LineNumber": salesLines.length + 1
    });

    const newSalesLines = [...salesLines];

    setSalesLines(newSalesLines);
  }

  const deleteOrder = async () => {
    if (salesOrderData.SalesOrderNumber.includes("TMP_"))
    {
      //Remove pending order
      var key = profile.user.email + "_Header_Order_" + salesOrderData.SalesOrderNumber;

      await AsyncStorage.removeItem(key);

      navigation.navigate("HomeScreen");
    }
    else
    {
      setLoading('Deleting order in D365...');

      //remove from D365
      var userAuthInfo = await helpers.getAuthToken(profile);

      await helpers.deleteSalesOrderHeader(salesOrderData.SalesOrderNumber, salesOrderData.dataAreaId, userAuthInfo);

      setLoading('');

      navigation.navigate("HomeScreen");
    }
  }

  const saveAndClose = async () => {
      console.log("Save and close");

      if (profile.user.offlineMode || salesOrderData.SalesOrderNumber.includes("TMP_"))
      {
        var key = profile.user.email + "_Lines_" + "Order_" + salesOrderData.SalesOrderNumber;

        await AsyncStorage.setItem(key, JSON.stringify(salesLines));

        navigation.navigate("HomeScreen");
      }
      else
      {
        setLoading("Publishing order to D365...");

        var userAuthInfo = await helpers.getAuthToken(profile);

        var createdOrders = [];
        var partiallyCreatedOrders = [];
        var failedOrders = [];
        var linesCreated = true;

        var returnHeaderValue = {
          status: "Created",
          SalesOrderNumber: salesOrderData.SalesOrderNumber,
          CustomerAccount: salesOrderData.CustAccount,
          message: "Successfully created order."
      }
        
        //Create each line
        for (var currentPendingOrderLine of salesLines)
        {
          currentPendingOrderLine.PendingNumber = salesOrderData.SalesOrderNumber;

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

        //Navigate to a 'Published page' - send in createdOrders, PartiallyCreatedOrders, and failedOrders
        navigation.navigate("PublishedOrders", {createdOrders: createdOrders, partiallyCreatedOrders: partiallyCreatedOrders, failedOrders: failedOrders});
      }

  }

  const deleteLine = async (value, LineNumber) => {
    var localSalesLines = [];
    LineNumber--;

    for (let i=0; i<salesLines.length; i++)
    {
      if (i == LineNumber)
      {
        continue;
      }

      if (i > LineNumber)
      {
        salesLines[i].LineNumber--;
      }

      localSalesLines.push(salesLines[i]);
    }

    setSalesLines(localSalesLines);
  }

  return (

    <View style={{ flex: 1, paddingTop: 10, marginBottom: 50 }}>

    <ScrollView>
      <FormHeader
          leftHeading='Create sales lines'
          subHeading={'Sales order: ' + salesOrderData.SalesOrderNumber 
                + '\n Customer Account: ' + salesOrderData.CustAccount }
          rightHeaderOpacity={rightHeaderOpacity}
          leftHeaderTranslateX={leftHeaderTranslateX}
          rightHeaderTranslateY={rightHeaderTranslateY}
        />

        {salesLines.length != 0 ? salesLines.map((line) => {
          return (
            <View style={styles.container}>
              <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              containerStyle={styles.containerStyle}
              iconStyle={styles.iconStyle}
              data={referenceData}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? '🔎' : '...'}
              searchPlaceholder="Search..."
              value={value}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={value => handleOnChangeItem(value.value, line.LineNumber)}
            />
            <FormRowInput
            value={line.ItemNumber}
            placeholder='Item Number'
            onChangeText={value => handleOnChangeItem(value, line.LineNumber)}
            inputWidth='45%'
          />
          <FormRowInput
              value={line.OrderedSalesQuantity}
              placeholder='Quantity'
              onChangeText={value => handleOnChangeQty(value, line.LineNumber)}
              inputWidth='30%'
              keyboardType='numeric'
            />
          <FormSubmitRowButton onPress={value => deleteLine(value, line.LineNumber)} title={'🗑'} style={styles.deleteLine}/>
          </View>
          );
        }) : null}

  </ScrollView>

      {error ? (
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
          {error}
        </Text>
      ) : null}
      {loading ? (
        <Text style={{ color: 'orange', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>
          {loading}
        </Text>
      ) : null}
  
    <View style={styles.buttonContainer}>
    <View style={styles.item}>
      <FormSubmitButton onPress={replaceLastOrder} title={'Replace last order'} />
    </View>

    <View style={styles.item}>
      <FormSubmitButton onPress={addNewLine} title={'Add new line'} />
    </View>
  </View>

  <View style={styles.buttonContainer}>
    <View style={styles.item}>
      <FormSubmitButton onPress={deleteOrder} title={'Delete order'} />
    </View>

    <View style={styles.item}>
      <FormSubmitButton onPress={saveAndClose} title={'Save and close'} />
    </View>
  </View>

</View>

  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    flexDirection: 'row',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    margin: 5,
    justifyContent: 'space-between',
  },
  item: {
    width: '49%',
  },
  dropdown: {
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    width: 60,
    backgroundColor: 'rgba(242, 123, 65,1)'
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: 'absolute',
    backgroundColor: 'white',
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  containerStyle: {
    width: "600%"
  }
});



export default CreateSalesOrderEntryLines