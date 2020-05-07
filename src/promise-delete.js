require('./db/mongoose')
const Task = require('./models/task')

const deleteTask = async (id) => {
    const task = await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({ completed: false })
    return count
}

// Task.findByIdAndDelete('5e9eaf5ddad0605470d3cb83').then(() => {
//     return Task.countDocuments({ completed: false })
// }).then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log(error)
// })

deleteTask('5e9eaf5ddad0605470d3cb83').then((result) => {
    console.log(result)
}).catch((error) => {
    console.log(error)
})