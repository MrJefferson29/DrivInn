const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectDB = require('./connectDB')
const IndexRoute = require('./routes/index')
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')

dotenv.config({ path: './.env' })

const app = express()
connectDB()

// Passport configuration
require('./config/passport')

app.use(express.json())
app.use(morgan("dev"))
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Session configuration for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use('/', IndexRoute)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`)
});