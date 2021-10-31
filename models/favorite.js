let mongoose = require('mongoose')
let Schema = mongoose.Schema

let favoriteSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish'
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('Favorites', favoriteSchema)