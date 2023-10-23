const mongoose = require('mongoose');
var async = require('async');
const ModelUser = require('../models/usersData.model');
const ModelLink = require('../models/links.model')
const config = require('../config/config');
var randomString = require('randomstring');

exports.fetchData = async function(req,res) {
  let myObjectId = req.user._id;
  let urlData = await ModelLink.findById(myObjectId).lean()
  if(urlData){
    res.status(200).json({
      status:'SUCCESS',
      urlArray:urlData.urlArray,
      toast:''
    })
  }else{
    res.status(200).json({
      status:'FAIL',
      toast:'No data found'
    })
  }
};

exports.deleteData = async function(req,res) {
  let myObjectId = req.user._id;
  let titleId = req.body.titleId;
  let urlArrayToPush = [];

  let result = await ModelLink.findById(myObjectId).lean()
  if(result){
    let urlArray = result.urlArray;
    for(let i = 0; i< urlArray.length;i++){
      if(urlArray[i].titleId !== titleId){
        urlArrayToPush.push(urlArray[i])
      }
    }
    let updateResult = await ModelLink.findOneAndUpdate({assignedUser:myObjectId},{$set:{urlArray:urlArrayToPush}});
    if(updateResult){
      res.status(200).json({
        status:'SUCCESS',
        toast:'link deleted'
      })
    }
  }else{
    res.status(200).json({
      status:'FAIL',
      toast:'link not found'
    })
  }
};

exports.manageData = async function(req,res) {
  let myObjectId = req.user._id;
  let urlData = req.body.urlData;
  let titleId;
  if(req.body.titleId){
    titleId = req.body.titleId
    let result = await ModelLink.findById(myObjectId).lean()
    if(result){
      for(let i = 0;i <result.urlArray.length;i++){
        if(result.urlArray[i].titleId === titleId){
          result.urlArray[i] = urlData;
        }
      }
      let result = await ModelLink.findOneAndModify({assignedUser:myObjectId},{$set:{urlArray:result.urlArray}})
      res.status(200).json({
        status:'SUCCESS',
        toast:'Data modified successfully'
      })
    }
  }else{
    let result = await ModelLink.findOneAndModify({assignedUser:myObjectId},{$push:{urlArray:urlData}})
    if(result){
      res.status(200).json({
        status:'SUCCESS',
        toast:'Data saved successfully'
      })
    }
  }
};
