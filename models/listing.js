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
        type:String,
        default:"https://media.istockphoto.com/id/2155498743/photo/traveler-holding-orange-suitcase-on-city-street.jpg?s=1024x1024&w=is&k=20&c=w5UlYrQlGdljWx5wS1H1tW509a5bS7sC49FxsOvH8kM=",
        
        set :(v)=> v==="" ? "https://media.istockphoto.com/id/2155498743/photo/traveler-holding-orange-suitcase-on-city-street.jpg?s=1024x1024&w=is&k=20&c=w5UlYrQlGdljWx5wS1H1tW509a5bS7sC49FxsOvH8kM=" : v,
        
    },
    price:Number,
    location:String,
    country:String,
    reviews:[
       { 
        type:Schema.Types.ObjectId,
        ref:"Review"
       },
    ],
});

//delete reviews when listing is deleted
listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
   await Review.deleteMany({_id:{$in:listing.reviews}});
    }
})

const listing=mongoose.model("listing",listingSchema);
module.exports=listing;