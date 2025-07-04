//setup
const express=require("express");
const app=express();
const listing=require("./models/listing")
const path =require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.use(express.static("public"));
app.engine("ejs",ejsMate);

const mongoose=require("mongoose");

const mongo_url='mongodb://127.0.0.1:27017/RentNRest';

main().then((res)=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main (){
await mongoose.connect(mongo_url);
}


app.get("/",(req,res)=>{
    res.send("recived");
});

//index-route
app.get("/listings",async (req,res)=>{
   let allListings=await listing.find({});
   res.render("listings/index.ejs",{allListings});
});

//new

app.get("/listings/new",(req,res)=>{
    res.render("listings/newform.ejs");
});

// show route
app.get("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    const list=await listing.findById(id);
    res.render("listings/show.ejs",{list});
});

//create route
app.post("/listings",async (req,res)=>{
   const newListing=new listing(req.body.listing);
   await newListing.save();
   res.redirect("/listings");
});

//edit
app.get("/listings/:id/edit",async(req,res)=>{
    let {id}=req.params;
    const list=await listing.findById(id);
    res.render("listings/editform.ejs",{list});
});

//update

app.put("/listings/:id",async (req,res)=>{
let {id}=req.params;
await listing.findByIdAndUpdate(id,{...req.body.listing});
res.redirect(`/listings/${id}`);
} );

//delete
app.delete("/listings/:id",async (req,res)=>{
let {id}=req.params;
let deletedlist=await listing.findByIdAndDelete(id);
console.log(deletedlist);
res.redirect(`/listings`);
} );



// app.get("/test",async (req,res)=>{
//     let sample=new listing({
//         title:"my villa",
//         descrption:"by the beach",
//         price:1500,
//         location:"mumbai maharashtra",
//         country:"india",
//     });
//     await sample.save();
//     console.log("data saved");
//     res.send("succesfull");
// });

app.listen(8080,()=>{
    console.log("listning");
});
