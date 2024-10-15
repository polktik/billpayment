const express = require('express')
const bodyParser = require('body-parser');
const { application } = require('express');
var mysql = require('mysql2');

const app = express();
const port = 3309;
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE"
  );
  next();
});
app.use(express.json());

require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port : process.env.DB_PORT,
    database: process.env.DB_DATABASE,
});


// เชื่อมต่อกับ MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

app.get("/getuser",(req,res)=>{
    const query = "SELECT * FROM users";
    db.query(query,(err,results) => {
        if(err){
            console.error("Error querying :",err);
            res.status(500),json({error:"Internal server error"});
        }else{
            res.json(results);
            console.log(results);
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
