const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

let day = date.getDate();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');



//mongoose.connect("mongodb+srv://admin-ambuj:Ambuj%40658@cluster0.ycqfw.mongodb.net/todolistDB?retryWrites=true&w=majority");

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("Item", itemSchema);
const item1 = new Item({
  name: "Welcome to todolist."
});
const item2 = new Item({
  name: "Add your item by clicking "+"."
});
const item3 = new Item({
  name: "Check your items to delete."
});
const defaultItems = [item1, item2, item3]; 

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});
const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  Item.find(function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Succesfully inserted default items");
        }
      });
      res.redirect("/");
    }else{
      res.render("list.ejs", {
        todayDate: day,
        listTitle: "Today",
        newItems: foundItems
      });
    }
  });
})

app.post("/", function (req, res) {
  let newItem = req.body.todo;
  const listName = req.body.button;

  const item4 = new Item({
    name: newItem
  });

  if(listName === "Today"){
    item4.save();
    res.redirect("/");
  }else if(listName === "about"){
    res.redirect("/about");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
})

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName == "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Item succesfully deleted.");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }
  
});

app.get("/about", function(req, res){
  res.render("about");
})

app.get("/:newListName", function(req, res){
  const customListName = _.capitalize(req.params.newListName);

  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(foundList){
        //Show an existing list
        res.render("list", {
          todayDate: day,
          listTitle: foundList.name,
          newItems:  foundList.items
        });
      }else{
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      }
    }
  });

});


app.post("/newList", function(req, res){
  const newListName = _.capitalize(req.body.newListName);
  res.redirect("/"+ newListName);
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server has started succesfully.");
})