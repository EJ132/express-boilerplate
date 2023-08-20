require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const mysql = require("mysql");

// Database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Raiders1",
  database: "clicker",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySQL connected...");
});

// Server
const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan(morganOption));
app.use(helmet());
app.use(express.json());

// Create Database
// app.get("/createdb", (req, res) => {
//   let sql = "CREATE DATABASE clicker";
//   db.query(sql, (err, result) => {
//     if (err) throw err;
//     console.log(result);
//     res.send("Database created...");
//   });
// });

// Create Table
// app.get("/createUserTable", (req, res) => {
//   let sql = `CREATE TABLE users(
//               id int AUTO_INCREMENT,
//               username VARCHAR(255),
//               password VARCHAR(255),
//               clicks int,
//               PRIMARY KEY(id))
//             `;

//   db.query(sql, (err, result) => {
//     if (err) throw err;
//     console.log(result);
//     res.send("Users table created...");
//   });
// });

// Get User

app.get("/getUser", (req, res) => {
  let sql = `SELECT * FROM users WHERE username = '${req.query.username}'`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send(
      result.map((user) => {
        return {
          username: user.username,
          clicks: user.clicks,
        };
      })
    );
  });
});

// Register User
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  let checkIfExising = `SELECT * FROM users WHERE username = '${username}'`;
  db.query(checkIfExising, (err, result) => {
    if (err) throw err;
    console.log(result);
    if (result.length > 0) {
      res.send({
        success: false,
        message: "User already exists",
      });
    }
  });

  let sql = `INSERT INTO users (username, password, clicks) VALUES ('${username}', '${password}', 1)`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send({
      success: true,
      message: "User registered",
      username: username,
      clicks: 1,
    });
  });
});

// Login User
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  let sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    if (result.length > 0) {
      res.send({
        success: true,
        message: "User logged in",
        username: username,
        clicks: result[0].clicks,
      });
    } else {
      res.send({
        success: false,
        message: "User not found",
      });
    }
  });
});

app.post("/addClick", (req, res) => {
  const { username } = req.body;

  let sql = `UPDATE users SET clicks = clicks + 1 WHERE username = '${username}'`;
  let sql2 = `SELECT clicks FROM users WHERE username = '${username}'`;

  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
  });

  db.query(sql2, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send({
      success: true,
      message: "Click added",
      clicks: result?.[0]?.clicks,
    });
  });
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
