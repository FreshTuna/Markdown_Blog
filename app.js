if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose')
const nunjucks = require('nunjucks');
const Post = require('./models/posts')
const postRouter = require('./routes/posts');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const app = express()

app.use(bodyParser.urlencoded({extended:true}))

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
})

app.set('view engine','ejs');


app.use(express.urlencoded({ extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(methodOverride('_method'))

app.get('/', async (req,res) => {
    const posts = await Post.find().sort({
        createdAt: 'desc'
    })
    res.render('posts/index', {posts: posts})
})
app.use('/posts',postRouter)

app.get('/login',(req,res)=>{
    res.render('login.ejs')
})

app.post('/login',(req,res,next)=>{
    console.log(req.body.email)
    console.log(req.body.Password)
    next()
},
 passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash: true
}))


app.get('/register',(req,res) =>{
    res.render('register.ejs')
})

app.post('/register', async (req,res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.Password, 10)
        users.push({
            id:Date.now().toString(),
            email:req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    }
    catch(e){
        console.log(e)
        res.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})
  
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/login')
}
  
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
}

app.listen(5000)