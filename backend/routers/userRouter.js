import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel';
import { generateToken, isAuth } from '../utils';

const userRouter = express.Router();

userRouter.get('/createadmin', expressAsyncHandler (async(req, res) => {
    try{
        const user = new User({
            name: 'admin',
            email: 'admin@example.com',
            password: 'jmd',
            isAdmin: true,

        });
        const createdUser = await user.save();
        res.send(createdUser);
    } catch (err) {
        res.status(500).send({ message : err.message });
    }
}));
userRouter.post('/signin', expressAsyncHandler (async (req, res) => {
    const signinUser = await User.findOne({
        email: req.body.email,
        password: req.body.password,

    });
    if(!signinUser){
        res.status(401).send({
            message:'Invalid Email or Password',
        });
    } else {
        res.send({
            // eslint-disable-next-line no-underscore-dangle
            _id: signinUser._id,
            name: signinUser.name,
            email:signinUser.email,
            isAdmin: signinUser.isAdmin,
            token: generateToken(signinUser),
        })
    }
}));
export default userRouter;

userRouter.post('/register', expressAsyncHandler (async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,

    });
    const createdUser = await user.save();
    if(!createdUser){
        res.status(401).send({
            message:'Invalid User data',
        });
    } else {
        res.send({
            // eslint-disable-next-line no-underscore-dangle
            _id: createdUser._id,
            name: createdUser.name,
            email:createdUser.email,
            isAdmin: createdUser.isAdmin,
            token: generateToken(createdUser),
        })
    }
}));

userRouter.put('/:id', isAuth, expressAsyncHandler (async (req, res) => {
    const user = await User.findById(req.params.id);

    if(!user){
        res.status(401).send({
            message:'User not Found',
        });
    } else {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.password = req.body.password || user.password;
        const updatedUser = await user.save();
        res.send({
            // eslint-disable-next-line no-underscore-dangle
            _id: updatedUser._id,
            name: updatedUser.name,
            email:updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser),
        })
    }
}));
