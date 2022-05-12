const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Category = require('../models/Category');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('site/index');
})


router.get('/blog', (req, res) => {

    const postPerPage = 3;
    const page = req.query.page || 1;

    Post.find({}).populate({path: 'author', model: User}).sort({$natural: -1})
    .skip((postPerPage * page) - postPerPage)
    .limit(postPerPage)
    .lean().then(posts => {

        Post.countDocuments().then(postCount => {
            Category.aggregate([
                {
                    $lookup: {
                        from: 'posts',
                        localField: '_id',
                        foreignField: 'category',
                        as: 'posts'
                    },
                },
    
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            num_of_posts: {$size: '$posts'}
                        }
                    }
            ]).then(categories => {
                console.log(...categories);
                res.render('site/blog', {
                    posts: posts,
                    categories: categories,
                    current: parseInt(page),
                    pages: Math.ceil(postCount/postPerPage)})
            })
        })
        
    });
})

router.get('/contact', (req, res) => { 
    res.render('site/contact');
})

module.exports = router;
