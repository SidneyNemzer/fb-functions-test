const functions = require('firebase-functions')
const express = require('express')
const lti = require('ims-lti')

const objectListener = (obj, name) => new Proxy(
    obj,
    {
      get: (target, key) => {
        // if (key === 'originalUrl') {
        //   console.log(`(Listener) ${name}.originalUrl == (OVERRIDE) (String) https://us-central1-cloud-functions-test-d64bd.cloudfunctions.net/lti/abcd`)
        //   return 'https://us-central1-cloud-functions-test-d64bd.cloudfunctions.net/lti/abcd'
        // }
        if (typeof target[key] === 'object') {
          console.log(`(Listener) ${name}.${key} == (${typeof target[key]}) ${JSON.stringify(target[key])}`)
        } else {
          console.log(`(Listener) ${name}.${key} == (${typeof target[key]}) ${target[key]}`)
        }
        return target[key]
      }
    }
  )

const consumers = {
  test: 'test'
}

const ltiApp = express()
ltiApp.post('/:exerciseId', (req, res) => {
  console.log('Got a request with the protocol', req.protocol)

  const secret = consumers[req.body.oauth_consumer_key]

  const provider = new lti.Provider(req.body.oauth_consumer_key, secret)
  const customRequest = {
    method: 'POST',
    protocol: 'https',
    originalUrl: 'https://us-central1-cloud-functions-test-d64bd.cloudfunctions.net/lti/abcd',
    //url: 'https://us-central1-cloud-functions-test-d64bd.cloudfunctions.net/lti/abcd',
    headers: {
      host: 'us-central1-cloud-functions-test-d64bd.cloudfunctions.net'
    }
  }

  provider.valid_request(objectListener(Object.assign({}, req, customRequest), 'customRequest'), (error, valid) => {
    if (error) {
      res.status(400).send('Bad request: ' + error)
    } else if (!valid) {
      res.status(400).send('Bad request: ' + provider.body)
    } else {
      res.status(200).send("Here's the good stuff...")
    }
  })
})

exports.lti = functions.https.onRequest(ltiApp)
