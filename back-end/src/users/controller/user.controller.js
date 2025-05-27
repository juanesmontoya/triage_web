import User from '../model/user.model.js';
import bcrypt from "bcryptjs";
export const createUser = async (req, res) => {
    try {
        const { fullname, document, email, password } = req.body;
        const user = await User.findOne({ document: document });
        if (user) {
            return res.status(400).json({ 
                ok: false,
                message: 'Document is already registered, please use another one'});
        }
        const emailExists = await User.findOne({ email: email });
        if (emailExists) {
            return res.status(400).json({ 
                ok: false,
                message: 'Email is already registered, please use another one' 
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const createdUser = new User({ 
            fullname: fullname, 
            document: document, 
            email: email, 
            password: hashPassword, 
        });
        await createdUser.save();
        res.status(200).json({ message: "User created successfully ✔️", user:{
            _id: createdUser._id,
            fullname: createdUser.fullname,
            document: createdUser.document,
            email: createdUser.email,
        } });
    } catch (error) {
        console.log("Error: " + error.message);
        return res.status(500).json({ ok: false, message: "Internal server error" });
    }

};

export const loginUser = async (req, res = response) => {
    const { document, password } = req.body;
    try {
        // Buscar usuario por documento
        const user = await User.findOne({ document: document });
        if (!user) {
            return res.status(400).json({ 
                ok: false,
                message: 'Invalid document or password' 
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                ok: false,
                message: 'Invalid document or password' 
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                fullname: user.fullname,
                document: user.document,
                email: user.email,
            }
        });

    } catch (error) {
        console.log("Error: " + error.message);
        return res.status(500).json({ 
            ok: false,
            message: "Internal server error" 
        });
    }
};

/* export const logoutUser = async (req, res = response) => {
    //TODO: Logout usuario y remover JWT token desde cookies
    return res.status(200).json({
        ok: true,
        message: 'User logged out successfully'
    });
}
 */
export const getUser = async (req, res = response) => {
    const { document } = req.body;
    try {
        const user = await User.findOne({ document: document });
        if (!user) {
            return res.status(404).json({ 
                ok: false,
                message: 'User not found' 
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'User found successfully',
            user: {
                _id: user._id,
                fullname: user.fullname,
                document: user.document,
                email: user.email,
            }
        });
    } catch (error) {
        console.log("Error: " + error.message);
        return res.status(500).json({ 
            ok: false,
            message: "Internal server error" 
        });
    }
}