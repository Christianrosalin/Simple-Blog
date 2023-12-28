const express = require('express')
const router = express.Router()

router.get('/newArticles', (req, res) => {
    res.render('articles/newArticles')
})

module.exports = router