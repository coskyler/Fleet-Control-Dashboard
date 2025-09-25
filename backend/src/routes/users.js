import { Router } from 'express';
import { query, insert } from '../infra/db.js'
import bcrypt from 'bcrypt';
const router = Router();

//create user
router.post('/create', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const validated = username
            .replace(/[^a-zA-Z0-9 @#\-_.]/g, '') //remove disallowed characters
            .replace(/\s{2,}/g, ' ') //remove multiple spaces
            .trim() //remove leading and trailing spaces
            .slice(0, 50); //limit to 50 chars

    if (validated !== username || validated.length < 3) {
        return res.status(400).json({
            success: false,
            message: 'Invalid username'
        });
    }

    if(password.length > 128) {
        return res.status(400).json({
            success: false,
            message: 'Password cannot be longer than 128 characters'
        });
    };

    if(password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password cannot be less than 8 characters'
        });
    };

    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = await insert('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashed]);

        req.session.username = user.username;
        req.session.userID = user.id;
        
        return res.status(201).json({
            success: true,
            user: {id: user.id, username: user.username }
        });
    } catch (e) {
        if (e.code === '23505') { // unique violation
            return res.status(409).json({
                success: false,
                message: 'Username already exists'
            });
        }
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
});

//login
router.post('/login', async (req, res) => {
    let { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    username = username.trim();

    if (username.length > 50) {
        return res.status(400).json({
            success: false,
            message: 'Username cannot be longer than 50 characters'
        });
    }

    if(password.length > 128) {
        return res.status(400).json({
            success: false,
            message: 'Password cannot be longer than 128 characters'
        });
    };

    try {
        const rows = await query('SELECT id, username, password FROM users WHERE username = $1', [username]);

        const user = rows[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
        }

        req.session.username = user.username;
        req.session.userID = user.id;

        return res.status(200).json({
            success: true,
            user: {id: user.id, username: user.username }
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }

});

//logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ success: false, message: 'Logout failed'});

        res.clearCookie('connect.sid', {
            path: '/',
            secure: true,
            sameSite: 'none',
        });

        res.json({ success: true, message: 'Logged out' });
    });
});

//get info
router.get('/me', (req, res) => {
    if(!req.session || !req.session.userID)
        return res.status(401).json({ success: false, message: 'Not logged in'});

    const unityID = req.session.unityID || '-1';

    return res.json({
        success: true,
        userID: req.session.userID,
        username: req.session.username,
        unityID: unityID
    })
    
});

export default router;