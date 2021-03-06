var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var expressSession = require('express-session')
var nodemailer = require('nodemailer')
var jwt = require('jsonwebtoken')
const cookieSecret = 'HSKAJHD8Sh8sahd87ahs8HASashd8HAHSd8ahsd87hasHSShsa8dhasASHD123vgfh2gvfh21gHG'
const EMAIL_SECRET = 'z5qmXWOvG5PTxDtW5bU3jL98gINgpiHZtep0ZT5K'
var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('env', 'development')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(expressSession({
  secret: cookieSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7200000
  }
}))

const title = 'opusteno.org'

const head = `<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="author" content="qoobes">
    <meta name="description" content="A website to improve communication between students and schools">
    <meta property="og:title" content="Opusteno - talking solves problems">
    <meta name="theme-color" content="#6dc75a">
    <meta name="twitter:description" content="Leading student-school communication forward">
    <meta name="twitter:card" content="summary_medium_image">
    <meta name="twitter:image" content="/img/handshake.png">
    <meta name="twitter:author" content="qoobes#0904">
  
    <title> ${title} </title>
    <link rel="icon" href="img/handshake.png">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic" rel="stylesheet" type="text/css">
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/addition.min.css">
    </head>`

const navbar = `<nav class="navbar navbar-expand-lg bg-secondary text-uppercase fixed-top" id="mainNav">
    <div class="container">
      <a class="navbar-brand js-scroll-trigger" href="#page-top">${title}</a>
      <button class="navbar-toggler navbar-toggler-right text-uppercase font-weight-bold bg-secondary text-white rounded"
        type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive"
        aria-expanded="false" aria-label="Toggle navigation">
         <img src="img/bar-light.png" alt="" width="20px">
      </button>
      <div class="collapse navbar-collapse" id="navbarResponsive">
        <ul class="navbar-nav ml-auto">
          <li class="nav-item mx-0 mx-lg-1">
            <a class="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger" href="/">Pocetna</a>
          </li>
          <li class="nav-item mx-0 mx-lg-1">
            <a class="nav-link py-3 px-0 px-lg-3 rounded js-scroll-trigger" href="about">O Projektu</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>`

const footer = `<div class="container">
                    <small>Copyright &copy; Second gimnasium of Sarajevo • ibmyp</small>
                </div>`

// nodemailer setup

function sendConfirmation (req, res, next) {
  const email = req.session.email
  if (!email) next({ message: 'Desio se problem sa vasim mailom.', status: '403' })
  if (!validateEmail(email)) {
    next({ message: 'Vas token nije validan', status: '403' })
  } else next()
}

function isConfirmed (req, res, next) {
  const confirmed = req.session.verified === undefined ? false : req.session.verified.state
  if (!confirmed) next({ message: 'Vas token nije validan', status: '403' })
  else next()
}

var elements = { title, navbar, head, footer }

function validateEmail (email) {
  const mailHost = email.substring(email.length - 18)
  return mailHost.toLowerCase() === '@2gimnazija.edu.ba'
}

app.get('/', (req, res, next) => {
  req.session.ipAddr = req.connection.remoteAddress
  console.log(req.session.ipAddr)

  res.render('index.ejs', elements)
})

app.get('/verify', (req, res, next) => {
  req.session.verified = {
    state: true,
    email: 'ahmed@2gimnazija.edu.ba'
  }
  res.end()
})

app.post('/form', isConfirmed, (req, res, next) => {
  const email = req.session.verified.email
  console.log(email)
  elements.email = email
  const valid = validateEmail(email)
  const verified = req.session.verified === undefined ? false : req.session.verified.state

  if (valid) {
    if (verified) {
      res.render('form.ejs', elements)
    } else res.render('confirmation.ejs', elements)
  } else next({ message: 'Problem sa verifikacijom', status: '400' })
})

app.get('/form', (req, res, next) => {
  const verified = req.session.verified === undefined ? false : req.session.verified.state
  if (req.session.email) {
    if (verified) {
      res.render('form.ejs', elements)
      res.end()
    } else res.render('confirmation.ejs', elements); res.end()
  } else next({ message: 'Potreban je email', status: '400' }); res.end()
})

app.get('/about', isConfirmed, function (req, res, next) {
  res.render('about.ejs', elements)
  res.end()
})

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = err
  // render the error page

  res.status(err.status || 500)
  res.render('error', elements)
})

module.exports = app
