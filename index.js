"use strict"
require('dotenv').config();
const express = require('express');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const generateRoute = require('./routes/generate');

app.use(helmet());
app.use(cors());
app.use(generateRoute);

app.listen(process.env.PORT || 3000);