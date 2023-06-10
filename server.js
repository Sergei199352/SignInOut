const ndef = new NDEFReader();
var express = require('express')
var app = express();

ndef.scan().then(()=> {
ndef.onreading = ({message, serialNumber})=>{
    console.log(message)
}
})

app.listen(8080);
console.log('listening on 8080');
//new stuff