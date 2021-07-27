const express = require('express');
const router =express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const File = require('../db/File');
const roles = require('../db/enum_role');
const mongoose = require('mongoose');


//1000-s 1001-invcred/unauth 1002-server 1003-invalidurl

router.get('/getfiles/:cell', async(req, res)=>{
    try{
        //check for authorization.
        const user = req.user;
        if(!user)
            return res.json({message: "Unauthorized access", response_status: 1001});
        
        const cell = req.params.cell.trim() || 'undefined';

        if(!Object.values(roles).includes(cell))
            return res.json({message: "Bad url paramter " +cell , response_status: 10002});
        
        if(!user.role.includes(cell))
            return res.json({message: "Unauthorized Access", response_status: 1001});
        
        
        const filesList = await File.find({uploadedUnder: cell}).populate('uploadedBy','email');

        await delay(1500);

        return res.json({response_status: 1000, response_data: filesList})
    }
    catch(err){
        console.log(err);
        res.json({message: "Internal server error", response_status: 10002});
    }

});

const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(null, './files');
      },
      filename(req, file, cb) {
        cb(null, `${new Date().getTime()}_${file.originalname}`);
      }
    }),
    limits: {
      fileSize: 10000000 // max file size 10MB = 1000000 bytes
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx|xlsx|xls|csv|txt|pptx)$/)) {
        return cb(
          new Error(
            'only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls, csv, txt. pptx format.'
          )
        );
      }
      cb(undefined, true); // continue with upload
    }
  });

router.post('/uploadfile', upload.single('file'),async(req, res)=>{
    try{

        const user = req.user;
        if(!user)
            return res.json({message: "Unauthorized access", response_status: 1001});
        
        const {title, description, uploadedUnder} = req.body;
        const { path, mimetype} = req.file;

        if(!user.role.includes(uploadedUnder.trim()))
            return res.json({message: "Unauthorized Cell Access", response_status: 1001});

        const file = new File({
            title,
            description,
            file_path: path,
            file_mimetype: mimetype,
            uploadedUnder,
            uploadedBy: user._id
        });
        const savedFile = await file.save();
        savedFile.uploadedBy = {_id: user._id, email: user.email};

        await delay(500);

        return res.json({response_status: 1000, response_data: savedFile});
    }catch(err){
        console.log(err.message);
        res.json({message: err.message, response_status: 1002});
    }
});

router.post('/deletefile', async (req, res)=>{
    try{
        const user = req.user;
        if(!user)
            return res.json({message: "Unauthorized access", response_status: 1001});
        
        const fileId = req.body.id || '';
        if(!mongoose.isValidObjectId(fileId))
            return res.json({response_status: 1002, message: "Invalid id"});

        const file = await File.findById({_id: fileId});
        
        if(!user.role.includes(file.uploadedUnder.trim()))
            return res.json({message: "Unauthorized Cell Access", response_status: 1001});

       await File.findByIdAndDelete({_id: fileId});

       //TODO: move deleted file to different folder('files_deleted)
       //TODO: Save deleting user info in database including file.
       //In case of recovery it will be used.

        return res.json({response_status: 1000, message: 'Deleted'});
    }catch(err){
        console.log(err);
        res.json({message: "Internal server error", response_status: 1002});
    }
});


router.post('/downloadfile', async (req, res)=>{
    try{
        
       const user = req.user;
        
        if(!user)
            return res.json({message: "Unauthorized access", response_status: 1001});
        
        const fileId = req.body.id || '';
        if(!mongoose.isValidObjectId(fileId))
            return res.json({response_status: 1002, message: "Invalid id"});

        const file = await File.findById({_id: fileId});
        
        if(!user.role.includes(file.uploadedUnder.trim()))
            return res.json({message: "Unauthorized Cell Access", response_status: 1001});

        const fileExists = async path => !!(await fs.promises.stat(path).catch(e => false));

        if(await fileExists(path.join(__dirname, '..', file.file_path)))
            return res.download(path.join(__dirname, '..', file.file_path), 'download', (err)=>{console.log('Error sending file',err?.message)});
        else
            return res.json({response_status: 1002, message: "file not found"});

    }catch(err){
        console.log(err);
        res.json({message: "Internal server error", response_status: 1002});
    }
});

router.get('/getrecentfiles/:requestType', async(req,res)=>{
    try{
        //check for authorization.
        const user = req.user;
        if(!user)
            return res.json({message: "Unauthorized access", response_status: 1001});
        
        const requestType = req.params.requestType.trim() || 'undefined';

        if(!["myRecent", "all"].includes(requestType))
            return res.json({message: "Bad url paramter " + requestType , response_status: 10002});
        
        if(requestType === 'all'){
            const accesibleCell = req.user.role;
        
            const filesList = await File.find({uploadedUnder: accesibleCell}).limit(15).populate('uploadedBy','email');
            await delay(1500);
            return res.json({response_status: 1000, response_data: filesList})
        }else if(requestType === 'myRecent'){
            const filesList = await File.find({uploadedBy: user._id}).limit(10).populate('uploadedBy', 'email');
            await delay(1500);
            return res.json({response_status: 1000, response_data: filesList}) 
        }else{
            await delay(1500);
            return res.json({response_status: 1001, message: 'Bad url paramter 1'});
        }
    }
    catch(err){
        console.log(err);
        res.json({message: "Internal server error", response_status: 10002});
    }

});

module.exports = router;