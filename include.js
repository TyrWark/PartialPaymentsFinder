
/* globals jQuery, $, waitForKeyElements */

const timer = ms => new Promise(res => setTimeout(res, ms))

var PTArray = [[]]
var PaymentProvider = []
var LSPayCheck = ""
var Payments =[[]]
var sid = 0
var matcharray = []
var namearray = []
var final = []
var Headers = ["Payment Type", "Charge Total", "Archived", "salePaymentID"]
var pagematch = ""
var table
var numberofrows = 0


//Get Sale ID
function getSaleID(){
    sid = (document.location.href).split("id=")[1].split("&")[0];
}

//Grab all Payments on a Sale
function getSalePayments(){

    //fetch all Payments on the current sale
    $.getJSON(location.origin+'/API/Account/'+window.merchantos.account.id+'/Sale/'+sid+'.json?load_relations=all').done(


        function(json) {


            var Saleinfo = json.Sale.SalePayments.SalePayment
            console.log(json.Sale)


            //Throw all payments + some info into 2dArray
            if(Saleinfo.length > 1){

                for (var i in Saleinfo){
                    var TempPTArray = []

                    //TempPTArray.push(Saleinfo[i].paymentTypeID)
                    TempPTArray.push(Saleinfo[i].PaymentType.name)
                    TempPTArray.push("$"+Saleinfo[i].amount)
                    TempPTArray.push(Saleinfo[i].archived)
                    TempPTArray.push(Saleinfo[i].salePaymentID)
                    // console.log("Temp Array " + TempPTArray)
                    Payments.push(TempPTArray)
                    TempPTArray = []

                    //If single entry, throw into 2DArray
                }}else{

                    TempPTArray = []

                    //TempPTArray.push(Saleinfo.paymentTypeID)
                    TempPTArray.push(Saleinfo.PaymentType.name)
                    TempPTArray.push(Saleinfo.amount)
                    TempPTArray.push(Saleinfo.archived)
                    TempPTArray.push(Saleinfo.salePaymentID)
                    // console.log("Temp Array " + TempPTArray)
                    Payments.push(TempPTArray)
                    TempPTArray = []



                }







            Payments.shift()
            Payments.unshift(Headers)
            console.log("_____Payment List Below_____")
            console.log("Format = Payment Type ID,Tip Amount, PaymentID, Amount, Archived?, salePaymentID")
            console.log(Payments)
            console.log("_____Payment List Above_____")
            console.log("")
            console.log("")
            console.log("")
        })


}

//Constantly checks the current URL
function URLCheck(){
    setTimeout(function() {
        //RegEx to match the payments tab on a sale
        const UrlMatch = new RegExp(/https:\/\/[a-z]{2}\.merchantos\.com\/\?name\=transaction\.views\.transaction\&form_name\=view\&id\=[0-9]{1,9}\&tab=payments/gm)
        var isRightPage = UrlMatch.test(document.URL)

        //if you are on the payments tab, fire main script, then listen for the page to change.
        if(isRightPage == true){
            Main()
            console.log("Fired Main")


            let currentPage = location.href;
            // listen for changes
            var Interval = setInterval(function()
                                       {
                // When the page changes, refire this function and clearInterval to prevent ever increasing checks/fires
                if (currentPage != location.href)
                {
                    URLCheck()


                    clearInterval(Interval)

                }

            }, 1000);



        }
        else{
            // if we are not on the right page, refire function with delay and remove button
            URLCheck()
            console.log("Not correct page")
            try{document.getElementById ("myContainer").remove()}catch{null}
        }
    },750)
}
//Creates Clickable link to payref for LSPayments charges
function LinkGenerator(){
    console.log("LSPayCC")
    try{
        numberofrows = document.querySelector("#admin_utilities_payments_view_single > div > table > tbody > table > tbody").childElementCount
    }catch{
        numberofrows = 1
    }

    for (let i =1; i < numberofrows+1; i++){
        //create the queryselector
        let clink = `#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(${i}) > td:nth-child(4)`
        let PayID = null

        //Get PayID from the table, either at the array level or single entry level
        try{PayID = document.querySelector(clink).innerHTML}
        catch{PayID = document.querySelector("#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(2) > td:nth-child(4)").innerHTML}

        //Generate the PaymentLink a ref to insert into the table
        var PaylinkComplete = `\<a href="https://us.merchantos.com/reports/payment/retail/${PayID}"\>`




        //If not the first row aka header row, insert the A Ref
        if (i != 1){

            try{document.querySelector(clink).innerHTML = PaylinkComplete + PayID}
            catch{document.querySelector(`#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(${i}) > td:nth-child(4)`).innerHTML = PaylinkComplete + PayID}

        }
        //Insert A Ref in the case of a single entry
        try{document.querySelector(clink).innerHTML = document.querySelector(clink).innerHTML
           }
        catch(e){document.querySelector("#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(2) > td:nth-child(4)").innerHTML = PaylinkComplete + PayID
                }








    }


    ExtraDeets()
}

//Checks if the Payments Provider is LSPay or 3rd Party Integrated
function PayProvider(){

    var getPTList = $.getJSON(location.origin+'/API/Account/'+window.merchantos.account.id+'/Sale/'+sid+'.json?load_relations=["SalePayments"]').done(


        function(json) {


            var Saleinfo = json.Sale.SalePayments.SalePayment
            console.log(json.Sale)


            //Throw all payments + some info into 2dArray
            if(Saleinfo.length > 1){

                for (var i in Saleinfo){


                    PaymentProvider.push(Saleinfo[i].ccChargeID !=="0")
                    // console.log(PaymentProvider)



                    //If single entry, throw into 2DArray
                }}else{

                    PaymentProvider.push(Saleinfo.ccChargeID !=="0")
                    //console.log(PaymentProvider)
                }

            console.log("Is Any True?")
            console.log(PaymentProvider.some(true))
            LSPayCheck = PaymentProvider.some(true)



        }


    )}

//Creates Clickable link to payref for Non-LSPayments charges
function CCChargeGen(){
    console.log("NonLSPayCC")
    try{
                numberofrows = document.querySelector("#admin_utilities_payments_view_single > div > table > tbody > table > tbody").childElementCount
    }catch{
        numberofrows = 1
    }

    for (let i =1; i < numberofrows+1; i++){
        //create the queryselector
        let clink = `#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(${i}) > td:nth-child(4)`
        var PayID = null

        //Get PayID from the table, either at the array level or single entry level
        try{PayID = document.querySelector(clink).innerHTML}
        catch{PayID = document.querySelector("#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(2) > td:nth-child(4)").innerHTML}

         //Generate the PaymentLink a ref to insert into the table
         var PaylinkComplete = `\<a href="https://us.merchantos.com/?name=reports.register.views.payment&form_name=view&id=${PayID}&tab=ccard""\>`




        //If not the first row aka header row, insert the A Ref
     //If not the first row aka header row, insert the A Ref
        if (i != 1){

            try{document.querySelector(clink).innerHTML = PaylinkComplete + PayID}
            catch{document.querySelector(`#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(${i}) > td:nth-child(4)`).innerHTML = PaylinkComplete + PayID}

        }
        //Insert A Ref in the case of a single entry
        try{document.querySelector(clink).innerHTML = document.querySelector(clink).innerHTML
           }
        catch(e){document.querySelector("#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(2) > td:nth-child(4)").innerHTML = PaylinkComplete + PayID
                }






     }




}

//Rebuilds the table in the UI
function BuildTable(){


    //setup our table array
    var tableArr = Payments
    //create a Table Object
    table = document.createElement('table');
    //iterate over every array(row) within tableArr
    for (let row of tableArr) {
        //Insert a new row element into the table element
        table.insertRow();
        //Iterate over every index(cell) in each array(row)
        for (let cell of row) {
            //While iterating over the index(cell)
            //insert a cell into the table element
            let newCell = table.rows[table.rows.length - 1].insertCell();
            //add text to the created cell element
            newCell.textContent = cell;
        }
    }


}

function ButtonClickAction (zEvent) {



    //Gut the table to use for ourselves
    try{
        document.querySelector("#admin_utilities_payments_view_single > div > table > tbody").innerHTML=""
    }
    catch{
        document.querySelector("#noAdjustPaymentsFound").innerHTML=""
    }


    try{
        document.querySelector("#admin_utilities_payments_view_single > div > table > thead > tr").remove()
    }
    catch{
        document.querySelector("#noAdjustPaymentsFound").remove()



    }




    BuildTable()


    //append the compiled table to the DOM
    try{
        document.querySelector("#admin_utilities_payments_view_single > div > table > tbody").appendChild(table);
    }
    catch{
        document.querySelector("#admin_utilities_payments_view_single > div > div").appendChild(table)
    }
    document.getElementById ("myContainer").remove()



    //After the table is built, fire the LinkGen
    setTimeout(function(){

        PayProvider()

        setTimeout(function(){
            console.log("Check")
            console.log(LSPayCheck)

            if(LSPayCheck !== false)
            {CCChargeGen()}
            else
            {LinkGenerator()}
        },1000)

    },300)




}

function CreateButton(){


    if(document.getElementById ("myContainer") === null){



        var zNode = document.createElement ('div');
        zNode.innerHTML = '<button id="myButton" type="button">'
            + 'Fetch Payments</button>'
        ;
        zNode.setAttribute ('id', 'myContainer');



        try {
            document.querySelector("#printGiftReceiptButton").after(zNode);
        }catch{
            document.querySelector("#printQuoteButton").after(zNode)

        }




        //--- Activate the newly added button.
        document.getElementById ("myButton").addEventListener (
            "click", ButtonClickAction, false
        );


    }else{console.log("Button Already Exists")}




}

//Main Engine
function Main(){
    setTimeout(function(){
        //Clear out arrays in case this is run multiple times before a page refresh
        PTArray = [[]]
        Payments = [[]]


        getSaleID()

        setTimeout(function(){
            getSalePayments()
        },1000)


        setTimeout(function(){
            CreateButton()
        },2000)

    },800)
}


async function ExtraDeets(){
    await timer(1000)
    for (let i = 1; i < numberofrows+1; i++) {
    console.log(numberofrows)
    let row = document.querySelector(`#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(${i})`);
     let x = row.insertCell(4);
    if(i != 1){x.innerHTML = "Test"}else{x.innerHTML = "Archive Link"}
    let SID = document.querySelector(`#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(${i}) > td:nth-child(4)`).innerText
    let ref = `\<a href="https://us.merchantos.com/?name=reports.register.views.payment&form_name=view&id=${SID}&tab=ccard""\>`
    x.innerHTML = ref + SID
    if(i === 2){null}else{x.innerHTML = ref + SID}
    document.querySelector("#admin_utilities_payments_view_single > div > table > tbody > table > tbody > tr:nth-child(1) > td:nth-child(5)").innerHTML = "Archive Link"


}
}


//Start Point
URLCheck()


