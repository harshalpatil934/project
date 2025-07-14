const mongoose=require("mongoose");
const initdata=require("./data.js");

const listing=require("../models/listing.js");
const mongo_url='mongodb://127.0.0.1:27017/RentNRest';

main().then((res)=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
});

async function main (){
await mongoose.connect(mongo_url);
}

const initDB=async ()=>{
  await listing.deleteMany({});
  initdata.data=initdata.data.map((obj)=>({...obj,owner:'68710e6056dcdf54ddea88a1'}));
  await listing.insertMany(initdata.data);
  console.log("data was initilised");
}

initDB();
