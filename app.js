const express = require('express');
const mongoose = require('mongoose')
const nunjucks = require('nunjucks');
const Post = require('./models/posts')
const postRouter = require('./routes/posts');
const methodOverride = require('method-override');

const app = express()

mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
})

app.set('view engine','ejs');


app.use(express.urlencoded({ extended: false}))

app.use(methodOverride('_method'))

app.get('/', async (req,res) => {
    const posts = await Post.find().sort({
        createdAt: 'desc'
    })
    res.render('posts/index', {posts: posts})
})
app.use('/posts',postRouter)



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


app.listen(5000)