var crypto=require("./crypto")
const fetch = require('node-fetch');
const apiUrl = process.env.API_URL || "http://127.0.0.1:8081/";
const wapiUrl = process.env.WAPI_URL || "http://127.0.0.1:8083/";
exports.GetAPIURL=function(){
    return apiUrl;
}
exports.GetWAPIURL=function(){
    return wapiUrl;
}
exports.GetData=async function(requestUrl, params, sex) {
    //cannot use dispatch in this function
    let rs = { Status: 0, Error: "", Message: "", Data: {} }
    
        console.log("call: "+ requestUrl + " data:" + params + " - " + sex)

        try {
            const res = await fetch(apiUrl + crypto.encDat2(requestUrl, 7), {
                method: 'POST',
                body: "data=" + crypto.encDat2(sex + "|" + params, 9),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            const datatext = await res.text();
            
            //get data and decode
            let data = ""
            try {
                data = crypto.decDat(datatext);
                console.log("data return: ",data)
            }
            catch (ex) {
                console.log("error in decode:",ex.message)
            }
            //parse to json object
            
            let rtdata = {};
            try {
                rtdata = JSON.parse(data)
                if (rtdata.Status !== undefined) rs.Status = rtdata.Status;
                if (rtdata.Error !== undefined) rs.Error = rtdata.Error;
                if (rtdata.Message !== undefined) rs.Message = rtdata.Message;
                if (rtdata.Data !== undefined) rs.Data = rtdata.Data;
            } catch (ex) {
                rs.Error = ex.message;
            }
        
        } catch (error) {
            rs.Error = error.message;
        }
    
    return Promise.resolve(rs);

}