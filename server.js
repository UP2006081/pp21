const express = require('express')
const paths = require('paths')
const app = express()
const port = 8080
const imager = require('./imager')


const RecentRequests = [];
const text = []

//middleware

app.use(express.static('public'))


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/img/:width/:height', (req, res) => {
    //stats path
    const path = req.originalUrl;
    console.log(path);
    if (!RecentRequests.includes(path)){
      RecentRequests.push(path)
    }
    if (RecentRequests.length > 10){
      RecentRequests.shift()
    }
    //stats width
    const width = parseInt(req.params.width);

    const height = parseInt(req.params.height);
    const square = parseInt(req.query.square) || 100;
    const text = req.query.text || "H.E.S.H";

    if (isNaN(width) || isNaN(height) || width <1 || height < 1 || width > 2000 || height > 2000 ){
        res.status.send('invalid image size').status(400);
        return;
    }

  imager.sendImage(res, width, height, square, text)
})

//STATS

function statssend(datatye, array){

}

app.get('/stats/paths/recent', (req, res, next) =>{
  res.send(RecentRequests).status(200);
  next();
})

app.get('stats/tests/recent', (req, res, next) =>{
  res.send
})