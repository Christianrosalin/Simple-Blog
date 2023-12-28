const express = require('express');
const mysql = require('mysql');
const articleRouter = require('./routes/articles');
const { resolveInclude, compile } = require('ejs');
const bodyParser = require('body-parser');
const app = express();

// app.use(express.static(__dirname + '/css'))
app.use('/css', express.static('css'));

app.use(bodyParser.urlencoded({extended: false}));

app.set("view engine", "ejs");

//Create connection

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'nodemysql'
});

//Connect
db.connect((err) =>{
    if(err){
        throw err;
    }
    console.log("Mysql Connected...")
});

// Create Database
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE nodemysql';
    db.query(sql, (err, result) => {
        if(err)
            throw err;
        console.log(result);
        res.send('database created...');

    })
})

// Create Table
app.get('/createpoststable', (req, res) =>{
    let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, title VARCHAR(255), author VARCHAR(255), content VARCHAR(255), PRIMARY KEY (id))';
    db.query(sql, (err, result) => {
        if(err)
            throw err;
            console.log(result);
            res.send('Posts table created...')
    })
})


// Route for form submission or CREATE
app.post('/submit', async (req, res) => {
    try{
        const formData = req.body;

        await saveDataToDatabase(formData);

        res.redirect('/')
    } catch (error){
        console.error(error);
        res.status(500).send('Internal Server Error')
    }
});


// Function to save data to Database
function saveDataToDatabase(formData){
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO posts SET ?';
        db.query(sql, formData, (err, result) => {
            if(err){
                reject(err);
            } else {
                resolve(result);
            }
        })
    })
}

// Route to fetch data from the MySQL and render to HTML page
app.get('/', (req, res) => {

    const sql = 'SELECT * FROM posts'

    db.query(sql, (err, result) => {
        if(err){
            console.error('Error executing query');
            res.status(500).send('Internal Server Error')
        }else{
            res.render('articles/index', {data: result})
            
        }
    })

// res.render("articles/index", { articles: articles });  
});

// READ specific data by id
app.get('/edit/:id', (req, res) => {
    const postId = req.params.id;
    db.query('SELECT * FROM posts WHERE id = ?', [postId], (err, results) => {
        if (err) throw err;
        res.render('articles/edit', { item: results[0] })
    })
})

// UPDATE Data by ID
// app.put('/edit/:id', (req, res) => {
//     const postId = req.params.id;
//     const postData = req.body;

//     db.query('UPDATE posts SET ? WHERE id = ?',
//     [postData, postId], (err, result) => {
//         if (err){
//             console.error('Error updating: ', err.stack);
//             res.status(500).json({ error: 'Internal Server Error' });
//             return;
//         }
//         res.status(200).send('Post Updated Successfully')
//     })
// })


// UPDATE data by id
app.post('/edit/:id', (req, res) => {
    const postId = req.params.id;
    const { title, author, content } = req.body;
    db.query('UPDATE posts SET title = ?, author = ?, content = ? WHERE id = ?', [title, author, content, postId], (err) => {
        if (err) throw err;
        res.redirect('/')
    })
})

// DELETE data by id
app.get('/delete/:id', (req, res) => {
    const postId = req.params.id;
    db.query('DELETE FROM posts WHERE id = ?', [postId], (err) => {
        if (err) throw err;
        res.redirect('/')
    })
})


app.use('/articles', articleRouter)


app.listen('3000', () => {
    console.log("Server started on port 3000")
});