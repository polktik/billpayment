const express = require('express')
const bodyParser = require('body-parser');
const { application } = require('express');
const bcrypt = require('bcrypt');
var mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer'); 
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

require("dotenv").config();

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

const JWT_SECRET = crypto.randomBytes(64).toString('hex');

// เชื่อมต่อกับ MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});


// Middleware for token authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
  });
}





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


// LOGIN
app.post("/login", (req, res) => {
  let request = req.body;
  console.log("frontend data", req.body);
  console.log("data from frontend username", request.username, "password", request.password);

  const query = 'SELECT username, password_hash FROM users WHERE username = ?';

  db.query(query, [request.username], (err, results) => {
      if (err) {
          console.error("Error querying MySQL:", err);
          return res.status(500).json({ error: "Internal Server Error" });
      }

      if (!results.length) {
          console.log("No user found with the provided username");
          return res.status(404).json({ error: "User does not exist" });
      }

      console.log("Data from backend: ", results);
      const passExtract = results[0];
      const hashedPassword = passExtract.password_hash;
      console.log("Query from SQL", hashedPassword);

      bcrypt.compare(request.password, hashedPassword, (err, isMatch) => {
          if (err) {
              console.error("Error comparing password");
              return res.status(500).json({ error: "Internal Server Error" });
          }

          if (isMatch) {
              console.log("Password match");
              const token = jwt.sign({ username: request.username }, JWT_SECRET, { expiresIn: '1h' });
              console.log("toekn",token);
              return res.status(200).json({ success: true, token });
          } else {
              console.log("Password does not match!");
              return res.status(401).json({ success: false, error: "Incorrect password" });
          }
      });
  });
});



// Create a protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
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

app.get("/getuser", (req, res) => {
  const username = req.query.username;
  console.log("username = ",req.query);

  const query = "SELECT user_id FROM users WHERE username = ?";
  db.query(query, [username], (err, results) => {
      if (err) {
          console.error("Error querying:", err);
          return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length > 0) {
          res.json({ user_id: results[0].user_id });
      } else {
          res.status(404).json({ error: "User not found" });
      }
  });
});


/////////////// waiting for front end //////////////user data section////////////

app.get("/notification",(req,res)=>{
  console.log("logs",req.query);
  const user_id = req.query.user_id;
  console.log("user_id =",user_id);
  const query = "SELECT action, bill_name, bill_type, provider, number_or_address, timestamp FROM notification_logs WHERE user_id = ?";
  db.query(query,[user_id],(err,results)=>{
    if(err){
      console.error("error querying");
      return res.status(500).json({error: 'An error occoured while querying database'});
    }else{
      return res.status(200).json(results);
    }
  });
});

app.post("/insert_user_bill", (req, res) => {
  console.log("Input data from user:", req.body);
  
  const user_id = req.body.user_id;
  const bill_type = req.body.type;
  const provider = req.body.provider;
  const numberORaddress = req.body.num;
  const payment = req.body.payment || null;
  const freq = req.body.frequency;
  const name = req.body.name;
  const date = req.body.date;

  const query = "INSERT INTO bills (user_id, bill_type, providers, number_or_address, total_payment, frequency_type, bill_name, bill_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Unpaid')";
  
  db.query(query, [user_id, bill_type, provider, numberORaddress, payment, freq, name, date], (err, results) => {
      if (err) {
          console.error("Error querying:", err);
          return res.status(500).json({ error: "An error occurred while inserting data into the database" });
      }

      const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const logs = "INSERT INTO notification_logs (action, bill_name, bill_type, provider, number_or_address, timestamp, user_id, status) VALUES ('Insert', ?, ?, ?, ?, ?, ?, 'Unpaid')";
      db.query(logs, [name, bill_type, provider, numberORaddress, currentTimestamp, user_id], (err, results) => {
          if (err) {
              console.error("Error querying logs:", err);
              return res.status(500).json({ error: "An error occurred while inserting data into the logs" });
          } 
          console.log("Insert data successfully");
          return res.status(200).json({ success:true });
      });
  });
});

app.get("/get_user_bills", (req,res)=>{
  console.log("data from user",req.query);
  const user_id = req.query.user_id;
  const query = "SELECT bill_type, providers, number_or_address, total_payment, frequency_type, bill_name, bill_date, status FROM bills WHERE user_id = ?";
  db.query(query,[user_id],(err,results)=>{
    if(err){
      console.error("Error querying",err);
      return res.status(500).json({error:"An error occoures while getting data from database"});
    }else{
      return res.status(200).json(results);
    }
  });
});

app.delete("/delete_user_bills", (req, res) => {
  console.log("user_id:", req.body.user_id);
  console.log("bill_id:", req.body.bill_id);
  console.log("delete data from user",req.body);
  
  const user_id = req.body.user_id;
  const bill_id = req.body.bill_id;
  const bill_type = req.body.bill_type;
  const provider = req.body.providers;
  const numberORaddress = req.body.number_or_address;
  const name = req.body.bill_name;
  const status = req.body.status;

  const query = "DELETE FROM bills WHERE user_id = ? AND bill_id = ?";
  db.query(query, [user_id, bill_id], (err, getresult) => {
      if (err) {
          console.error("Error deleting bill data:", err);
          return res.status(500).json({ error: "An error occurred while deleting bill data from the database" });
      }

      const log = "INSERT INTO notification_logs (action, bill_name, bill_type, provider, number_or_address, timestamp, user_id, status) VALUES ('Delete', ?, ?, ?, ?, ?, ?,?)";
      db.query(log, [name, bill_type, provider, numberORaddress, new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }), user_id, status], (err, results) => {
          if (err) {
              console.error("Error inserting logs:", err);
              return res.status(500).json({ error: "An error occurred while inserting data to logs" });
          } else {
              console.log("delete data successfully");
              return res.status(200).json({ message: "Deleted bill data and updated logs successfully" });

          }
      });
  });
});

app.put("/update_user_bills", (req, res) => {
  console.log("user_id:", req.body.user_id);
  console.log("bill_id:", req.body.bill_id);
  console.log("update data from user",req.body);

  const user_id = req.body.user_id;
  const bill_id = req.body.bill_id;
  const bill_type = req.body.bill_type;
  const provider = req.body.providers;
  const numberORaddress = req.body.number_or_address;
  const name = req.body.bill_name;
  const status = req.body.status;
  const date = req.body.bill_date;
  const date_for_logs = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok' });

  const query = "UPDATE bills SET bill_date = ?, status = ? WHERE user_id = ? AND bill_id = ?";
  db.query(query, [date, status, user_id, bill_id], (err, results) => {
      if (err) {
          console.error("Error updating bill data:", err);
          return res.status(500).json({ error: "An error occurred while updating bill data in the database" });
      }

      const log = "INSERT INTO notification_logs (action, bill_name, bill_type, provider, number_or_address, timestamp, user_id, status) VALUES ('Update', ?, ?, ?, ?, ?, ?, ?)";
      db.query(log, [name, bill_type, provider, numberORaddress, date_for_logs, user_id, status], (err, results) => {
          if (err) {
              console.error("Error inserting logs:", err);
              return res.status(500).json({ error: "An error occurred while inserting data to logs" });
          } else {
            console.log("update data successfully");
              return res.status(200).json({ message: "Updated bill data and logged the update successfully" });
          }
      });
  });
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


