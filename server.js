const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
const base_url = 'https://jsonplaceholder.typicode.com';
const requestPost = axios.get(`${base_url}/posts`);
const requestComment = axios.get(`${base_url}/comments`);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

async function getComment() {
    try {
        return await axios.get(`${base_url}/comments`)
            .then(res => {
                return res.data;
            })
            .catch(err => {
                console.log('Error: ', err.message);
            });

    } catch (error) {
        console.error(error);
    }
}

async function getPost() {
    try {
        return await axios.all([requestPost, requestComment])
            .then(axios.spread((...responses) => {
                const response_posts = responses[0].data;
                const response_comments = responses[1].data;
                let data = [];
                for (post of response_posts) {
                    var arr = response_comments.filter(x => x.postId == post.id);

                    let new_post = {
                        'post_id': post.id,
                        'post_title': post.title,
                        'post_body': post.body,
                        'total_number_of_comments': arr.length,
                    }
                    data.push(new_post);
                }
                return data;
            }))
            .catch(err => {
                console.log('Error: ', err.message);
            });

    } catch (error) {
        console.error(error);
    }
}

app.get('/', (req, res) => {
    res.write("Hello Node JS");
    res.end();
})

app.get('/post', (req, res) => {
    getPost()
        .then(res1 => {
            res.json(res1)
            res.end();
        })
        .catch(err => {
            console.log('Error: ', err.message);
        });
})

app.post('/comment', (req, res) => {
    getComment()
        .then(res1 => {
            var data;
            let params = req.body;
            if (!Object.keys(params).length) {
                data = res1;
            } else {
                data = res1.filter(function(x) {
                    return Object.keys(params).every(filter => {
                        if (filter == 'name' || filter == 'email' || filter == 'body') {
                            return x[filter].includes(params[filter]);
                        }
                        return params[filter] == x[filter];
                    });
                });

            }
            res.json(data)
            res.end();
        })
        .catch(err => {
            console.log('Error: ', err.message);
        });
})

app.listen(3000)