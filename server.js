var express = require('express');
var bodyParser = require('body-parser');
  
var app = express();
  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static("public"))


app.get("/", function(req, res){

    res.send("hello wordl")


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
    res.send({ result: sum });
    
});

console.log("the server now running")
  
// Server listening to PORT 3000
app.listen(8080);