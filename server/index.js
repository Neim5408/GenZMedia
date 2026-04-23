const express = require('express');
const app = express();
const cors = require('cors');
const pool = require("./db");

//import bcrypt and jwt
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//secret key for JWT
const JWT_SECRET = "secret123"; // nanti bisa pakai .env


//middleware
app.use(cors());
app.use(express.json());


// =======================
// 🔥 REGISTER API (DI SINI)
// =======================
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length !== 0) {
      return res.json("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    res.json(newUser.rows[0]);

  } catch (err) {
    console.error(err.message);
  }
});


// =======================
// 🔐 LOGIN API (DI SINI)
// =======================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.json("User not found");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.json("Wrong password");
    }

    const token = jwt.sign(
      { user: user.rows[0].user_id },
      JWT_SECRET
    );

    res.json({ token });

  } catch (err) {
    console.error(err.message);
  }
});


// =======================
// SERVER
// =======================
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

//ROUTES//

//create a todo
app.post('/todos', async (req, res) => { 
    try {
     const { description } = req.body;
     const newTodo = await pool.query(
         "INSERT INTO todo (description) VALUES($1) RETURNING *", 
         [description]
     );

     res.json(newTodo.rows[0]);
    } catch (err) {
        console.error(err.message);
    }
});

//get all todos
app.get('/todos', async (req, res) => {
    try {
        const allTodos = await pool.query("SELECT * FROM todo");
        res.json(allTodos.rows);
    } catch (err) {
        console.error(err.message);
    }
});

//get a todo
app.get('/todos/:id', async (req, res) => {
    try { 
        const { id } = req.params;
        const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [id]);
        res.json(todo.rows[0]);
    }catch (err) {
        console.error(err.message);
    }

});

//update a todo
app.put('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;
        const updateTodo = await pool.query(
            "UPDATE todo SET description = $1 WHERE todo_id = $2",
            [description, id]
        );
        res.json("Todo was updated!");
    } catch (err) {
        console.error(err.message);
    }
});

//delete a todo
app.delete('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);
        res.json("Todo was deleted!");
    } catch (err) {
        console.error(err.message);
    }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

