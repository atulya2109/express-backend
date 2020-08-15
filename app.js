const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
// const session = require('express-session');
// const passport = require('passport');
// const expressValidator = require('express-validator');

/*  The default server-side session storage, MemoryStore, is purposely not designed for a production environment. 
    It will leak memory under most conditions, does not scale past a single process, and is meant for debugging and developing.
    For a list of stores, see http://expressjs.com/en/resources/middleware/session.html#compatible-session-stores
*/

// Models & Routes

const app = express();

require('./models/Users')


const errorHandler = require('errorhandler');

require('dotenv').config();

const {
    port = 5000,
    node_env = 'development',
    atlas_uri,
    secret,
} = process.env;

const isProduction = node_env === 'production';

mongoose.Promise= global.Promise;

mongoose.connect(atlas_uri, {useNewUrlParser : true, useCreateIndex : true, useUnifiedTopology: true});
mongoose.set('debug',true);
const connection = mongoose.connection


if(!isProduction)
{
    app.use(errorHandler());
}

app.use(cors());
app.use(require('morgan')('dev'));
app.use(express.json());

if(!isProduction)
{
    app.use((err,req,res,next) => {
        
        res.status(err.status || 500);

        res.json({
            errors: {
                message: err.message,
                error: err
            }
        });
    });
}
else
{
    app.use((err,req,res,next) => {
        
        res.status(err.status || 500);
    
        res.json({
            errors: {
                message: err.message,
                error: {}
            }
        });
    });
}

app.use(require('./routes'));

connection.once('open', () => {
    console.log('MongoDB Database Connection Established Succesfully');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});