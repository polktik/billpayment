const express = require('express')
const bodyParser = require('body-parser');
const { application } = require('express');
const bcrypt = require('bcrypt');
var mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer'); 

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


const transporter = nodemailer.createTransport({
  service:"Gmail",
  host: process.env.EMAIL_HOST, // e.g., 'smtp.gmail.com'
  port: process.env.EMAIL_PORT,  // e.g., 587 for Gmail
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,  // your email address
    pass: process.env.EMAIL_PASS,  // your email password or application-specific password
  }  //,
//   tls: {
//     rejectUnauthorized: false,
//   },
//   logger: true, // Enable logging
//   debug: true,  // Enable debugging
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
                    res.status(401).json({succes:false});
                }
            });
            
        }
    });
  });



  // Existing /sendOTP endpoint
// Existing /sendOTP endpoint
app.post("/sendOTP", (req, res) => {
  const { email } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error querying MySQL:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    }

    if (!results.length) {
      console.log("Email not found:", email);
      res.status(404).json({ message: "This email doesn't have in a database." });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    const otpExpiry = new Date(Date.now() + 300 * 1000); // 5 minutes expiry

    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text:  `Your OTP code is: ${otp}\nOTP will expire in 5 minutes`
    };

    // Update the OTP and its expiry in the database
    const updateOtpQuery = 'UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?';
    db.query(updateOtpQuery, [otp, otpExpiry, email], (err) => {
      if (err) {
        console.error("Error updating OTP in database:", err);
        return res.status(500).json({ error: "Failed to update OTP." });
      }

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Failed to send OTP email." });
        }
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: "OTP sent successfully" });
      });
    });
  });
});

app.post("/verifyOTP", (req, res) => {
  const { email, otp } = req.body;

  const query = 'SELECT otp, otp_expiry FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error querying MySQL:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!results.length) {
      return res.status(404).json({ message: "Email not found." });
    }

    const { otp: storedOtp, otp_expiry } = results[0];

    // Check if OTP matches and is not expired
    if (otp === storedOtp && new Date() < new Date(otp_expiry)) {
      // OTP is valid
      res.status(200).json({ message: "OTP verified successfully!" });
      
      // Optionally, you may want to clear the OTP and expiry after successful verification
      const clearOtpQuery = 'UPDATE users SET otp = NULL, otp_expiry = NULL WHERE email = ?';
      db.query(clearOtpQuery, [email], (err) => {
        if (err) {
          console.error("Error clearing OTP from database:", err);
        }
      });
      
    } else {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
  });
});


  
  


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


/////////// เขียน forgot password