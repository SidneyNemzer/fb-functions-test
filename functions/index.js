const functions = require('firebase-functions')
const express = require('express')
const lti = require('ims-lti')

const exerciseRegex = /^\/([^/]+)/

exports.lti = functions.https.onRequest((req, res) => {
  const result = exerciseRegex.exec(req.originalUrl)
  if (result && result[1]) {
    res.send(`You requested ${result[1]}`)
  } else {
    res.status(404).send(`Cannot ${req.method} ${req.originalUrl}`)
  }
})
