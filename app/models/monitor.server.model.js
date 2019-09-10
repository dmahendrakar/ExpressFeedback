// Invoke 'strict' JavaScript mode
'use strict';
// Load the module dependencies
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// var Log = new Schema({
//     name: String,
//     type: String,
//     size: Number,
//     time: Date
// });

// Configure the 'Log' schema to use getters and virtuals when transforming to JSON
// Log.set('toJSON', {
//     getters: true,
//     virtuals: true
// });

// Create the 'Log' model out of the 'Log' schema
// mongoose.model('Log', Log);