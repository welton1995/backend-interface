const express = require('express');
const cors = require('cors');

const routes = require('./routes');
const connection = require('./config/connection');


const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

connection();

app.listen(3333, () => {
  try {
    console.log(`Server running!!!`);
  } catch (error) {
    return console.log(error);
  }
})