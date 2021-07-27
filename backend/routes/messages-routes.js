const express = require('express');
const router =express.Router();
// const User = require('../db/User')
// const Conversation = require('../db/Conversation');
const Message = require('../db/Message');

//add
router.post("/", async (req,res)=>{
    const newMessage = new Message(req.body);
    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (error) {
        res.status(500).json(error)
    }
})
//get
router.get("/:conversationId", async (req,res)=>{
    try {
        const messages = await Message.find({
            conversationId : req.params.conversationId,
        })
        //console.log(messages);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router;