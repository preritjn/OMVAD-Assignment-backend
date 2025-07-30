const Router = require('express')
const jwt = require('jsonwebtoken')
const zod = require('zod')
const { User } = require('../db/index')

const bcrypt = require('bcrypt')
const saltRounds = 10

const router = Router()

const userDataSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(4, { message: 'Password must be at least 4 characters long' })
})

router.post('/signup', async (req,res) => {
    const {email, password} = req.body
    try {
      userDataSchema.safeParse(email,password)
    }
    catch(err) {
      return res.status(400).json({message: err})
    }

    const existingUser = await User.findOne({email})
    if(existingUser) {
      return res.status(400).json({message: "User with this email already exists"})
    }

    const hash = bcrypt.hashSync(password, saltRounds)
    try {
      await User.create({email : email,password: hash})
    }
    catch (err) {
      return res.status(500).json({message: 'Internal server error'})
    }
    const token = jwt.sign({ email },process.env.JWT_KEY)
    res.cookie('auth',token,{
      sameSite: 'None',
      secure: true
    })
    return res.status(201).json({
      message: "User Created Succesfully"
    })
})

router.post('/signin', async (req,res) => {
    const {email, password} = req.body
    try {
      userDataSchema.safeParse(email,password)
    }
    catch(err) {
      return res.status(400).json({message: err})
    }
    const user = await User.findOne({email})
    if(!user) {
      return res.status(400).json({message: "User with this email does not exist"})
    }
    const isValidPassword = bcrypt.compareSync(password,user.password)
    if(isValidPassword) {
      const token = jwt.sign({ email },process.env.JWT_KEY)
      res.cookie('auth',token,{
        sameSite: 'None',
        secure: true
      })
      return res.status(200).json({
        message : "Signed in Successfully"
      })
    }
    else {
      return res.status(400).json({message: "Invalid password"})
    }
})

router.post('/signout', (req,res) => {
  res.clearCookie('auth')
  return res.status(200).json({message: "Signed out Successfully"})
})

module.exports = router