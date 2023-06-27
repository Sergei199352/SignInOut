var express = require('express');
var bodyParser = require('body-parser');
var sql = require("mssql");//making
var app = express();

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

var nfc = "";
var ressql = {};
var data = [];
app.set('view engine', 'ejs');
app.use(express.static('publc')) // adding publc
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
     

    sql.connect(config, function (err) {
    
        if (err) console.log(err);

        // create Request object
        var request = new sql.Request();
           
        // query to the database and get the records
        request.query("SELECT * FROM dbo.SignInOut WHERE is_present = 1", function (err, recordset) {
            
            if (err) console.log(err)
            var records = recordset.recordset
            // send records as a response
            console.log(records)
            console.log(records.length)
            res.render("pages/index",{records})
            
        });
    });


    


});
// renders the page that recieves the nfc data
app.get("/load", function(req, res){
    res.render("pages/upload")
})




//------------Post Functions-------------------

// this get function was used to test for the communication between the endpoint and the python code
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

// post that recievews the nfc data from the python code
app.post("/read", (req, res) => {
    var nfc1 = req.body.id; // getting the NFC ID from the Python code
    nfc = String(nfc1);
    var data = "";
    var name = "";

    // config for your database

    // connect to your database
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }

        // create Request object
        var request = new sql.Request();
       

        // SQL query that gets the records
        request.query("SELECT * FROM dbo.SignInOut WHERE rgu_id = " + nfc, function (err, recordset) {
            if (err) {
                
                console.log(err);
                return res.status(404).send("NFC Tag Not Found");
            }
            console.log(recordset.recordset)

            if (recordset && recordset.recordset.length > 0 && recordset.recordset[0].is_present == false) {

                name = recordset.recordset[0].Name;
                console.log("the name testing "+ recordset.recordset[0].is_present+" " +recordset.recordset[0].Name)
                request.query("UPDATE dbo.SignInOut SET is_present = 'true' WHERE rgu_id = " + nfc, function (err, line) {
                    if (err) throw err;
                    console.log(line);
                });
                request.query("INSERT INTO dbo.timeLog (Name, InOut ,time) VALUES ('" + recordset.recordset[0].Name + "',1, GETDATE())"), function (err, line){
                    if (err){
                        console.log(err);
                        return;
                    }
                    console.log(line)

                }
            } else {
                name = recordset.recordset[0].Name;
                console.log("the name testing "+ recordset.recordset[0].is_present+" " +recordset.recordset[0].Email)
                request.query("UPDATE dbo.SignInOut SET is_present = 'false' WHERE rgu_id = " + nfc, function (err, line) {
                    if (err) throw err;
                    request.query("INSERT INTO dbo.timeLog (Name, InOut ,time) VALUES ('" + recordset.recordset[0].Name + "',0, GETDATE())"), function (err, line){
                        if (err){
                            console.log(err);
                            return;
                        }
                        console.log(line)

                    }
                    console.log(line);
                });
            }
        });

        res.status(200).send("Done");
    });
});


app.post('/upload', upload.single('file'), (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
  
    const file = req.file;
  
    // Check if the file has a valid filename
    if (!file.originalname.endsWith('.csv')) {
      return res.status(400).send('Invalid file.');
    }
  
    // Read the data from the CSV file
    const results = [];
    fs.createReadStream(file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Remove the temporary uploaded file
        fs.unlinkSync(file.path);
  
        // Do something with the data
        // TODO used the parsed data to insert it into a table
        console.log(results);
        console.log(Object.keys(results[0]));
        // sql.connect(config, function (err) {
        //     if (err) {
        //         console.log(err);
        //         return res.status(500).send("Internal Server Error");
        //     }

        // var swqlRes = results[0]
        // var req = new sql.Request()

        
        // req.query("INSERT INTO dbo.SignInOut (rgu_id,Name, Email, Building, Priority ,is_present, Aid, Marshal, Wheelchair) VALUES   ('"+swqlRes.ID+"','"
        // +swqlRes.Name+"','"+swqlRes.Email+"','"+swqlRes.Building+"','"+swqlRes.Priority+"','"+swqlRes.is_present+"','"+swqlRes.Aid+"','"+swqlRes.Marshal+"','"+swqlRes.Wheelchair+"')", 
        // function(err,line){
        //     if (err){
        //         console.log(err)

        //     }
        //     console.log(line)
        // });




        // });
        // Remove the temporary uploaded file
      fs.unlink(file.path, (err) => {
        if (err) {
          console.log(err);
        }
        console.log('Temporary file deleted');
      });


  
        res.status(200).send('File uploaded and processed successfully.');
      });
  });




console.log("the server now running")
  //adding some new info
// Server listening to PORT 3000
app.listen(8080);

