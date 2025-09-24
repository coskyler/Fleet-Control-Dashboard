import { Router } from 'express';
import redisClient from '../infra/redis.js'
const router = Router();

//save scan
router.post('/save', (req, res) => {

});

//discard scan
router.post('/discard', (req, res) => {

});

//load  scan
router.get('/load', (req, res) => {

});

//get scans list
router.get('/list', (req, res) => {

});

//get active unityID
router.get('/getUnityID', (req, res) => {
    const unityID = req.session.unityID;
    if(unityID !== undefined) {
        res.send(unityID);
    } else {
        res.send("No mangos");
    }
})

export default router;