import app from './app.js';

app.get('/', (req, res) => {
    res.send('Hello!!!');
});

app.listen(80, () => console.log("Container listening on port 80!!!"));