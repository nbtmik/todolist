//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://soumikchakrabarty103:pratimac@cluster0.plnx1bj.mongodb.net/todolistdb",{UseNewUrlParser:true});//for cloud service of mongodb
//mongoose.connect("mongodb://127.0.0.1:27017/todolistdb",{UseNewUrlParser:true}); //(for local mongo)when i've used mongoose.connect("mongodb://localhost:27017/todolistDB it didn't worked but when i used 127.0.0.1:27017 insted of localhost:27017 it worked

const itemsSchema= {
  name:String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your ToDOList!"
});

const item2 = new Item({
  name:"Hit the + button to aff a new item!"
});

const item3 = new Item({
  name:"<--hit this to delete an item!"
});

const defaultItems = [item1,item2,item3];

const ListSchema ={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",ListSchema);

app.get("/", function(req, res) {
  

  Item.find()
.then(function(foundItems){
  if(foundItems.length===0){
    Item.insertMany(defaultItems)
.then(function(){
  console.log("Successfully saved in DB");
})
.catch(function(err){
  console.log(err);
});
res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name:listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
   
  if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId)
  .then(function () {
    console.log("Checked Item has been removed");
  })
  .catch(function(err){
    console.log(err);
  });
  res.redirect("/");
}else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}})
  .then(function(foundList){
    res.redirect("/"+ listName);
    console.log("deleted item from list");
  })
  .catch(function(err){
  console.log(err);
  });
}
});

app.get("/:customerListName", function(req,res){
  const customerListName = _.capitalize(req.params.customerListName);

  List.findOne({name:customerListName})
  .then(function(foundList){
    if(!foundList){
      const list = new List({
        name: customerListName,
        items: defaultItems
      });
      
      list.save();
      res.redirect("/"+ customerListName);
    }else{
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })
  .catch(function(err){ //might need to change
    console.log(err);
  });


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
