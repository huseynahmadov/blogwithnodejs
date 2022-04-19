const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const {generateDate, limit, truncate, paginate} = require('./helpers/hbs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const dotenv = require('dotenv');

const PORT = process.env.PORT || 5000;
dotenv.config();
mongoose.connect(process.env.MONGO_CONNECT_URL);


app.use(session({
    secret: 'testtest',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: process.env.MONGO_CONNECT_URL})
}))



app.use(fileUpload());
app.use(express.static(path.join(__dirname, 'frontside')));
app.use(methodOverride('_method'));

//handlebars helpers

const hbs = exphbs.create({
    helpers: {
        generateDate: generateDate,
        limit: limit,
        truncate: truncate,
        paginate: paginate
    }
}
    
)

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({extended: false}))

app.use(bodyParser.json());


//DISPLAY LINK Middleware

app.use((req,res,next) => {
    const {userId} = req.session;
    if(userId) {
        res.locals = {
            displayLink: true
        }
    } else {
        res.locals = {
            displayLink: false,
        }
    }
    next();
})

// Flash - Message Middleware
app.use((req, res, next) => {
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
})

const main = require('./routes/main');
const posts = require('./routes/posts');
const users = require('./routes/users');
const admin = require('./routes/admin/index');
const contact = require('./routes/contact');

app.use('/', main);
app.use('/posts', posts);
app.use('/users', users);
app.use('/admin', admin);
app.use('/contact', contact);

app.listen(PORT);