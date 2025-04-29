const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db')
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

//Load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const dentists = require('./routes/dentists');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');
const users = require('./routes/users');

const app = express();

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Prevent http param pollutions
app.use(hpp());

//Enable CORS
const corsOptions = {
    origin: '*',  // Allow all origins for testing
  };
app.use(cors(corsOptions));  // CORS middleware should be above routes

//Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 100,
});

//swagger
const swaggerOptions={
    swaggerDefinition:{
        openapi: '3.0.0',
        info: {
            title: 'Library API',
            version: '1.0.0',
            description: 'A simple Express Dental API'
        },
        servers: [
            {
                url: process.env.HOST + ':' + process.env.PORT + '/api/v1'
            }
        ]
    },
    apis:['./routes/*.js'],
};

const swaggerDocs=swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Mount routers
app.use('/api/v1/dentists', dentists);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);

const PORT = process.env.PORT || 5003;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, 'on ' + process.env.HOST + ":" + PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err,promise) => {
    console.log(`Error: ${err.message}`);
    //Close server & exit process
    server.close(() => process.exit(1));
});