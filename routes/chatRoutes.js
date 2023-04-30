const express = require("express");

const Event=require('../model/event');
const mongoose = require('mongoose');
const User = require('../model/user');
const Club = require('../model/club');
const router = express.Router();
const Chat = require('../model/chatModel');
const asyncHandler = require('express-async-handler');






///////////////method to access chat room of 2 persons and create it if it is not found////////////////////////
router.post('/access/:id', asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const Id = req.params.id;
    const user = await User.findOne({ _id: Id });
    if (!userId) {
      console.log(userId);
      console.log(user._id);
      return res.sendStatus(400);
    }
  
    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");
  
    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "fname pic email",
    });
  
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [user._id, userId],
      };
  
      try {
        const createdChat = await Chat.create(chatData);
        const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
          "users",
          "-password"
        );
        res.status(200).json(FullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  }));

  ////////////////get all chats////////////
  router.get('/chats/:id', asyncHandler(async (req, res) => {
    
     const Id = req.params.id;
    const user = await User.findOne({ _id: Id });
    
    try {

      Chat.find({ users: { $elemMatch: { $eq: user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updatedAt: -1 })
        .then(async (results) => {
          results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
          });
          res.status(200).send(results);
        });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }));
  ///////////// group chat creation///////////
  router.post('/group/:id',(async (req, res) => {
     const Id = req.params.id;
    const user = await User.findOne({ _id: Id });
    if (!req.body.users || !req.body.name) {
      return res.status(400).send({ message: "Please fill all the fields" });
    }
  
    const users = req.body.users;
  
    if (users.length < 2) {
      return res.status(400).send("More than 2 users are required to form a group chat");
    }
  
    users.push(user._id);
  
    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: user,
      });
  
      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
  
      res.status(200).json(fullGroupChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }));


///////////////////add user to the groupe///////////

router.put("/addtogroup/:chatId/", async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.body;
  if (!Chat) {
    res.status(404);
    throw new Error("Chat Not Found");
  }
  
  
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});


//////////////delete user from chat///////////


router.put("/deletefromgroup/:chatId/", async (req, res) => {
  const { chatId } = req.params;
  const { userId } = req.body;
  if (!Chat) {
    res.status(404);
    throw new Error("Chat Not Found");
  }
  
  
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});


  
  






module.exports = router;