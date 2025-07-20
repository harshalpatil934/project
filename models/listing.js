const mongoose=require("mongoose");
const Review = require("./review");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
       url:String,
       filename:String,
    },
    price:Number,
    location:String,
    country:String,
    category:{
        type:String,
        enum:["mountain","beach","forest"],
    },
    reviews:[
       { 
        type:Schema.Types.ObjectId,
        ref:"Review"
       },
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    
});

//delete reviews when listing is deleted
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
   await Review.deleteMany({_id:{$in:listing.reviews}});
    }
})

const listing=mongoose.model("listing",listingSchema);
module.exports=listing;