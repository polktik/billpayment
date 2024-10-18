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
  }
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

// REGISTER
app.post("/register", (req, res) => {
    let request = req.body;
    console.log(request);
    const query = 'SELECT * FROM users WHERE username = ? or email = ?';
    const hRounds = 10;
  
    db.query(query,[request.username,request.email], (err, results) => {
      if (err) {
        console.error("Error querying MySQL:", err);
        res.status(500).json({ error: "Internal Server Error" });

      } else {
        console.log("query from db",results.length);
        console.log(results.body);
        console.log("query username",results.username);
        console.log("query email",results.email);
        if (!results.length) {
          bcrypt.hash(request.password, hRounds, (err, hash) => {
            if (err) {
              console.error("Error hashing password:", err);
              res.status(500).json({ error: "Internal Server Error" });
              return;
            } 

          const insertquery = 'INSERT INTO users (first_name, last_name, username, password_hash, email) VALUES (?, ?, ?, ?, ?)';
          db.query(insertquery,[request.firstname,request.lastname,request.username,hash,request.email], (err, results) => {
            if (err) {
              console.error("Error querying MySQL:", err);
              res.status(500).json({ error: "Internal Server Error" });
            } else {
              console.log("username : " + request.username + " insert Success");
              res.status(200).json({ success: true }); //
            }
          });
        });
        } else {
          console.log(request.username + " has already used");
          res.status(200).json({success:false});
        }
      }
    });
  });


  //LOGIN
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
            console.log("data from backend : ",results)
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
                    res.status(200).json({succes:false});
                }
            });
            
        }
    });
  });


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
      subject: 'OTP verification',
      text: `Bill payment tracking system\nYour OTP code is: ${otp}\nOTP will expire in 5 minutes.\nPlease don't share this code for your secure.`
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
  const otp = req.body.votp;
  console.log("Verification OTP : ",otp)

  const query = 'SELECT otp, otp_expiry FROM users WHERE otp = ?';

  db.query(query, [otp], (err, results) => {
    if (err) {
      console.error("Error querying MySQL:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (!results.length) {
      console.log("Verification denied");
      return res.status(404).json({ message: "Verification denied." });
    }

    const { otp: storedOtp, otp_expiry } = results[0];

    // Check if OTP matches and is not expired
    if (otp === storedOtp && new Date() < new Date(otp_expiry)) {
      // OTP is valid
      res.status(200).json({ message: "OTP verified successfully!" });
      console.log("Verification successifully");
      
      // Optionally, you may want to clear the OTP and expiry after successful verification
      const clearOtpQuery = 'UPDATE users SET otp = NULL, otp_expiry = NULL WHERE otp = ?';
      db.query(clearOtpQuery, [otp], (err) => {
        if (err) {
          console.error("Error clearing OTP from database:", err);
        }
      });
      
    } else {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }
  });
});

app.put("/resetPassword",(req,res)=>{
  const email =req.body.email;
  const password = req.body.resetPassword ;
  console.log(req.body);
  console.log("Email",email);
  console.log("Password to reset",password);
  const hRounds = 10;

  bcrypt.hash(password, hRounds, (err, hash) => {
    if (err) {
      console.error("Error hashing password:", err);
      res.status(500).json({ error: "Internal Server Error" });
      return;
    } 

  const query = "UPDATE users SET password_hash =? where email = ?";
  db.query(query,[hash,email], (err,results) =>{
    if(err){
      console.error("error resetting password");
      return res.status(500).json({ error: 'An error occurred while updating the password.' });
    }else{
      return res.status(200).json({message: "Password reset successfully."});
    }
  });
});
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


/////////// เขียน forgot password