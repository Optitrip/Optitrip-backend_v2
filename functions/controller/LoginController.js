import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     description: Login user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     superior_account:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       500:
 *         description: Internal server error
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Campos incompletos" });
        }

        const user = await User.findOne({ email }).populate('rol_id');
        
        if (!user || !(password === user.password)) {
            return res.status(401).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            token,
            user: {
                _id: user._id,
                superior_account: user.superior_account,
                email: user.email,
                name: user.name,
                type_user: user.type_user, 
                role: user.rol_id.name
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};