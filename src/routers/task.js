const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        const result = await task.save()
        res.status(201).send(result)
    } catch(error) {
        res.status(400).send(error)
    }

})

router.get('/tasks', auth, async (req, res) => {

    const match = {}
    const sort = {}

    if (req.query.completed === 'true' || req.query.completed === 'false') {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const result = await Task.find({owner: req.user._id})
        const result = await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(result.tasks)
    } catch(error) {
        res.status(500).send(error)
    }

})

router.get('/tasks/:id', auth, async (req, res) => {
    
    const _id = req.params.id

    try {

        const result = await Task.findOne({ _id, owner: req.user._id })

        if (!result) {
            return res.status(404).send('No such task exist or you are not the owner')
        }
        res.send(result)
    } catch(error) {
        res.status(500).send(error)
    }

})

router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid update!!!' })
    }

    const _id = req.params.id

    try {

        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send('No Such user exist or you are not the owner')
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()

        res.send(task)

    } catch(error) {

        res.status(400).send(error)

    }
})

router.delete('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id

    try {

        const task = await Task.findOneAndDelete({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send('No Such Task Exist or you are not the owner')
        }

        res.send(task)

    } catch(error) {
        res.status(500).send(error)
    }
})

module.exports = router