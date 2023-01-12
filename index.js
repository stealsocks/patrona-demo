const express = require('express')
const session = require("express-session")
var md5 = require('md5');
const { v4, stringify  } = require('uuid');
const uuidv4 = v4
var cors = require('cors')
var chroma = require("chroma-js")
var favicon = require('serve-favicon');
const dotenv = require('dotenv');
dotenv.config()
var bodyParser = require("body-parser");
//const db = pgp(connection);
const passport = require("passport");
const path = require('path');

const { createClient } =  require('@supabase/supabase-js')

// const supabaseUrl = 'https://ynqgkienxamzuxeithys.supabase.co'
// const supabaseKey = process.env.SUPABASE_KEY
// const supabase = createClient(supabaseUrl, supabaseKey)

const app = express();
app.use(session({  secret: "cookie_secret",
    resave: true,
    saveUninitialized: true}));

app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors())
app.use(favicon(path.join(__dirname,'public','favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

const port = "3002"
app.set('view engine', 'hbs');
const hbs = require('hbs');
const { getEnabledCategories } = require('trace_events');
const { nextTick } = require('process');
const e = require('express');
hbs.registerPartials(path.join(__dirname, 'views/partials'));

hbs.registerHelper('times', function (n, block) {
    var accum = '';
    for (var i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

//  _______              _________             
// (  ___  )  |\     /|  \__   __/  |\     /|  
// | (   ) |  | )   ( |     ) (     | )   ( |  
// | (___) |  | |   | |     | |     | (___) |  
// |  ___  |  | |   | |     | |     |  ___  |  
// | (   ) |  | |   | |     | |     | (   ) |  
// | )   ( |  | (___) |     | |     | )   ( |  
// |/     \|  (_______)     )_(     |/     \|  
                                                                                                                                                                                              
// const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

// const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID 
// const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// passport.use(new GoogleStrategy({
//     clientID:     GOOGLE_CLIENT_ID,
//     clientSecret: GOOGLE_CLIENT_SECRET,
//     callbackURL: "https://linkbasket.xyz/auth/google/callback",
//     passReqToCallback   : true
//   },
//   function(request, accessToken, refreshToken, profile, done) {
//    return done(null, profile);
//   }
// ));

// passport.serializeUser(function(user, done){
//     done(null, user)
// } )

// passport.deserializeUser(function(user, done){
//     done(null, user)
// } )

//  function isLoggedIn(req, res, next){
//     try{
//     if(req.user) {    
//         res.locals.isLoggedIn = true;
//         res.locals.key =  md5(req.user.email);
//         console.log("User was logged in")

//         next() }

//     else {
//         res.locals.isLoggedIn = false;
//          res.locals.key = false;
//         console.log("User was NOT logged in")
//         next()
//     }
// }
// catch(error){
//     console.log(error)
// }
    
//  }

function isLoggedIn(req, res, next){
    res.locals.key = "thirdwallet"
    res.locals.isLoggedIn = true
    next()
}

// let isLoggedIn = true

// _______    _______              _________   _______    _______ 
// (  ____ )  (  ___  )  |\     /|  \__   __/  (  ____ \  (  ____ \
// | (    )|  | (   ) |  | )   ( |     ) (     | (    \/  | (    \/
// | (____)|  | |   | |  | |   | |     | |     | (__      | (_____ 
// |     __)  | |   | |  | |   | |     | |     |  __)     (_____  )
// | (\ (     | |   | |  | |   | |     | |     | (              ) |
// | ) \ \__  | (___) |  | (___) |     | |     | (____/\  /\____) |
// |/   \__/  (_______)  (_______)     )_(     (_______/  \_______)

app.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] })
)

app.get('/auth/google/callback', passport.authenticate('google', {
    successReturnToOrRedirect: '/new',
    failureRedirect: '/login'

}))


app.get('/', (req, res) => {

   res.render('login')

})

app.get('/login', (req, res) => {

    res.render("login")

})


app.get('/funders', isLoggedIn, async (req, res) => {

    let funders = await getAllUsers()
    funders = Object.values(funders).filter(a => a.thingsBeingFunded.length > 0)
    let isLoggedIn = res.locals.isLoggedIn

    res.render("funders", {
        isLoggedIn: isLoggedIn,
        pageName: "Funders",
        feedObjects: funders
    })
})

app.get("/funders/:username", isLoggedIn, async (req, res) => {

    let username = req.params.username

    let userID = await getuserID(username)

    let userInfo = await getUserInfo(userID)
    userInfo.isLoggedIn = res.locals.isLoggedIn

    for(let ele of userInfo.thingsBeingFunded){
        ele.amountPledged = ele.funderObjects.filter(a => a.userID == userID)[0].totalAmount
    }

    res.render("funder", userInfo)
})

// app.get("/funders/:username/updates", (req, res) => {

//     let username = req.params.username

//     let totalIterations = 25

//     res.render("private/updates", {
//         username: username,
//         userID: 123,
//         totalIterations: totalIterations,
//         feedObjects: [{
//             thingID: 123,
//             thingName: "Cool Thing",
//             thingDoer: "Judah",
//             totalAmount: "$100",
//             updateAmount: "$10",
//             currentIteration: 10,
//             totalIterations: 100,
//             userID: 123,
//             dateOfUpdate: "12/12/2022"
//         }]
//     })
// })


app.get('/doers', isLoggedIn, async (req, res) => {

    let doers = await getAllUsers()
    let isLoggedIn = res.locals.isLoggedIn

    doers = Object.values(doers).filter(a => a.thingsBeingDone.length > 0)

    res.render("doers", {
        isLoggedIn: isLoggedIn,
        pageName: "Doers",
        feedObjects: doers
    })
})

app.get("/doers/:username", isLoggedIn, async (req, res) => {

    let username = req.params.username

    let userID = await getuserID(username)

    let userInfo = await getUserInfo(userID)
    userInfo.isLoggedIn = res.locals.isLoggedIn

    res.render("doer", userInfo)

})

// app.get("/doers/:username/funders", (req, res) => {

//     let username = req.params.username

//     res.render("doersFunders", {
//         username: username
//     })
// })


app.get("/things", isLoggedIn, async (req, res) => {

    let isLoggedIn = res.locals.isLoggedIn

    res.render("things", {
        isLoggedIn: isLoggedIn,
        pageName: "Things",
        feedObjects: await getAllThings()
    })
})

app.get("/things/:id", isLoggedIn, async (req, res) => {

    let thingID = req.params.id
    let userID = res.locals.key
    let isLoggedIn = res.locals.isLoggedIn
    let thingInfo = await getDataForThing(thingID)

    thingInfo.isBeingFunded = false

    if(thingInfo.funders.includes(userID)){
        thingInfo.isBeingFunded = true
    }

    if(thingInfo.doer == userID){
        thingInfo.isUsersThing = true
    }

    res.render("thing", {
        thingInfo: thingInfo,
        isLoggedIn: isLoggedIn
    })
})

app.get("/things/:id/fund", isLoggedIn, async (req, res) => {

    let thingID = req.params.id
    let userID = res.locals.key
    let thingInfo = await getDataForThing(thingID)
    thingInfo.isLoggedIn = res.locals.isLoggedIn

    res.render("private/fund", thingInfo)
})

app.get("/things/:id/defund", isLoggedIn, async (req, res) => {

    try{
        let thingID = req.params.id
        let userID = res.locals.key
        // let userInfo = userDB[userID]

        let thingInfo = await getDataForThing(thingID)
        thingInfo.isLoggedIn = res.locals.isLoggedIn
        console.log(thingInfo.funderObjects)
        console.log(thingInfo.funderObjects.filter(a => a.userID == userID))
        thingInfo.pledgedAmount = thingInfo.funderObjects.filter(a => a.userID == userID)[0].amountLeft

        res.render("private/defund", thingInfo)
    }

    catch(error){
        console.log(error)
        }

})

app.get("/things/:id/update", isLoggedIn, async (req, res) => {

    thingID = req.params.id
    let thingInfo = await getDataForThing(thingID)
    let isLoggedIn = res.locals.isLoggedIn

    let payOut = 0

    for(let ele of thingInfo.funderObjects){
        payOut += ele.payload
    }

    res.render("private/update-thing",
    {isLoggedIn: isLoggedIn,
    thingName: thingInfo.thingName,
    payOut: Math.floor(payOut * 100)/100,
    thingID: thingID,
    currentIteration: thingInfo.completeIterations})
})

app.get("/new", isLoggedIn, async (req, res) => {

    let isLoggedIn = res.locals.isLoggedIn

    res.render("private/new-thing",
        {
            isLoggedIn: isLoggedIn,
        })
})

app.get("/new-profile", isLoggedIn, async (req, res) => {

    let userAlreadyExists = false 
    let isLoggedIn = res.locals.isLoggedIn

    if(userAlreadyExists == true){
        res.redirect("/profile")
    }

    else{
        res.render("private/new-account",
            {
                isLoggedIn: isLoggedIn,
            })
        }
})

app.get('/profile', isLoggedIn, async (req, res) => {

    let userID = res.locals.key
    let isLoggedIn = res.locals.isLoggedIn

    res.render("private/profile", {
        isLoggedIn: isLoggedIn,
        pageName: "My Profile",
        userID: userID,
        userInfo: await getUserInfo(userID),
        updateObjects: await getAllNotificationsForUser(userID)
    })
})





app.post('/profile', isLoggedIn, async (req, res) => {

    let userID = res.locals.key
    let newUsername = req.body.newUsername

    userDB["thirdwallet"].bio = req.body.newBio
    let oldUsername = userDB["thirdwallet"].username
    userDB["thirdwallet"].username = newUsername

    let regex = new RegExp(oldUsername, "g");

    if(oldUsername != newUsername){

        for(let ele of Object.values(thingDB)){
            if(ele.funders.includes(oldUsername) == true){
                funderObject = ele.funderObjects.filter(a => a.userID == userID)[0]
                funderObject.username = newUsername
                ele.funderObjects = ele.funderObjects(a => a.userID!== userID)
                ele.funderObjects.push(funderObject)
            }
        }

        for(let ele of Object.values(updatesDB)){
            if(ele.message.includes(oldUsername)){
                console.log("changing")
                updatesDB[ele.updateID].message = ele.message.replace(regex, newUsername)
            }
        }

        res.json(
            {
                success: true,
                redirect: true
            }
        )
    }

    else{
        res.json(
            {success: true,
            redirect: false}
        )
        }
})

app.post('/new-thing', isLoggedIn, async (req, res) => {

    let thingDetails = req.body
    let userID = res.locals.key
    let rand = Math.floor(Math.random() * 10000)
    let thingID = Math.floor(Math.random() * 100000)
    let date = new Date().toISOString().slice(0, 10)

    updatesDB[rand] = {
        updateType: "addedNewThing",
        thingName: thingDetails.thingName,
        thingID: thingID,
        updateSubscribers: [userID],
        doer: userID,
        timestamp: date,
        updateID: rand,
        message: `You began <a href="/things/${thingID}">${thingDetails.thingName}</a> on ${date}`
    }

    await createNewThing(thingDetails.thingName, thingDetails.thingDescription, userID, thingDetails.thingIterations, thingID)

    res.json(
        { success: true }
    )
})

app.post('/things/:id/update', isLoggedIn, async (req, res) => {

    let rand = Math.floor(Math.random() * 10000)
    let thingID = req.params.id
    console.log(thingID)
    let thingInfo = await getDataForThing(thingID)
    let updateDescription = req.body.updateDescription
    let date = new Date().toISOString().slice(0, 10)
    let currentIteration = thingInfo.completeIterations + 1

    updatesDB[rand] = {
        updateType: "updatedThing",
        updateSubscribers: [thingInfo.doer],
        updateDescription: updateDescription,
        timestamp: date,
        updateID: rand,
        message: `You updated <a href="${thingID}">${thingInfo.thingName}</a> on ${date}`
    }

    genericUpdate = {
        updateType: "paidOut",
        thingName: thingInfo.thingName,
        thingID: thingID,
        timestamp: date
    }

    for (let ele of thingInfo.funderObjects) {
        let r = Math.floor(Math.random() * 10000)

        genericUpdate.updateID = r
        genericUpdate.updateSubscribers = [ele.userID, thingInfo.doer]     
        genericUpdate.message = `Paid ${ele.payload} to <a href="doers/${thingInfo.doerName}">${thingInfo.doerName}</a> on <b>${date}</b> for completing #${currentIteration} of <a href="/things/${thingID}"> ${thingInfo.thingName} </a>`

        updatesDB[r] = genericUpdate
        ele.amountLeft -= ele.payload
       
    }

    thingDB[thingID].completeIterations += 1
    thingDB[thingID].thingUpdates[currentIteration] = { date: date, updateDescription: updateDescription }

    res.json(
        { success: true }
    )
})

app.post('/new-profile', isLoggedIn, async (req, res) => {

    let username = req.body.username
    let key = res.locals.key

    if(usernames.includes(username)){
        return {
            message: "Username already exists",
            success: false
        }
    }

    else{
        usernames.push(username)

        userDB[key] = {
            userID: key,
            username: username,
            thingsBeingFunded: [],
            thingsBeingDone: [],
            totalAmountPledged: 0,
            bio: "An empty bio.",
        }

        res.json(
            { success: true }
        )
    }
})

app.post("/things/:id/fund", isLoggedIn, async (req, res) => {

    console.log(req.body)
    let thingDetails = req.body
    thingDetails.amountAdded = Number(thingDetails.amountAdded)
    let thingID = req.params.id
    let from = thingDetails.fromIteration
    let to = thingDetails.toIteration
    console.log(req.params.id)
    let thingInfo = thingDB[thingID]
    let key = res.locals.key
    let userInfo = await getUserInfo(key)


    thingDB[thingID].funders.push(key)
    
    thingDB[thingID].funderObjects.push(
            { userID: key, username: userInfo.username, totalAmount: thingDetails.amountAdded, amountLeft: thingDetails.amountAdded, from: from, to: to, payload: thingDetails.amountAdded/(to - from)}
        )

    userDB[key].thingsBeingFunded.push(thingID)
    userDB[key].totalAmountPledged += thingDetails.amountAdded

    let rand = Math.floor(Math.random() * 10000)

    updatesDB[rand] = {
        updateID: rand,
        updateType: "fundedThing",
        funder: key,
        funderName: userInfo.username,
        doer: thingInfo.doer,
        doerName: thingInfo.doerName,
        updateSubscribers: [thingInfo.doer, key],
        amountAdded: thingDetails.amountAdded,
        timestamp: "now",
        message: `<a href="/funders/${userInfo.username}">${userInfo.username}</a> pledged $${thingDetails.amountAdded} to <a href="/things/${thingID}">${thingInfo.thingName}</a>.`
    }

    res.json({success: true})
})

app.post("/things/:id/defund", isLoggedIn, async (req, res) => {

    try {
        let thingID = req.params.id
        let key = res.locals.key
        let reason = req.body.reason
        let thingInfo = thingDB[thingID]
        let rand = Math.floor(Math.random() * 10000)

        let amountUnpledged = thingInfo.funderObjects.filter(a => a.userID == key)[0].amountLeft
        thingInfo.funderObjects = thingInfo.funderObjects.filter(a => a.userID != key)
        thingInfo.funders = thingInfo.funders.filter(a => a != key)
        thingDB[thingID] = thingInfo

        let userInfo = userDB[key]
        userInfo.thingsBeingFunded = userInfo.thingsBeingFunded.filter(a => a != thingID)
        userDB[key] = userInfo

        updatesDB[rand] = {
            updateID: rand,
            updateType: "defundedThing",
            funder: key,
            funderName: userInfo.username,
            doer: thingInfo.doer,
            doerName: thingInfo.doerName,
            updateSubscribers: [thingInfo.doer, key],
            amountRemoved: thingInfo.amountLeft,
            timestamp: new Date().toISOString().slice(0, 10),
            message: `<a href="/funders/${userInfo.username}"> ${userInfo.username}</a> unpledged $${amountUnpledged} from <a href="/things/${thingID}"> ${thingInfo.thingName}.`
        }

        res.json({ success: true })
    }

    catch (error) {
        console.log(error)
    }

})



async function getAllThings(){

    // const { data, error } = await supabase
    //     .from('things_table').select()
    let things = {}

    for(let ele of Object.values(thingDB)){
        things[ele.thingID] = ele
    }

    return things
}

async function getAllUsers(){

    // const { data, error } = await supabase
    //     .from('users_table').select()

    let ret = {}

    for(let ele of Object.values(userDB)){
        ret[ele.userID] = ele
        ret[ele.userID].thingsBeingDone = getThingsBeingDoneBy(ele.userID)
        ret[ele.userID].thingsBeingFunded = getThingsBeingFundedBy(ele.userID)
    }

    return ret
}

async function getuserID(username){
    for(let ele of Object.values(userDB)){
        if(ele.username == username){
            return ele.userID
        }
    }
}

async function getUserInfo(userID){

    let thingsBeingFunded = []
    let thingsBeingDone = []
    let totalAmountPledged = userDB[userID].totalAmountPledged

    for(let ele of Object.values(thingDB)){
        if(ele.doer == userID){
            thingsBeingDone.push( await getDataForThing(ele.thingID) )
        }

        else if(ele.funders.includes(userID)){
            thingsBeingFunded.push( await getDataForThing(ele.thingID) )
        }
    }

    let userInfo = userDB[userID]

    return {
        username: userInfo.username,
        bio: userInfo.bio,
        thingsBeingFunded: thingsBeingFunded,
        thingsBeingDone: thingsBeingDone,
        totalAmountPledged: totalAmountPledged
    }
}

async function getAllNotificationsForUser(userID){

    // const { data, error } = await supabase
    //     .from('notifications_table').select(userID)

    let updateObjects = []
    
    for(let ele of Object.values(updatesDB)){
        if(ele.updateSubscribers.includes(userID)){
            updateObjects.push(ele)
        }
    }
    
    // [{
    //     thingID: 123,
    //     thingName: "Cool Thing",
    //     thingDoer: "Judah",
    //     totalAmount: "$100",
    //     updateAmount: "$10",
    //     currentIteration: 10,
    //     totalIterations: 100,
    //     userID: 123,
    //     dateOfUpdate: "12/12/2022"
    // }]

    return updateObjects

}

async function getDataForThing(thingID) {

    // let thingUpdates = "updatesDB.fetch( * where updateID = thingID"
    // let funderObjects = "funderDB.fetch( * where thingsBeingFunded includes thingID"

    try{

    let thing = thingDB[thingID] 
    thing.remainingIterations = thing.totalIterations - thing.completeIterations

    let totalAmount = 0

    for(let ele of thing.funderObjects){
        totalAmount += ele.payload
    }

    thing.totalAmount = totalAmount

    return thing
        }

    catch(error){
        console.log(error)
    }
}

function getThingsBeingDoneBy(userID){

    let things = []

    for(let ele of Object.values(thingDB)){
        if(ele.doer == userID){
            things.push(ele)
        }
    }

   return things
}


function getThingsBeingFundedBy(userID) {

    let things = []

    for (let ele of Object.values(thingDB)) {
        if (ele.funders.includes(userID) == true) {
            things.push(ele)
        }
    }

    return things
}

//add timestamp on DB server
async function createNotification(idOfInvolvedUser, message){

    let notification = {
        key: "new UUID",
        isFor: idOfInvolvedUser,
        message: message, 
    }
    
}

async function createNewThing(thingName, thingDescription, doerID, totalIterations, thingID){

    let username = userDB[doerID].username

    let newThingObject = {
    thingID: thingID,
    thingName: thingName,
    doer: doerID,
    doerName: username,
    contractID: "abc",
    thingDescription: thingDescription,
    totalIterations: totalIterations,
    remainingIterations: totalIterations,
    completeIterations: 0,
    thingUpdates: {},
    funderObjects: [],
    funders: [],
    startDate: new Date().toISOString().slice(0,10)
    }

    thingDB[thingID] = newThingObject
    // add new Thing to user's thingsBeingDone
}

async function createNewUser(key, username){

    let newUserObject = {
        userID: key,
        username: username,
        thingsBeingFunded: {},
        thingsBeingDone: {},
        bio: "An empty bio.",       
    }
}

async function createNewFundingRelationship(funderId, doerId, thingID, totalAmount, iterationsToBeFunded){

    let newFundingRelationship = {
        funderId: userID,
        doerId: doerId,
        totalAmount: totalAmount,
        iterationsToBeFunded: iterationsToBeFunded, /* is an array of iteration numbers */
        payoutAmount: totalAmount/iterationsToBeFunded.length,

    }
}



async function updateThing(thingID, updateText, iterationNumber){

    let newUpdate = {
        updateTo: thingID,
        updateText: updateText,
        iterationNumeber: iterationNumber
    }
    //insert to updates table
}

async function updateProfileInfo(userID, bio, username){  
}

async function cancelFundingRelationship(userID, thingID){

}



function startNewThing(thingName, totalIterations){


    return {
        contractId: uuidv4(),
        walletID: "yourWalletAddress",
        success: true
    }
}

function updateThing(thingName, contractId){

    // incrementContract(contractId)

    return {
        completeIterations: 0,
        contractId: contractId,
        success: true
    }
}

function fundThing(contractId, walletAddress){

   // fundThing(contractId, walletAddress)

    return {
        amountAdded: 100,
        contractId: contractId,
        wallet: walletAddress
    }
}

function defundThing(contractId, walletAddress){

    let thingsBeingFunded = userDB[walletAddress].thingsBeingFunded
    thingsBeingFunded = thingsBeingFunded.filter(a => a != contractId)
    userDB[walletAddress].thingsBeingFunded = thingsBeingFunded

    let 

    return {
        amountRemoved: 100,
        contractId: contractId,
        wallet: walletAddress
    }
}

let contractDB = {

}

let userDB = {
    "firstwallet": {
        username: "Judah",
        userID: "firstwallet",
        bio: "Cool bio",
        thingsBeingFunded: ["138393"],
        thingsBeingDone: [],
        totalAmountPledged: 100
    },

    "secondwallet": {
        username: "Patrona",
        userID: "secondwallet",
        bio: "Cool bio",
        thingsBeingFunded: [],
        thingsBeingDone: ["138393"],
        totalAmountPledged: 0
    },

    "thirdwallet": {
        username: "Dinesh",
        userID: "thirdwallet",
        bio: "Cool bio",
        thingsBeingFunded: [],
        thingsBeingDone: [],
        totalAmountPledged: 0
    }
}

let thingDB = {

    "138393": {
        thingID: "138393",
        contractID: "abc",
        thingName: "Cool thing",
        thingDescription: "This is a cool thing (I hope).",
        doer: "firstwallet",
        doerName: "Judah",
        totalIterations: 30,
        completeIterations: 4,
        thingUpdates: {
            1: { date: "11/11/11", updateDescription: "This is a brief message about the update" },
            2: { date: "14/10/20", updateDescription: "Description" },
            3: { date: "12/01/22", updateDescription: "I’m now at the last section of the tour, “Concurrency”, which starts with “Goroutines”... I might take this opportunity to Homer Simpson into the bushes and cook dinner." },
            4: { date: "12/01/22", updateDescription: "The past two years were a wild chase for answers. A question that had been lodged in my head for months: What does it mean to natively design for screens?" }
        },
        funders: ["secondwallet"],
        funderObjects: [{ userID: "secondwallet", totalAmount: 100, amountLeft: 100 - 3.33 * 4, username: "Patrona", from: 0, to: 30, payload: 3.33 }],
        startDate: "11/11/11"
    }
}

let updatesDB = {

    "123": {
        updateType: "fundedThing",
        thingName: "Cool Thing",
        funder: "secondwallet",
        doer: "firstwallet",
        updateSubscribers: ["secondwallet", "firstwallet"],
        amountAdded: 100,
        timestamp: "now",
        thingID: "138393",
        updateID: "123",
        message: `You created an account today`
    },

    "222": {
        updateType: "paidTo",
        thingName: "Cool Thing",
        updateSubscribers: ["thirdwallet"],
        funder: "secondwallet",
        doer: "firstwallet",
        amountPaid: 2,
        iteration: 4,
        timestamp: "now",
        thingID: "138393",
        updateID: "222",
        message: `You created an account today`
    },

    "1234": {
        updateType: "defundedThing",
        thingName: "Cool Thing",
        funder: "secondwallet",
        doer: "firstwallet",
        amountRemoved: 100,
        updateSubscribers: ["secondwallet", "firstwallet"],
        timestamp: "now",
        thingID: "138393",
        updateID: "1234",
        message: `You created an account today`
    },

    //"12345": {
    //     updateType: "addedNewThing",
    //     thingName: "Cool Thing",
    //     thingID: "138393",
    //     updateSubscribers: ["firstwallet"],
    //     doer: "firstwallet",
    //     timestamp: "now",
    //     updateID: "12345",
    //     thingID: "138393"
    // },

    // "123456": {
    //     updateType: "updatedThing",
    //     updateSubscribers: ["firstwallet"],
    //     doer: "firstwallet",
    //     updateDescription: "Description",
    //     timestamp: "now",
    //     updateID: "123456"
    // },

  
}

let usernames = ["Judah", "Patrona"]

let contract = {
    totalAmount: 0,
    totalIterations: 100,
    completeIterations: 0,
    doer: "secondwallet",
    thingName: "Cool Thing",
    thingID: "random uuid",
    contractID: "md5 hash of thingName and wallet",
    startDate: "proabably no need to add this",
    funders: {
        "secondwallet": {
            amountPledged: 0,
            fromIteration: 10,
            toIteration: 100
        }
    }

}
                               
