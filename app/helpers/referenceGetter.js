import client from '../api/client';
import axios from 'axios';

const referenceGetter = {
    getCustomerData: async function(userAuthInfo){
      //Make call to D365 to get sales order header information
      const getCustomerInfo = userAuthInfo.D365ResourceURL + "/data/CustomersV3?$select=CustomerAccount,NameAlias";

      var userAuthToken = "Bearer " + userAuthInfo.userAuthToken;

      const customerInfo = await axios({
        method: "get",
        url: getCustomerInfo,
        headers: { "Authorization": userAuthToken },
      });

      const customerData = [];

      for (var currentCustomer of customerInfo.data.value)
      {
        var label = "🔎 " + currentCustomer.CustomerAccount + " | " + currentCustomer.NameAlias;

        const customerInfoDetails = {
            label: label,
            value: currentCustomer.CustomerAccount
          }

          customerData.push(customerInfoDetails);
      }

      return customerData;
    },
    getItemData: async function(userAuthInfo){
      //Make call to D365 to get sales order header information
      const getItemInfo = userAuthInfo.D365ResourceURL + "/data/ReleasedProductsV2?$select=ItemNumber,SearchName";

      var userAuthToken = "Bearer " + userAuthInfo.userAuthToken;

      const itemInfo = await axios({
        method: "get",
        url: getItemInfo,
        headers: { "Authorization": userAuthToken },
      });

      const itemData = [];

      for (var currentItem of itemInfo.data.value)
      {
        var label = "🔎 " + currentItem.ItemNumber + " | " + currentItem.SearchName;

        const customerInfoDetails = {
            label: label,
            value: currentItem.ItemNumber
          }

          itemData.push(customerInfoDetails);
      }

      return itemData;
    }
}

export default referenceGetter;