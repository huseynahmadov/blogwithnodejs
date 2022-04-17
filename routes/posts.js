const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const path = require('path');
const Category = require('../models/Category');
const User = require('../models/User');

router.get('/new', (req, res) => {
    if (!req.session.userId) {
        res.redirect('users/login');
    }

    Category.find({}).lean().then(categories => res.render('site/addpost', { categories: categories }))
})


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

router.get("/search", (req, res) => {
    if (req.query.look) {
        const regex = new RegExp(escapeRegex(req.query.look), 'gi');
        Post.find({ "title": regex }).populate({ path: 'author', model: User }).sort({ $natural: -1 }).lean().then(posts => {

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
                        num_of_posts: { $size: '$posts' }
                    }
                }
            ]).then(categories => res.render('site/blog', { posts: posts, categories: categories }))
        });
    }
});

router.get('/category/:categoryId', (req, res) => {
    Post.find({ category: req.params.categoryId }).lean().populate({ path: 'category', model: Category }).populate({ path: 'author', model: User })
        .then(posts => {
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
                        num_of_posts: { $size: '$posts' }
                    }
                }
            ]).then(categories => res.render('site/blog', { posts: posts, categories: categories }))
        })
})


router.get('/:id', (req, res) => {

    Post.findById(req.params.id).populate({ path: 'author', model: User }).lean()
        .then(post => {
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
                        num_of_posts: { $size: '$posts' }
                    }
                }
            ]).
                then(categories => {
                    Post.find({}).populate({ path: 'author', model: User }).sort({ $natural: -1 }).lean().then(posts => {
                        res.render('site/post', { post: post, categories: categories, posts: posts })

                    })
                })
        });
})

router.post('/test', (req, res) => {

    let postImage = req.files.post_image;
    postImage.mv(path.resolve(__dirname, '../frontside/img/postImages', postImage.name))

    Post.create({
        ...req.body,
        post_image: `/img/postImages/${postImage.name}`,
        author: req.session.userId
    });

    req.session.sessionFlash = {
        type: 'alert alert-success',
        message: 'Your post created successfully!'
    }
    res.redirect('/blog');
})

module.exports = router;