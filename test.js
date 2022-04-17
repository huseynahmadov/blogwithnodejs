const mongoose = require('mongoose');
const Post = require('./models/Post');
mongoose.connect('mongodb://localhost/nodeblog_test_db');

// Post.create({
//     title: 'My second Post Title',
//     content: 'Lorem ipsum dolor sit amet.'
// }, (error, post) => {
//     console.log(error, post);
// })

// Post.find({ }, (err,post) => console.log(err,post))

// Post.findByIdAndUpdate('6251eca5c80079d7e5767063', {
//     title: 'Menim ikinci Post Bashligim'
// }, (err,post) => console.log(err,post))

Post.findByIdAndDelete('6251eca5c80079d7e5767063', (err,post)=> console.log(err,post))