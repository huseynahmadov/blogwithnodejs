const express = require('express');
const  path  = require('path');
const router = express.Router();
const Category = require('../../models/Category');
const Post = require('../../models/Post');

router.get('/', (req, res) => {
    res.render('admin/index');
})

router.get('/categories', (req, res) => {
    Category.find({}).sort({$natural: -1}).lean().then(categories => {
        res.render('admin/categories', {categories: categories})

    })
})

router.post('/categories', (req, res) => {
    Category.create(req.body, (err, category) => {
        if(!err)
            res.redirect('categories')
    })
})

router.delete('/categories/:id', (req, res) => {
    
    Category.deleteOne({_id: req.params.id}).then(() => res.redirect('/admin/categories'))
})

router.get('/posts', (req, res) => {

    Post.find({}).populate({path: 'category', model: Category}).sort({$natural: -1}).lean().then(posts => {
        res.render('admin/posts', {posts: posts})
    });
})

router.delete('/posts/:id', (req, res) => {
    
    Post.deleteOne({_id: req.params.id}).then(() => res.redirect('/admin/posts'))
})

router.get('/posts/edit/:id', (req, res) => {

    Post.findOne({_id: req.params.id}).lean().then(post => {
        Category.find({}).lean().then(categories => {
            res.render('admin/editpost', {post:post, categories:categories})
        })
    })
})

router.put('/posts/:id', (req, res) => {
    let post_image = req.files.post_image;
    post_image.mv(path.resolve(__dirname, '../../frontside/img/postImages', post_image.name));
    Post.findOne({_id: req.params.id}).lean().then(async post => {
        let posts = new Post;
        posts.title = req.body.title;
        posts.content = req.body.content;
        posts.date = req.body.date;
        posts.category = req.body.category;
        posts.post_image = `/img/postImages/${post_image.name}`;

        post = await posts.save()
        res.redirect('/admin/posts') // true
            
    })
})

module.exports = router;