const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user');
const Product = require('./models/product');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const cors = require("cors");
const csv=require('csvtojson');


const JWT_SECRET = 'ksdvwelknfjhfd9*#U@(NNjndsjqnefibwidbciapwuwr02e$'      //Secret Key
const app = express();


//Database
const dbURI = 'mongodb+srv://hello:hello123@cluster0.8majwtw.mongodb.net/wobot?retryWrites=true&w=majority'; 
mongoose.connect(dbURI)
    .then((result) => console.log('connected to db'))
    .catch((err) => console.log(err)); 



//Middlewares:
app.use(express.static('public'));
app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true })); 
app.listen(8000);
app.use(bodyParser.json())      //Middleware to decode the body that is coming in
app.use(cors("*")) ; 



app.get('/', (req, res) => {
    res.render('index');
});


//Signup
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/api/signup', async (req, res) => {
    const {firstName, lastName, username, password: plainTextPassword} = req.body
   
    if(!firstName || typeof firstName !== 'string') {
        return res.json({ status: 'error', error: 'Invalid Name' })
    }
    if(!lastName || typeof lastName !== 'string') {
        return res.json({ status: 'error', error: 'Invalid Name' })
    }
    if(!username || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Invalid Email' })
    }
    if(!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid Password' })
    }
    if(plainTextPassword.length < 4) {
        return res.json({ status: 'error', error: 'Password to small. Should be atleast 4 characters' })
    }

    const password = await bcrypt.hash(plainTextPassword, 10)

    try {
        const response = await User.create({
            firstName,
            lastName,
            username,
            password
        })
        console.log('User created successfully: ', response)
    }   catch (error) {
            if(error.code === 11000){       //error 11000 -> duplicate key error
                return res.json({ status: 'error', error: 'Username already in use' })
            }
        throw error         //Some other error
    }

    res.json({ status: 'ok' })
});



//Login
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/api/login',  async (req, res) => {
    const { username, password } = req.body
    
    const user = await User.findOne({ username }).lean()
    
    if (!user) {
        return res.json({ status: 'error', error: "Invalid username/password!"})
    }

    if (await bcrypt.compare(password, user.password)){

        const token = jwt.sign({
                id: user._id,
                username: user.username
            },  
            JWT_SECRET
        )

        return res.json({ status: 'ok', data: token })
    }
    res.json({ status: 'error', error: "Invalid username/password!"})
});



//Adding Products manually:
app.get('/addproducts', (req, res) => {
    res.render('addProducts');
});

//Converting Csv file to Json and storing it in database:
app.post('/api/addproducts', async(req,res) => {
    
    csv()
        .fromFile("products.csv")
        .then(csvData => {
            console.log(csvData);
            Product.insertMany(csvData).then(function (){
                console.log("Data Inserted!")
                return res.json({ status: 'ok', data: csvData});
            }).catch(function (error) {
                console.log(error)
            });

        });
});


//Fetching all products in Json format:
app.get('/products', (req, res, next) => {
    Product.find()
    .then(result=>{
        res.status(200).json({
            result
        });
    })
    console.log(result)
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
})