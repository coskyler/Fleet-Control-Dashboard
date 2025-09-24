import { Router } from 'express';
import { query, insert } from '../infra/db.js'
import redisClient from '../infra/redis.js'
const router = Router();

//save scan
router.post('/save', async (req, res) => {
    const uid = req.session.userID;
    if(uid === undefined ) return res.status(400).json({ success: false, message: 'Not logged in'});

    const unityID = req.session.unityID;
    if(unityID === undefined ) return res.status(400).json({ success: false, message: 'No scan detected'});

    const scanInfoStr = await redisClient.get('info:' + unityID);
    const scanInfo = scanInfoStr ? JSON.parse(scanInfoStr) : null;
    if(!scanInfo) return res.status(400).json({ success: false, message: 'Scan does not exist'});

    if(scanInfo.owner !== req.sessionID) return res.status(400).json({ success: false, message: "You don't own this scan"});

    const entries = await redisClient.xRange(unityID, "-", "+");
    if(entries.length === 0) return res.status(400).json({ success: false, message: 'Scan has no data'});
    
    let voxels = [];

    let closed = false;

    for(let i = 0; i < entries.length; i++) {
        let msg = JSON.parse(entries[i].message.payload);

        if('closed' in msg) { closed = true; continue; }

        voxels.push(...msg.voxels.x);
        voxels.push(...msg.voxels.y);
        voxels.push(...msg.voxels.z);
    }

    if(!closed) return res.status(400).json({ success: false, message: 'Scan is active'});
    if(voxels.length === 0) return res.status(400).json({ success: false, message: 'Scan is empty'});

    try {
        const scan = await insert('INSERT INTO scans (user_id, name, voxels) VALUES ($1, $2, $3)', [uid, scanInfo.name, voxels]);

        return res.status(201).json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

//discard scan
router.post('/discard', async (req, res) => {
    const unityID = req.session.unityID;
    if(unityID === undefined ) return res.status(400).json({ success: false, message: 'No scan detected'});

    const scanInfoStr = await redisClient.get('info:' + unityID);
    const scanInfo = scanInfoStr ? JSON.parse(scanInfoStr) : null;
    if(!scanInfo) return res.status(400).json({ success: false, message: 'Scan does not exist'});

    if(scanInfo.owner !== req.sessionID) return res.status(400).json({ success: false, message: "You don't own this scan"});

    await redisClient.del('info:' + unityID);
    await redisClient.del(unityID);

    return res.status(400).json({ success: true, message: 'Scan discarded'});
});

//load  scan
router.get('/load/:scan_id', async (req, res) => {
    const raw = req.params.scan_id;
    if (!/^\d+$/.test(raw)) return res.status(400).json({ success: false, message: 'Invalid scan ID'});

    const scan_id = parseInt(raw, 10);

    let uid = req.session.userID;
    if(!uid) uid = -1;

    const { rows } = await pool.query(
        `SELECT scan_id, user_id, name, created_at, voxels, users.username
        FROM scans
        JOIN users ON scans.user_id = users.id
        WHERE scan_id = $1 AND (public = TRUE OR user_id = $2)
        LIMIT 1`,
        [scan_id, uid]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, scan: rows[0] });
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