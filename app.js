//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-bhavesh:Passw0rd@studentportalcluster.ujial.mongodb.net/<dbname>?retryWrites=true&w=majority/todolistDB", {useNewUrlParser : true, useUnifiedTopology: true });

const itemsSchema = {
  name : String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name : "Welcome to your Todolist"
});

const item2 = new Item({
  name : "Hit + to add items"
});

const item3 = new Item({
  name : "Click checkbox to delete Item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err, foundItems){

    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, function(err){

        if(err){
          console.log(err);
        } else {
          console.log("Successfull Inserted");
        }
      });      
    }   else  {
               res.render("list", {listTitle: "Today", newListItems: foundItems});    
    }
  });
});

app.get("/:newList", (req, res)=>{

  const newList = _.capitalize(req.params.newList);  

  List.findOne({name : newList}, function(err, foundList) {
      if (!err) {
        if(!foundList){
              const list = new List({
                name : newList,
                items : defaultItems
              });

              list.save();
              res.redirect("/" + newList);
        } else {
            res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
        }
      }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if (listName === "Today") {    
        item.save();
        res.redirect("/");        
  } else {
      List.findOne({name : listName}, function(err, foundList){
          foundList.items.push(item);
          foundList.save();
          res.redirect("/" + listName);      
      });    
  }
});

app.post("/delete", function(req, res){
  const rmItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
      Item.findByIdAndRemove(rmItem, function(err){
        if(!err){
          res.redirect("/")
        }
      });

  } else {
      List.findOneAndUpdate({name : listName}, {$pull : {items : {_id  : rmItem}} },
        function(err, foundList){
          if(!err){
            res.redirect("/" + listName);
          }
        });    
  }

  
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port);
