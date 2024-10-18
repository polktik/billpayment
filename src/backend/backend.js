const express = require('express')
const bodyParser = require('body-parser');
const { application } = require('express');
const bcrypt = require('bcrypt');
var mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3309;
app.use(cors());

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

// หลังจากเข้าสู่ระบบ ให้เช็คว่าเจอเมลในฐานข้อมูลไหม ถ้าไม่เจอให้สร้างใหม่
app.post("/register", (req, res) => {
    let request = req.body;
    console.log(request);
    const query = 'SELECT * FROM users WHERE username = "' + request.username + '"';
    const hRounds = 10;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error querying MySQL:", err);
        res.status(500).json({ error: "Internal Server Error" });

      } else {
        // ไม่เจอให้สร้างใหม่
        console.log("query from db",results.length);
        if (!results.length) {
          console.log("Username : " + request.username + " not found in database");

          bcrypt.hash(request.password, hRounds, (err, hash) => {
            if (err) {
              console.error("Error hashing password:", err);
              res.status(500).json({ error: "Internal Server Error" });
              return;
            } 

          const query =
            'INSERT INTO users (first_name,last_name,username,password_hash,email) VALUE ("' +
            request.firstname +
            '","' +
            request.lastname +
            '","' +
            request.username +
            '","' +
            hash +
            '","' +
            request.email +
            '")';
  
          db.query(query, (err, results) => {
            if (err) {
              console.error("Error querying MySQL:", err);
              res.status(500).json({ error: "Internal Server Error" });
            } else {
              // สร้างใหม่สำเร็จ
              console.log("username : " + request.username + " insert Success");
              res.status(200).json({ success: true });
            }
          });
        });
        } else {
          // ถ้าเจอให้อัพเดทข้อมูล
          console.log(request.username + " has already used");
          res.status(200).json({success:true});
        }
      }
    });
  });

  app.post("/login",(req,res) => {
    let request = req.body;
    console.log("frontend data",req.body);
    console.log("data from frontend username",request.username,"password",request.password);
    const query = 'SELECT username, password_hash FROM users WHERE username = "'+ request.username +'"';

    db.query(query,(err,results)=>{
        if(err){
            console.error("Error querying MYSQL:",err);
            res.status(500).json({error:"Internal Server Error" });
        }else{
            const passExtract = results[0];
            const hashedPassword = passExtract.password_hash;
            console.log("query from SQL",hashedPassword);

            bcrypt.compare(request.password,hashedPassword,(err, password) =>{
                if(err){
                    console.error("Error comparing password");
                    return;
                }
                if(password){
                    console.log("password match");
                    res.status(200).json({ success:true });
                }else{
                    console.log("password does not match!");
                    res.status(200).json({ success:false });
                }
            });
            
        }
    });
  });

  


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


/////////// เขียน forgot password