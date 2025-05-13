import { response } from 'express';
import User from '../model/user.model.js';

export const createUser = async (req, res = response) => {
    const { fullname, document, email, password } = req.body;
    try {

        let user = new User({ fullname, document, email, password });

        const userExists = await User.findOne({ document: document });
        if (userExists) {
            return res.status(403).json({ 
                ok: false,
                message: 'Document is already registered, please use another one' 
            });
        }

        const emailExists = await User.findOne({ email: email });
        if (emailExists) {
            return res.status(403).json({ 
                ok: false,
                message: 'Email is already registered, please use another one' 
            });
        }

        await user.save();

        return res.status(201).json({
            ok: true,
            message: 'User created successfully',
            user: {
                fullname: user.fullname,
                document: user.document,
                email: user.email,
            }
        });

    } catch (error) {
        
        return res.status(500).json({ message: error.message });

    }
};

export const loginUser = async (req, res = response) => {
    const { document, password } = req.body;
    try {

        const user = await User.findOne({ document: document });
        if (!user) {
            return res.status(403).json({ 
                ok: false,
                message: 'Document not found, please register' 
            });
        }
        if (user.password !== password) {
            return res.status(403).json({ 
                ok: false,
                message: 'Password is incorrect, please try again' 
            });
        }

        //TODO: Generate JWT token and save in cookies

        return res.status(200).json({
            ok: true,
            message: 'User logged in successfully',
            user: {
                fullname: user.fullname,
                document: user.document,
                email: user.email,
            }
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const logoutUser = async (req, res = response) => {
    //TODO: Logout user and remove JWT token from cookies
    return res.status(200).json({
        ok: true,
        message: 'User logged out successfully'
    });
}

export const getUser = async (req, res = response) => {
    const { document} = req.body;
    const user = await User.findOne({ document: document });
    if (!user) {
        return res.status(403).json({ 
            ok: false,
            message: 'User not found' 
        });
    }

    return res.status(200).json({
        ok: true,
        message: 'User found successfully',
        user: {
            id: user._id,
            fullname: user.fullname,
            document: user.document,
            email: user.email,
        }
    });
}