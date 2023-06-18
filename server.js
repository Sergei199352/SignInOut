var express = require('express');
var bodyParser = require('body-parser');
var sql = require("mssql");//making
var app = express();
var nfc = "";
var ressql = "";
app.set('view engine', 'ejs');
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var config = {
    user: 'sergey',
    password: 'Muskula.123',
    server: 'dbsserver.database.windows.net', 
    database: 'registerDBS' 
};







let NFCdata = '';
let trarray = [];


app.get("/", function(req, res){

    res.render("pages/index",{NFCdata, trarray})


});
// renders the page that recieves the nfc data
app.get("/nread", function(req, res){

    res.render("pages/nfc",{nfc})


})
  




app.get('/sql', function (req, res) {
   
    

    // config for your database
    

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query('select * from dbo.SignInOut', function (err, recordset) {
            
            if (err) console.log(err)

            // send records as a response
            res.send(recordset);
            
        });
    });
});
app.get('/nfcsql', function(req,res){
    res.render('pages/nfcsql', {ressql, nfc })
})




//------------Post Functions-------------------
app.post("/arraysum", (req, res) => {
  
    // Retrieve array form post body
    var array = req.body.array;  
    console.log(array);
  
    // Calculate sum
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        if (isNaN(array[i])) {
            continue;
        }
        sum += array[i];
    }
    console.log(sum);
    
    // Return json response
    NFCdata = sum;
    trarray = array;
    eventEmitter.emit('data', NFCdata);

    res.json({ result: sum });
    
});

// post that recievews the nfc data
app.post("/read", (req, res) => {
var nfc1 = req.body.id
nfc = nfc1//


   
    

    // config for your database
    

    // connect to your database
    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();


        request.query("SELECT * FROM dbo.SignInOut WHERE rgu_id  = "+ nfc , function (err, recordset) {
            if (err) throw err;
            ressql = recordset.recordset;
            console.log(ressql)
            ;})
           
       
    });
    res.status(200).send(ressql)
});


console.log("the server now running")
  //adding some new info
// Server listening to PORT 3000
app.listen(8080);