import { Router } from 'express';
import { query, insert, update } from '../infra/db.js'
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

        console.log(msg);

        if('closed' in msg) { closed = true; continue; }

        for(const v of msg.voxels) {
            voxels.push(v.x);
            voxels.push(v.y);
            voxels.push(v.z);

            console.log('VOXEL INFO:', v);
        }
    }

    console.log(`\nSaving voxels: ${voxels}\n`);

    if(!closed) return res.status(400).json({ success: false, message: 'Scan is active'});
    if(voxels.length === 0) return res.status(400).json({ success: false, message: 'Scan is empty'});

    const scanName = scanInfo.name ? scanInfo.name : 'Untitled Scan';

    try {
        const scan = await insert('INSERT INTO scans (user_id, name, voxels) VALUES ($1, $2, $3)', [uid, scanName, voxels]);
        
        await redisClient.del('info:' + unityID);
        await redisClient.del(unityID);

        console.log(`\nWhat got saved: ${scan.voxels}\n`);

        delete req.session.unityID;

        return res.status(201).json({ success: true, scan_id: scan.scan_id });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});

//discard scan
router.post('/discard', async (req, res) => {
    const unityID = req.session.unityID;
    if(unityID === undefined ) return res.status(400).json({ success: false, message: 'No scan detected'});

    const scanInfoStr = await redisClient.get('info:' + unityID);
    const scanInfo = scanInfoStr ? JSON.parse(scanInfoStr) : null;
    if(!scanInfo) return res.status(400).json({ success: false, message: 'Scan does not exist'});

    if(scanInfo.owner !== req.sessionID) return res.status(403).json({ success: false, message: "You don't own this scan"});

    await redisClient.del('info:' + unityID);
    await redisClient.del(unityID);

    delete req.session.unityID;

    return res.json({ success: true, message: 'Scan discarded'});
});

//load scan
router.get('/load/:scan_id', async (req, res) => {
    const raw = req.params.scan_id;
    if (!/^\d+$/.test(raw)) return res.status(400).json({ success: false, message: 'Invalid scan ID'});

    const scan_id = parseInt(raw, 10);

    let uid = req.session.userID;
    if(!uid) uid = -1;

    try {
        const rows = await query(
            `SELECT scan_id, user_id, name, created_at, voxels, users.username, public
            FROM scans
            JOIN users ON scans.user_id = users.id
            WHERE scan_id = $1 AND (public = TRUE OR user_id = $2)
            LIMIT 1`,
            [scan_id, uid]
        );

        if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });
        return res.json({ success: true, scan: rows[0] });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});

//update visibility
router.put('/update', async (req, res) => {
    const { scanID: rawScanID, visibility } = req.body;
    const uid = req.session.userID;

    if (!/^\d+$/.test(rawScanID)) return res.status(400).json({ success: false, message: 'Invalid scan ID'});

    const scanID = parseInt(rawScanID, 10);

    if(visibility !== true && visibility !== false) return res.status(400).json({ success: false, message: 'Visibility must be a boolean'});

    try {
        const row = await update(
            'UPDATE scans SET "public" = $1 WHERE user_id = $2 AND scan_id = $3',
            [visibility, uid, scanID]
        );
        return res.status(200).json({ success: true, message: 'Visibility updated' });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});

//get scans list
router.get('/list', async (req, res) => {
    let uid = req.session.userID;
    if(!uid) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const rows = await query(
            `SELECT scan_id, name, created_at
            FROM scans
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT 50`,
            [uid]
        );

        return res.json({ success: true, rows: rows });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, message: 'Database error' });
    }
});

export default router;