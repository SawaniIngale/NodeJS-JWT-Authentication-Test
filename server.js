const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');

const secretKey = 'My secret key';

const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    {
        id: 1,
        username: 'Rachael',
        password: '123'
    },
    {
        id: 2,
        username: 'Monica',
        password: '456'
    }
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization');
    next();
});

app.get('/', (req,res) =>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login', (req, res) => {
    const {username, password} = req.body;
    for(let user of users){
        if (username == user.username && password == user.password){
            let token = jwt.sign({id: user.id, username: user.username}, secretKey, {expiresIn: '3m'});
            res.json({
                success: true,
                err: null,
                token
            });
            break;
        }
        else{
            res.status(401).json({
                success: false,
                token:null,
                err: 'Username or password incorrect!'
            });
        }
    }
});

app.get('/api/dashboard', jwtMW, (req,res) => {
    console.log(req);
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see.'
    });
});

app.get('/api/settings', jwtMW, (req,res) => {
    console.log(req);
    res.json({
        success: true,
        myContent: 'This setting page is only seen when the user is logged in!'
    });
});

app.use(function(err, req, res, next){
    // console.log(err.name === 'UnauthorizedError');
    // console.log(err);
    if (err.name === 'UnauthorizedError'){
        res.status(401).json({
            success: false,
            officialerr: err,
            err: 'Username or password incorrect 2!'
        });
    }
    else{
        next(err);
    }
});

app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
});