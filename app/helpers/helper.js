import client from '../api/client';
import axios from 'axios';

const helpers = {
    deleteSalesOrderHeader: async function(salesOrderNumber, dataAreaId, userAuthInfo){
          //Make call to D365 to get sales order header information
          const deleteSalesOrder = userAuthInfo.D365ResourceURL + "/data/SalesOrderHeadersV2(SalesOrderNumber= '" + salesOrderNumber + "', dataAreaId='" + dataAreaId + "')"

          var userAuthToken = "Bearer " + userAuthInfo.userAuthToken;

          var errorMessage = "";

          const salesOrder = await axios({
            method: "delete", 
            url: deleteSalesOrder,
            headers: { "Authorization": userAuthToken },
          }).catch( error => {
            statusError = true;

            errorMessage = JSON.stringify(error);

            if (errorMessage.includes("400"))
            {
              errorMessage = "Status code: 400" + "\n" + "Confirm order number and legal entity are valid." + "\n";
            }
            else if (errorMessage.includes("500"))
            {
              errorMessage = "Status code: 500" + "\n" + "Confirm connection & data is valid." + "\n";
            }
            else
            {
              errorMessage = "An error occured." + "\n" + "Confirm connection is valid." + "\n";
            }

          }
        );
    },
    replaceLastOrder: async function(salesOrderData, userAuthInfo){

      //Make call to D365 to get sales order header information
      const salesHeaderData = userAuthInfo.D365ResourceURL + "/data/SalesOrderHeadersV2?$top=1&$orderby=OrderCreationDateTime desc&$select=SalesOrderNumber&$filter=OrderingCustomerAccountNumber eq '" + salesOrderData.CustAccount +  "'"

      var userAuthToken = "Bearer " + userAuthInfo.userAuthToken;

      var errorMessage = "";

      const salesOrder = await axios({
        method: "get", 
        url: salesHeaderData,
        headers: { "Authorization": userAuthToken },
      })

    //Parse out key field
    var salesOrderNumber =  salesOrder.data.value[0].SalesOrderNumber;


    //Make call to D365 to get sales order line information
    const getSalesOrderLine = userAuthInfo.D365ResourceURL + "/data/SalesOrderLines?$filter=SalesOrderNumber eq '" + salesOrderNumber + "'";

    const salesOrderLines = await axios({
      method: "get",
      url: getSalesOrderLine,
      headers: { "Authorization": userAuthToken },
    });

    //Parse out key fields
    var salesLines = [];

    for (let line of salesOrderLines.data.value) {
      console.log(line.OrderedSalesQuantity);

      salesLines.push({
        "ItemNumber": line.ItemNumber,
        "OrderedSalesQuantity": JSON.stringify(line.OrderedSalesQuantity),
        "SalesOrderNumber": line.SalesOrderNumber,
        "LineNumber": salesLines.length + 1
      });

      console.log(salesLines);
    }

      return salesLines;
    },
    createSalesOrderHeader: async function(headerData, userAuthInfo){

        //Make call to D365 to get sales order header information
        const postSalesOrderHeader = userAuthInfo.D365ResourceURL + "/data/SalesOrderHeadersV2";

        const postSalesOrderHeaderBody = {
            "OrderingCustomerAccountNumber": headerData.Customer
        }
        
        var userAuthToken = "Bearer " + userAuthInfo.userAuthToken;

        var statusError;
        var errorMessage = "";
        var salesOrderHeader;

        var makePostRequest = true;
        var retryCount = 0;

        while (makePostRequest && retryCount < 5)
        {

            makePostRequest = false;

            salesOrderHeader = await axios({
                method: "post",
                url: postSalesOrderHeader,
                data: postSalesOrderHeaderBody,
                headers: { "Authorization": userAuthToken, "Content-Type": "application/json" },
            }).catch( error => {
                statusError = true;

                if (errorMessage.includes("400"))
                {
                    errorMessage = "Status code: 400" + "\n" + "Confirm customer is valid." + "\n";
                }
                else if (errorMessage.includes("500"))
                {
                    errorMessage = "Status code: 500" + "\n" + "Confirm connection & data is valid." + "\n";
                }
                else if (errorMessage.includes("429"))
                {
                    errorMessage = "Status code: 429" + "\n" + "Call throttled - attempting retry." + "\n";
                    makePostRequest = true;
                }
                else
                {
                    errorMessage = "An error occured." + "\n" + "Confirm connection is valid." + "\n";
                }

                }
            );

            if (makePostRequest)
            {
              retryCount++;
              await new Promise(r => setTimeout(r, 30000));
            }

        }

        if (!statusError)
        {
            if (salesOrderHeader.data.DefaultShippingWarehouseId == "")
            {
                statusError = true;
                errorMessage = "Customer does not have default warehouse." + "\n" + "Items can not be added to order " + salesOrderHeader.data.SalesOrderNumber + "\n";
            }
        }

        var returnJson;

        if (statusError)
        {
            returnJson = {
                status: "Failed",
                SalesOrderNumber: headerData.PendingNumber,
                CustomerAccount: headerData.Customer,
                message: errorMessage
            }
        }
        else
        {
            var successMsg = "Sucessfully created order " + salesOrderHeader.data.SalesOrderNumber;

            returnJson = {
                status: "Created",
                SalesOrderNumber: salesOrderHeader.data.SalesOrderNumber,
                CustomerAccount: headerData.Customer,
                message: successMsg
            }
        }

        return returnJson;
    },
    createSalesOrderLine: async function(lineData, userAuthInfo){

     //Make call to D365 to get sales order header information
      const postSalesOrderLine = userAuthInfo.D365ResourceURL + "/data/SalesOrderLines";

      const postSalesOrderLineBody = {
        "SalesOrderNumber": lineData.PendingNumber,
        "ItemNumber": lineData.ItemNumber,
        "OrderedSalesQuantity":parseInt(lineData.OrderedSalesQuantity)
    };

      var userAuthToken = "Bearer " + userAuthInfo.userAuthToken;

      var statusError = false;
      var errorMessage = "";

      var makePostRequest = true;
      var retryCount = 0;
      var salesOrderLine;

      while (makePostRequest && retryCount < 5)
      {

          makePostRequest = false;

          salesOrderLine = await axios({
            method: "post",
            url: postSalesOrderLine,
            data: postSalesOrderLineBody,
            headers: { "Authorization": userAuthToken, "Content-Type": "application/json" },
          }).catch( error => {
            statusError = true;

            if (errorMessage.includes("400"))
            {
              errorMessage = "Status code: 400" + "\n" + "Confirm item is valid." + "\n";
            }
            else if (errorMessage.includes("500"))
            {
              errorMessage = "Status code: 500" + "\n" + "Confirm connection is valid." + "\n";
            }
            else if (errorMessage.includes("429"))
            {
                errorMessage = "Status code: 429" + "\n" + "Call throttled - attempting retry." + "\n";
                makePostRequest = true;
            }
            else
            {
              errorMessage = "An error occured." + "\n" + "Confirm connection is valid." + "\n";
            }

          }
        );

        if (makePostRequest)
        {
          retryCount++;
          await new Promise(r => setTimeout(r, 30000));
        }

      }

        var returnJson;

        if (statusError)
        {
            returnJson = {
                status: "Failed",
                SalesOrderNumber: lineData.PendingNumber,
                ItemNumber: lineData.ItemNumber,
                OrderedSalesQuantity: lineData.OrderedSalesQuantity,
                message: errorMessage
            }
        }
        else
        {
            var successMsg = "Sucessfully created line for order" + lineData.SalesOrderNumber;

            returnJson = {
                status: "Created",
                SalesOrderNumber: lineData.SalesOrderNumber,
                ItemNumber: lineData.ItemNumber,
                OrderedSalesQuantity: lineData.OrderedSalesQuantity,
                message: successMsg
            }
        }

        return returnJson;
    },
    getAuthToken: async function(profile)
    {
        try {
            //Make call to getUserConnectionInfo (send in email)
            const getConnectionInfo = {email: profile.user.email};
      
            const res = await client.post('/getConnectionInfo', getConnectionInfo, {
              headers: {
                Accept: 'application/json',
                authorization: `JWT ${profile.token}`,
              },
            });

            const D365ResourceURL   = res.data.formData.D365ResourceURL;
            const AuthHostURL       = res.data.formData.AuthHostURL;
            const AuthClientId      = res.data.formData.AuthClientId;
            const AuthClientSecret  = res.data.formData.AuthClientSecret;
            const AuthToken         = res.data.formData.AuthToken;
            const AuthTokenExp      = res.data.formData.AuthTokenExp;
      
            //No connection found
            if (D365ResourceURL == '' || AuthHostURL == '' || AuthClientId == '' || AuthClientSecret == '')
            {
                var noConnectionFound = "No connection found.\n Please enter a valid connection and try again."
                setError(noConnectionFound);
                throw error(noConnectionFound);
            }
      
            const currentTimeSeconds = new Date().getTime() / 1000;
      
            var userAuthToken;
      
            //Check auth token, if expired get new token and update token in data base (updateUserConnectionToken)
            if (AuthTokenExp == '' || AuthTokenExp < currentTimeSeconds)
            {
                //Set up new axios client based on connection info
                 var formdata = new FormData();
                 formdata.append("resource", D365ResourceURL);
                 formdata.append("client_id", AuthClientId);
                 formdata.append("client_secret", AuthClientSecret);
                 formdata.append("grant_type", "client_credentials")
      
                 const dynamicRes = await axios({
                   method: "post",
                   url: AuthHostURL,
                   data: formdata,
                   headers: { "Content-Type": "multipart/form-data" },
                 })
      
                 userAuthToken = dynamicRes.data.access_token;
      
                 var updatedTokenExp = +currentTimeSeconds + +dynamicRes.data.expires_in;
      
                 const updateUserConnectionToken = {email: profile.user.email, AuthTokenExp: updatedTokenExp, AuthToken: userAuthToken};
      
                 const updatedTokenRes = await client.post('/updateUserConnectionToken', updateUserConnectionToken, {
                  headers: {
                    Accept: 'application/json',
                    authorization: `JWT ${profile.token}`,
                  },
                });
      
            }
            else
            {
              userAuthToken = AuthToken;
            }

            var returnJson = {
                D365ResourceURL: D365ResourceURL,
                userAuthToken: userAuthToken
            }

            return returnJson;
        } 
    catch (error) {
        console.log(error);
      }

      return "";
      
    }
}

export default helpers;