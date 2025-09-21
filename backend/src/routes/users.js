import { Router } from 'express';
const router = Router();

//create user
router.post('/create', (req, res) => {

});

//get user
router.get('/get/:id', (req, res) => {

});

//update user
router.put('/update/:id', (req, res) => {

});

//delete user
router.delete('/delete/:id', (req, res) => {

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