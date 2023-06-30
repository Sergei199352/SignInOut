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
    password: 'pASSWORD.123',
    server: 'dbsserver.database.windows.net', 
    database: 'registerDBS' 
};







let NFCdata = '';
let trarray = [];
let noTag = '';


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

app.get("/new", function(req, res){
    res.render("pages/newUser",{noTag} )
})




//------------Post Functions-------------------

//remove user post


app.post("/remove", function(req, res){
    // get the data from the page
    const remId = req.body.remId
    console.log(remId)


    // request
    const request = new sql.Request();
    
    //connect to the database
    sql.connect(config, function(err) {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred while removing the record.');
        }
    
        var request = new sql.Request();
        request.input('remID', sql.VarChar, remId);
        // delete query
        request.query("DELETE FROM dbo.SignInOut WHERE Name = @remID", function(err, result) {
            if (err) {
                console.log("The record has not been deleted: " + remId);
                console.log(err);
                res.status(500).send('An error occurred while removing the record.');
            } else {
                console.log(result);
                res.status(200).send('Data deleted successfully.');
            }
        });
    });
    
    









})


// new user post function

app.post("/submit", (req, res) =>{

    // getting the data from the database
    const rguId = noTag
    const name = req.body.name;
  const email = req.body.email;
  const building = req.body.building;
  const priority = req.body.priority;
  const isPresent = req.body.is_present === 'on' ? true : false;
  const aid = req.body.aid === 'on' ? true : false;
  const marshal = req.body.marshal === 'on' ? true : false;
  const wheelchair = req.body.wheelchair === 'on' ? true : false;

  // creating the sql insert
  sql.connect(config, (err) => {
    if (err){
        console.log('Error connecting to MSSQL:', err)
        res.status(500).send('An error occurred while connecting to the database.');
        return
    }
    // create a new request
    const request = new sql.Request();

    // setting the data to sql input so to avoid any data transformation errors
    request.input('rguId', sql.VarChar, rguId)
    request.input('name', sql.VarChar, name);
    request.input('email', sql.VarChar, email);
    request.input('building', sql.VarChar, building);
    request.input('priority', sql.VarChar, priority);
    request.input('isPresent', sql.Bit, isPresent);
    request.input('aid', sql.Bit, aid);
    request.input('marshal', sql.Bit, marshal);
    request.input('wheelchair', sql.Bit, wheelchair);

    request.query( 
        "INSERT INTO dbo.SignInOut (rgu_id, Name, Email, Building, Priority, is_present, Aid, Marshal, Wheelchair) VALUES(@rguId, @name, @email, @building, @priority, @isPresent, @aid, @marshal, @wheelchair)",
        function(err, result){
            if (err){
                console.log('error '+ err)
                res.status(500).render('pages/error_page', {errorMessage:'Appologies but you encountered the following error while inserting into the database', error:err});

            }
            else{
                console.log('Data inserted successfully.');
                res.status(200).render('pages/record_added', {message:'Record added successfully press the home button to return to the home page'})
                console.log(result)
                noTag = 0
                
            }


        }
    )


  })

})






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

    

    // connect to your database
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }

        // create Request object
        var request = new sql.Request();
        // setting the varchar datatype sql input to avoid conversion erros
        request.input('rguId', sql.VarChar, nfc)

        // SQL query that gets the records
        request.query("SELECT * FROM dbo.SignInOut WHERE rgu_id =@rguId " , function (err, recordset) {
            if (err) {
                
                console.log(err); // getting the error dislpayed on the console
                return res.status(404).send("NFC Tag Not Found");

            }
            console.log(recordset.recordset) // geting the data displayed TESTING

            

            if (recordset.recordset != 0){ // avoiding the empty array causing errors
            if (recordset && recordset.recordset.length > 0 && recordset.recordset[0].is_present == false) { // checking if the is present field is false
                // the name variable for the timelog
                name = recordset.recordset[0].Name;
                console.log("the name testing "+ recordset.recordset[0].is_present+" " +recordset.recordset[0].Name)

                // the query that updates the users presnece to true if its false
                request.query("UPDATE dbo.SignInOut SET is_present = 'true' WHERE rgu_id = @rguId " , function (err, line) {
                    if (err) throw err;
                    console.log(line);
                });
                // adds the access data to the timelog 
                request.query("INSERT INTO dbo.timeLog (Name, InOut ,time) VALUES ('" + recordset.recordset[0].Name + "',1, GETDATE())"), function (err, line){
                    if (err){
                        console.log(err);
                        return;
                    }
                    console.log(line)

                }
            } else {
                // the name variable for the timelog
                name = recordset.recordset[0].Name;
                // testing console log
                console.log("the name testing "+ recordset.recordset[0].is_present+" " +recordset.recordset[0].Email)

                // setting the presence to false 
                request.query("UPDATE dbo.SignInOut SET is_present = 'false' WHERE rgu_id = @rguId" , function (err, line) {
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
            };}
            else{
                // if there is no tag in the database then it will be assigned to the global variable to be used in the new user page
                noTag = nfc
            }
        });

        res.status(200).send("Done");
    });
});

// --------------------- this code was meant to be ading users using a csv file followitn the same structure of the database it still requires a loop ----------
// app.post('/upload', upload.single('file'), (req, res) => {
//     // Check if a file was uploaded
//     if (!req.file) {
//       return res.status(400).send('No file uploaded.');
//     }
  
//     const file = req.file;
  
//     // Check if the file has a valid filename
//     if (!file.originalname.endsWith('.csv')) {
//       return res.status(400).send('Invalid file.');
//     }
  
//     // Read the data from the CSV file
//     const results = [];
//     fs.createReadStream(file.path)
//       .pipe(csv())
//       .on('data', (data) => results.push(data))
//       .on('end', () => {
//         // Remove the temporary uploaded file
//         fs.unlinkSync(file.path);
  
//         // Do something with the data
//         // TODO used the parsed data to insert it into a table
//         console.log(results);
//         console.log(Object.keys(results[0]));
//         // sql.connect(config, function (err) {
//         //     if (err) {
//         //         console.log(err);
//         //         return res.status(500).send("Internal Server Error");
//         //     }

//         // var swqlRes = results[0]
//         // var req = new sql.Request()

        
//         // req.query("INSERT INTO dbo.SignInOut (rgu_id,Name, Email, Building, Priority ,is_present, Aid, Marshal, Wheelchair) VALUES   ('"+swqlRes.ID+"','"
//         // +swqlRes.Name+"','"+swqlRes.Email+"','"+swqlRes.Building+"','"+swqlRes.Priority+"','"+swqlRes.is_present+"','"+swqlRes.Aid+"','"+swqlRes.Marshal+"','"+swqlRes.Wheelchair+"')", 
//         // function(err,line){
//         //     if (err){
//         //         console.log(err)

//         //     }
//         //     console.log(line)
//         // });




//         // });
//         // Remove the temporary uploaded file
//       fs.unlink(file.path, (err) => {
//         if (err) {
//           console.log(err);
//         }
//         console.log('Temporary file deleted');
//       });


  
//         res.status(200).send('File uploaded and processed successfully.');
//       });
//   });

    // 24h reset 

    // function to refresh the records every midnight
    function resetIsPresentField() {
        // Get the current date and time
        var now = new Date();
        
        // Check if it's midnight
        if (now.getHours() === 0 ) {
          // Connect to the database
          sql.connect(config, function(err) {
            if (err) {
              console.log(err);
              return;
            }
            
            // Create a new request
            var request = new sql.Request();
            
            // Update all records in the table to set is_present to false
            request.query("UPDATE dbo.SignInOut SET is_present = 'false'", function(err, result) {
              if (err) {
                console.log(err);
                return;
              }
              
              console.log("is_present field reset to false for all records.");
            });
          });
        }
      }
      
      // Schedule the resetIsPresentField function to run every midnight
      var midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Set the time to midnight
      var timeUntilMidnight = midnight.getTime() - Date.now(); // Calculate the time until midnight
      setInterval(resetIsPresentField, timeUntilMidnight);
      






console.log("the server now running")
  //adding some new info
// Server listening to PORT 3000
app.listen(8080);

