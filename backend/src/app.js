import express from 'express';

import apiRoutes from './routes/index.js';

const app = express();

app.use(express.json());
app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something broke'});
});

app.get('/', (req, res) => {
    res.send('Hello!!!');
});

export default app;