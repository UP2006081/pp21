const express = require('express')
const paths = require('paths')
const app = express()
const port = 8080
const imager = require('./imager')


const RecentRequests = [];
const sizearray = [];
const textarray = [];
const topsizesarray = [];
const filteredsizesarray = [];

//middleware

app.use(express.static('public'))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/img/:width/:height', (req, res) => {
  //data collection
  const path = req.originalUrl;
  const width = parseInt(req.params.width);
  const height = parseInt(req.params.height)
  const square = parseInt(req.query.square) || 100;
  const text = req.query.text || "H.E.S.H";
  //filter
  if (isNaN(width) || isNaN(height) || width <1 || height < 1 || width > 2000 || height > 2000 ){
    res.status.send('invalid image size').status(400);
    return;
  }
  //stats path
  statssend(path, RecentRequests);
  //stats size
  let size = { w:width, h:height}
  statssend(size, sizearray); 
  //stats text
  statssend(text, textarray);
  //stats top 10 size
  top10sizes(width, height, topsizesarray);
  console.log('pog')
  topsizesarray.sort(sortByProperty("n"));
  filtertop10()
  //Sending off to image creator
  imager.sendImage(res, width, height, square, text)
})

//STATS
//sender for basics
function statssend(datatye, array){
  console.log(datatye);
  if (!array.includes(datatye)){
    array.push(datatye);
  }
  if (array.length > 10){
    array.shift();
  }
};
//top 10
//find value up it
function top10sizes(width, height, array){
  console.log({width, height});
  let found = false;
  for (let i = 0; i < array.length; i++){
    if (array[i]["w"] === width && array[i]["h"] === height){
      array[i]["n"]  += 1;
      found = true;
    }
  }
  if(!found){
    array.push({w: width, h: height, n:1});
  }
}
//sorter
function sortByProperty(property){  
  return function(a,b){  
     if(a[property] > b[property])  
        return -1;  
     else if(a[property] < b[property])  
        return 1;  
 
     return 0;  
  }  
}
//cut down to 10
function filtertop10(){
  for (let i = 0; i < 10; i++){
    filteredsizesarray[i] = topsizesarray[i]
  }
}

app.get('/stats/paths/recent', (req, res, next) =>{
  res.send(RecentRequests).status(200);
  next();
})

app.get('/stats/sizes/recent', (req, res, next) =>{
  res.send(sizearray).status(200);
  next();
})

app.get('/stats/texts/recent', (req, res, next) =>{
  res.send(textarray).status(200);
  next();
})

app.get('/stats/sizes/top', (req, res, next) =>{
  res.send(filteredsizesarray).status(200);
  next();
})