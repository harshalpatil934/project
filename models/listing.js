const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        type:String,
        default:"https://media.istockphoto.com/id/2157290923/photo/happy-travelers-examining-map-while-enjoying-in-a-walk-through-the-town.jpg?s=1024x1024&w=is&k=20&c=4im_Nse6Fg2IfndeBzOQIZejR8w7-IA1vtK_f-um1Fg=",
        
        set :(v)=> v===" " ? "https://media.istockphoto.com/id/2157290923/photo/happy-travelers-examining-map-while-enjoying-in-a-walk-through-the-town.jpg?s=1024x1024&w=is&k=20&c=4im_Nse6Fg2IfndeBzOQIZejR8w7-IA1vtK_f-um1Fg=" : v,
        
    },
    price:Number,
    location:String,
    country:String,
});

const listing=mongoose.model("listing",listingSchema);
module.exports=listing;