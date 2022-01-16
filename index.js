import dotenv from "dotenv"
dotenv.config()
import express, { urlencoded } from "express"
import cors from "cors"
import mongoose from "mongoose"

const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

const dbPassword = process.env.DB_PASSWORD

mongoose.connect(`mongodb+srv://keeper_login:${dbPassword}@cluster0.swjlz.mongodb.net/kepperAppDatabase?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true}, () => console.log("DB Connected"))

    const userSchema = new  mongoose.Schema({
        name: String,
        email: String,
        password: String,
    })

    const User = new mongoose.model("User", userSchema)

    const kepperSchema = mongoose.Schema({
        title: String,
        description: String,
        userId: String
    })
    
    const keeper = new mongoose.model("keeper", kepperSchema)

//Routes

app.get("/", (req, res) => {
    res.send("Login register keeper BE started.")
})

app.post("/api/login", (req, res) =>{
    const {email, password} = (req.body)
    User.findOne({email: email}, (err, user) => {
       if(user){
            if(password === user.password){
                res.send({message: "Login Successfull", user: user})
            } else {
                res.send({message: "Password didm't match"})
            }
       } else {
           res.send({message: "User not Registered"})
       }
    })
})

app.post("/api/register", (req, res) =>{
    const {name, email, password} = (req.body)
    User.findOne({email: email}, (err, user) => {
        if(user){
            res.send({message: "User already registered"})
        } else {
            const user = new User({
                name,
                email,
                password
            })
        
            user.save( err => {
                if(err){
                    res.send(err)
                } else {
                    res.send({ message: "Successfully Registered"})
                }
            })
        }
    })
    
})

app.post("/api/getAll",(req, res) =>{
    console.log(req.body)
    const {userId} = req.body
    console.log(userId)
    keeper.find({userId}, (err, keeperList) => {
        if(err){
            console.log(err)
        }else{
            console.log(keeperList)
            res.status(200).send(keeperList)
        }
    })
})

app.post("/api/addNew",(req, res) =>{
    const { title, description, userId } = req.body
    // if(userId){
    //     User.findOne({_id: userId}, (err, user) => {
            
    //     } )
    // } else{

    // }
    const keeperObj = new keeper({
        title,
        description,
        userId
    })
    keeperObj.save(err => {
        if(err){
            console.log(err)
        }
        keeper.find({userId}, (err, keeperList) => {
            if(err){
                console.log(err)
            }else{
                res.status(200).send(keeperList)
            }
        })
    })
})

app.post("/api/delete",(req, res) =>{
    const { id } = req.body 
    keeper.deleteOne({_id: id}, () => {
        keeper.find({}, (err, keeperList) => {
            if(err){
                console.log(err)
            }else{
                res.status(200).send(keeperList)
            }
        })
    })
})

const port = process.env.PORT || 9002
app.listen(port,() => {
    console.log(`BE started at port ${port}.`);
})