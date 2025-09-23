import { Router } from 'express';
import { query, insert } from '../db.js'
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
        res.status(500).json({
            success: false,
            message: 'Database error'
        });
    }
});

//login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }


});

//logout
router.post('/logout', (req, res) => {

});


export default router;