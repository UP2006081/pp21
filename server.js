const express = require('express');
const paths = require('paths');
const app = express();
const port = 8080;
const imager = require('./imager');


const RecentRequests = [];
const Sizearray = [];
const Textarray = [];
const Topsizesarray = [];
const referers  = [];
const timestamps = [];

//middleware

app.use(express.static('public'));


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})

app.get('/img/:width/:height', (req, res) => {
  //data collection
  timestamps.push(req.headers["Date"]);
  const refferal = req.headers.referer;
  console.log(timestamps);
  const path = req.originalUrl;
  const width = parseInt(req.params.width);
  const height = parseInt(req.params.height);
  const square = parseInt(req.query.square) || 100;
  const text = req.query.text || "H.E.S.H";
  //filter
  if (isNaN(height) && isNaN(width) || height < 1 && width <1 || height > 2000 && width > 2000){
    res.status.send('both too big').status(403);
    return;
  }
  if (isNaN(width) || width <1 || width > 2000){
    res.status.send('width too big').status(403);
    return
  }
  if (isNaN(height) || height < 1 || height > 2000 ){
    res.status.send('height too big').status(403);
    return;
  }
  //stats path
  statssend(path, RecentRequests);
  //stats size
  let size = { w:width, h:height};
  statssend(size, Sizearray); 
  //stats text
  statssend(text, Textarray);
  //stats top 10 size
  top10sizes(width, height, Topsizesarray);
  Topsizesarray.sort(sortByProperty("n"));
  //stats refferal 
  top10sizesreffer(refferal);
  referers.sort(sortByProperty("n"));
  //hits
  //Sending off to image creator
  imager.sendImage(res, width, height, square, text);
})



//STATS
//sender for basics
function statssend(datatye, array){
  if (!array.includes(datatye)){
    array.push(datatye);
  };
  if (array.length > 10){
    array.shift();
  };
};
//top 10
//find value up it
function top10sizes(width, height, array){
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
//top 10 reffers 
function top10sizesreffer(refferal){
  let found = false;
  for (let i = 0; i < referers.length; i++){
    if (referers[i]["ref"] === refferal){
      referers[i]["n"]  += 1;
      found = true;
    }
  }
  if(!found){
    referers.push({ref: refferal, n:1});
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
//hits

//api sends
app.get('/stats/paths/recent', (req, res, next) =>{
  res.send(RecentRequests).status(200);
  next();
})

app.get('/stats/sizes/recent', (req, res, next) =>{
  res.send(Sizearray).status(200);
  next();
})

app.get('/stats/texts/recent', (req, res, next) =>{
  res.send(Textarray).status(200);
  next();
})

app.get('/stats/sizes/top', (req, res, next) =>{
  res.send(Topsizesarray.slice(0, 9)).status(200);
  next();
})

app.get('/stats/referrers/top', (req, res, next) =>{
  res.send(referers.slice(0, 9)).status(200);
  next();
})