const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')

const upload = multer({
    // dest: 'avatar',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {

            cb(new Error('jpg or jpeg or png only'))

        }

        cb(undefined, true)

        //failed
        // cb(new Error('PDF only'))
        //good
        // cd(undefined, true)
        //reject all
        // cb(undefined, false)
    }
})

const router = new express.Router()

router.post('/users', async (req, res) => {

    const user = new User(req.body)

    try {

        const result = await user.save()
        const token = await result.generateAuthToken()
        res.status(201).send({ user: result, token })

    } catch(error) {

        res.status(400).send(error)

    }

})

router.post('/users/login', async (req, res) => {
    try {

        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })

    } catch(error) {

        res.status(400).send()

    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {

        req.user.tokens = req.user.tokens.filter((token) => {
            return req.token !== token.token
        })

        await req.user.save()

        res.send('Logout!!')

    } catch(error) {

        res.status(500).send('logout failed')

    }
})

router.post('/users/logoutAll', auth, async (req, res) => {

    try {

        req.user.tokens = []
        await req.user.save()
        res.send('Logout all user!!')

    } catch(error) {

        res.status(500).send('Logout all user failed!!')

    }

})

router.get('/users/me', auth, async (req, res) => {

    res.send(req.user)

    // try {
    //     const result = await User.find({})
    //     res.send(result)
    // } catch(error) {
    //     res.status(500).send(error)
    // }

})

router.get('/users/:id', async (req, res) => {

    const _id = req.params.id

    try {

        const result = await User.findById(_id)

        if (!result) {

            return res.status(404).send('No such user exist')

        }

        res.send(result)

    } catch(error) {

        res.status(500).send(error)

    }

})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => {

        return allowedUpdates.includes(update)

    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update!!!' })
    }

    // const _id = req.params.id

    try {

        const user = req.user

        // if (!user) {
        //     return res.status(404).send('No Such user exist!!!')
        // }

        updates.forEach((update) => {
            user[update] = req.body[update]
        })

        await user.save()
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        res.send(user)

    } catch(error) {

        res.status(400).send(error)

    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {

        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send('No Such User Exist!!!')
        // }
        await req.user.remove()
        res.send(req.user)

    } catch(error) {

        res.status(500).send(error)

    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp(req.file.buffer).resize({ width:250, height:250 }).png().toBuffer()
    
    req.user.avatar = buffer
    await req.user.save()
    res.send('uploaded')

}, (error, req, res, next) => {

    res.status(400).send({ error: error.message })

})

router.delete('/users/me/avatar', auth, async (req, res) => {

    try {

        req.user.avatar = ''
        await req.user.save()
        res.send('deleted')
        
    } catch(error) {
        console.log(error)

        res.status(500).send('failed')

    }

})

router.get('/users/:id/avatar', async (req, res) => {

    try {

        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error('no such user or avatar exist')
        }

        res.set('Content-Type', 'image.png')
        res.send(user.avatar)

    } catch(error) {
        
        res.status(404).send('failed')

    }

})

module.exports = router