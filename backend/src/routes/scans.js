import { Router } from 'express';
const router = Router();

//save scan
router.post('/save', (req, res) => {

});

//discard scan
router.post('/save', (req, res) => {

});

//load  scan
router.post('/save', (req, res) => {

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