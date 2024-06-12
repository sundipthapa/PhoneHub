// const express = require('express');
// const cors = require('cors');
// const session = require('express-session');
// const helmet = require('helmet');
// const cookieParser = require('cookie-parser');
// const morgan = require('morgan');
// const bodyParser = require('body-parser');
// const connectDB = require('./config/db');
// const { notFound, errorHandler } = require('./middleware/errorMiddleware');
// const CryptoJS = require('crypto-js');
// const secret = CryptoJS.lib.WordArray.random(64).toString();
// console.log(secret);



// // Import Routers
// const authRouter = require('./routes/auth');
// const usersRouter = require('./routes/users');
// const categoryRouter = require('./routes/categories');
// const productRouter = require('./routes/products');
// const brainTreeRouter = require('./routes/braintree');
// const orderRouter = require('./routes/orders');
// const customizeRouter = require('./routes/customize');
// const contactusRouter = require('./routes/contactus');

// const app = express();

// // Middleware
// app.use(morgan('dev'));
// app.use(cookieParser());

// app.use(cors({
//   origin: 'http://localhost:3000', // Your frontend URL
//   credentials: true,
// }));

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// app.use(express.static('public'));
// app.use(express.urlencoded({ extended: false }));
// app.use(express.json());

// //session management
// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false, httpOnly: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 } // 1 day
// }));

// // CSRF Protection
// // const csrfProtection = csurf({ cookie: true });
// // Connect to MongoDB
// connectDB();

// // app.use(csrfProtection);
// // app.use((req, res, next) => {
// //   console.log('CSRF Token:', req.csrfToken());
// //   next();
// // });

// // Set Content Security Policy
// app.use(helmet.contentSecurityPolicy({
//   directives: {
//     defaultSrc: ["'self'"],
//     scriptSrc: ["'self'", "'unsafe-inline'", "blob:", "*.braintreegateway.com", "*.braintree-api.com"],
//     // Add other directives as needed
//   },
// }));

// // Set SameSite cookies
// app.use((req, res, next) => {
//   res.cookie('yourCookie', 'value', {
//     httpOnly: true,
//     secure: true, // ensure to use HTTPS
//     sameSite: 'Lax', // or 'Strict' based on your requirements
//   });
//   next();
// });

// // Routes
// // app.get('/get-csrf-token', (req, res) => {
// //   res.json({ csrfToken: req.csrfToken() });
// // });

// app.use('/api/auth', authRouter);
// // app.use('/api',csrfProtection, function (req, res) {
// //   res.send('data is being processed')
// // })
// app.use('/api/user', usersRouter);
// app.use('/api/category', categoryRouter);
// app.use('/api/product', productRouter);
// app.use('/api', brainTreeRouter);
// app.use('/api/order', orderRouter);
// app.use('/api/customize', customizeRouter);
// app.use('/api/contact-us', contactusRouter);


// // Error Handling
// app.use(notFound);
// app.use(errorHandler);

// // Run Server
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const csurf = require('csurf');
const CryptoJS = require('crypto-js');
require('dotenv').config(); // Ensure environment variables are loaded

// Import Routers
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const categoryRouter = require('./routes/categories');
const productRouter = require('./routes/products');
const brainTreeRouter = require('./routes/braintree');
const orderRouter = require('./routes/orders');
const customizeRouter = require('./routes/customize');
const contactusRouter = require('./routes/contactus');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CORS
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
}));


//generating random secret
const secret = CryptoJS.lib.WordArray.random(64).toString();
console.log(secret);

// Session management
app.use(session({
  secret: process.env.SESSION_SECRET, // Ensure SESSION_SECRET is set in your environment variables
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'development', // Set to true in production with HTTPS
    httpOnly: true,
    sameSite: 'Strict', // Or 'Lax' based on your requirements
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// CSRF Protection
// const csrfProtection = csurf({ cookie: true });
// app.use(csrfProtection);

// Set Content Security Policy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "blob:", "*.braintreegateway.com", "*.braintree-api.com"],
    // Add other directives as needed
  },
}));

// Additional security headers
app.use(helmet({
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', usersRouter);
app.use('/api/category', categoryRouter);
app.use('/api/product', productRouter);
app.use('/api', brainTreeRouter);
app.use('/api/order', orderRouter);
app.use('/api/customize', customizeRouter);
app.use('/api/contact-us', contactusRouter);


// Error Handling
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB
connectDB();

// Run Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
