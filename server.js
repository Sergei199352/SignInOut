var express = require('express');
var bodyParser = require('body-parser');
  
var app = express();

app.set('view engine', 'ejs');
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));




let NFCdata = '';


app.get("/", function(req, res){

    res.render("pages/index",{NFCdata})


})
  
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
    eventEmitter.emit('data', NFCdata);

    res.redirect('/')
    
    
});

console.log("the server now running")
  
// Server listening to PORT 3000
app.listen(8080);