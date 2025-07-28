const express = require('express')
const cors = require('cors')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth')
const functionsRouter = require('./routes/functions')

const app = express()
const port = process.env.PORT || 3000

app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true
  }
))
app.use(cookieParser())
app.use(express.json())
app.use('/auth', authRouter)
app.use('/functions', functionsRouter)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})