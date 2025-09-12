import express from 'express';

import apiRouter from './routes/index.js';

const app = express();

app.use(express.json());
app.use('/api', apiRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something broke'});
});

app.get('/', (req, res) => {
    res.send('Hello!!!');
});

export default app;