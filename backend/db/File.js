const mongoose = require('mongoose');
const {ObjectId} = require('mongoose').Schema.Types;
const fileSchema = mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        required: true,
        trim: true
      },
      file_path: {
        type: String,
        required: true
      },
      file_mimetype: {
        type: String,
        required: true
      },
      uploadedUnder: {
        type: String,
        required: true,
      },
      uploadedBy:{
        type: ObjectId,
        ref: 'users',
      }
    },
    {
      timestamps: true
    }
  );
  
  const File = mongoose.model('File', fileSchema);
  
  module.exports = File;