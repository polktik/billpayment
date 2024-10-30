const express = require('express')
const bodyParser = require('body-parser');
const { application } = require('express');
const bcrypt = require('bcrypt');
var mysql = require('mysql2');
const cors = require('cors');
const nodemailer = require('nodemailer'); 
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment');

require("dotenv").config();

const app = express();
const port = 3309;
const upload = multer({ dest: 'uploads/' }); // Directory for storing uploaded files
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

// เชื่อมต่อกับ MySQL
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
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

// Function to send an email notification
function sendNotificationEmail(toEmail, subject, message) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Helper function to check if a reminder is due today or two days before the `bill_date`
function isReminderDue(billDate, frequencyType) {
  const today = moment();
  const twoDaysBefore = moment(billDate).subtract(2, 'days');
  const billDay = parseInt(billDate); // For Monthly frequency

  if (frequencyType === 'Monthly') {
    // Check if today is the due day or two days before the due day
    return today.date() === billDay || today.isSame(twoDaysBefore, 'day');
  } else if (frequencyType === 'Once') {
    const billMoment = moment(billDate, 'YYYY-MM-DD');
    // Check if today is the due day or two days before the due date
    return today.isSame(billMoment, 'day') || today.isSame(twoDaysBefore, 'day');
  } else if (frequencyType === 'Weekly') {
    // Check if today is the same weekday or two days before the specified weekday
    return today.format('dddd') === billDate || today.isSame(twoDaysBefore, 'day');
  }

  return false;
}


// Retrieve bills and user information from the database directly
async function getBillsFromDatabase() {
  return new Promise((resolve, reject) => {
    db.query(`
      SELECT 
        users.user_id, 
        users.user_name, 
        users.email, 
        bills.bill_name, 
        bills.bill_date, 
        bills.frequency_type, 
        bills.status 
      FROM bills
      INNER JOIN users ON bills.user_id = users.user_id
      WHERE bills.status = 'Unpaid'
    `, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
}

// Check and send notifications based on bill data
async function processBillReminders() {
  try {
    const bills = await getBillsFromDatabase();

    bills.forEach((bill) => {
      const { user_id, user_name, email, bill_name, bill_date, frequency_type, status } = bill;

      if (status === 'Unpaid' && isReminderDue(bill_date, frequency_type)) {
        const subject = `Reminder: ${bill_name} is due soon`;
        const message = `Dear ${user_name}, your bill "${bill_name}" is due soon. Please ensure timely payment.`;
        sendNotificationEmail(email, subject, message);
      }
    });
  } catch (error) {
    console.error("Error processing reminders:", error);
  }
}

// Schedule task to run daily at 1:00 PM
cron.schedule('0 13 * * *', async () => {
  console.log("Running daily reminder check...");
  await processBillReminders();
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

      const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const log = "INSERT INTO notification_logs (action, bill_name, bill_type, provider, number_or_address, timestamp, user_id, status) VALUES ('Delete', ?, ?, ?, ?, ?, ?,?)";
      db.query(log, [name, bill_type, provider, numberORaddress, currentTimestamp, user_id, status], (err, results) => {
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


  const query = "UPDATE bills SET bill_date = ?, status = ? WHERE user_id = ? AND bill_id = ?";
  db.query(query, [date, status, user_id, bill_id], (err, results) => {
      if (err) {
          console.error("Error updating bill data:", err);
          return res.status(500).json({ error: "An error occurred while updating bill data in the database" });
      }

      const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const log = "INSERT INTO notification_logs (action, bill_name, bill_type, provider, number_or_address, timestamp, user_id, status) VALUES ('Update', ?, ?, ?, ?, ?, ?, ?)";
      db.query(log, [name, bill_type, provider, numberORaddress, currentTimestamp, user_id, status], (err, results) => {
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



app.get("/get_user_bills_for_delete", (req,res)=>{
  console.log("data from user",req.query);
  const user_id = req.query.user_id;
  const query = "SELECT bill_id,bill_type, providers, number_or_address, total_payment, frequency_type, bill_name, bill_date, status FROM bills WHERE user_id = ?";
  db.query(query,[user_id],(err,results)=>{
    if(err){
      console.error("Error querying",err);
      return res.status(500).json({error:"An error occoures while getting data from database"});
    }else{
      return res.status(200).json(results);
    }
  });
});

app.get("/get_user_bills_for_update", (req,res)=>{
  console.log("data from user",req.query);
  const user_id = req.query.user_id;
  const query = "SELECT bill_id,bill_type, providers, number_or_address, total_payment, frequency_type, bill_name, bill_date, status FROM bills WHERE user_id = ?";
  db.query(query,[user_id],(err,results)=>{
    if(err){
      console.error("Error querying",err);
      return res.status(500).json({error:"An error occoures while getting data from database"});
    }else{
      return res.status(200).json(results);
    }
  });
});

app.get("/user_profile_data",(req,res)=>{
  console.log("user_id",req.query.user_id);

  const user_id = req.body.user_id;
  const query  = "SELECT first_name, last_name, username, email, profile_pic FROM users WHERE user_id = ?";
  db.query(query,[user_id],(err,results)=>{
    if(err){
      console.error("Error querying data",err);
      return res.status(500).json({error:"An error occoured while getting fata from database"});
    }else{
      return res.status(200).json(results);
    }
  });
}); ////////////// ใช้ useEffect ให้โหลดตอนเปิดหน้า

app.put("/update_profilepics", upload.single('profile_pic'), (req, res) => {
  console.log("data for update pics", req.body);
  
  const user_id = req.body.user_id;
  const pics = req.file ? req.file.path : null; // Get the file path

  if (!pics) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const query = "UPDATE users SET profile_pic = ? WHERE user_id = ?";
  db.query(query, [pics, user_id], (err, results) => {
    if (err) {
      console.error("Error updating data", err);
      return res.status(500).json({ error: "An error occurred while updating data to database" });
    } else {
      return res.status(200).json(results); //////////////// ใช้กับปุ่ม upload profile picture
    }
  });
});


app.get("/get_bill_for_mail_noti",(req,res) => {
  const query = "SELECT * FROM bills";
  db.query(query,(err,results)=>{
    if(err){
      console.error("Error querying bills data");
      return res.status(500).json({error:"An error occoured while updating data to database"});
    }else{
      return res.status(200).json(results);
    }
  })
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


