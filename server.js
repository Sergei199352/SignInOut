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
    request.input('remID', sql.VarChar, remId)
    //connect to the database
    sql.connect(config, function(err){
        if (err){
            console.log(err)
            res.status(500).send('An error occurred while removing the record.');
        }
        else{
            // delete query
        request.query(" DELETE FROM dbo.SignInOut WHERE rgu_id = '@remID'", function(err){
            if (err){
                console.log( "the record has not been deleted"+remId)
                console.log(err)
                res.status(500).send('An error occurred while removing the record.');
            }
            else{
                res.status(200).send('Data deleted successfully.');
            }
            
        });}
    });
    
    









})


// new user post function

app.post("/submit", (req, res) =>{
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
                res.status(500).send('An error occurred while inserting the data.'+err);

            }
            else{
                console.log('Data inserted successfully.');
                res.status(200).send('Data inserted successfully.');
                console.log(result)
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

    // config for your database

    // connect to your database
    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error");
        }

        // create Request object
        var request = new sql.Request();
        request.input('rguId', sql.VarChar, nfc)

        // SQL query that gets the records
        request.query("SELECT * FROM dbo.SignInOut WHERE rgu_id =@rguId " , function (err, recordset) {
            if (err) {
                
                console.log(err);
                return res.status(404).send("NFC Tag Not Found");

            }
            console.log(recordset.recordset)

            

            if (recordset.recordset != 0){
            if (recordset && recordset.recordset.length > 0 && recordset.recordset[0].is_present == false) {

                name = recordset.recordset[0].Name;
                console.log("the name testing "+ recordset.recordset[0].is_present+" " +recordset.recordset[0].Name)
                request.query("UPDATE dbo.SignInOut SET is_present = 'true' WHERE rgu_id = @rguId " , function (err, line) {
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
                noTag = nfc
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

