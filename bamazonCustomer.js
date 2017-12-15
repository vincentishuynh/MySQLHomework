var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
  start();
});

function start(){
  
  readDatabase();

}

function readDatabase(){
  console.log("Selecting all products...\n");
  connection.query("SELECT * FROM products", function(err, res) {
  if (err) throw err;
  console.log(res);
  updateDatabase();
  });
}

function updateDatabase(){
  inquirer.prompt([
      {
        name: "ID",
        message:"What is the ID of the product you would like to buy?"
      },{
        name: "Units",
        message:"How many units would you like to buy?"
      }
      
        ]).then(function(answers){
          check();
          function check (){
            console.log("CHECKING...\n");
            connection.query("SELECT * FROM products WHERE item_id = ?",[answers.ID], function(err, res) {
              if (err) throw err;
              if((res[0].stock_quantity-answers.Units) < 0){
                console.log("Insufficient Quantity!");
                connection.end();
                
              }else if ((res[0].stock_quantity-answers.Units) > 0){
                console.log("Making your purchase!\n");
                connection.query("UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
                 [
                  answers.Units,
                  answers.ID
                 ], function(err, res) {
                  if (err) throw err;
                  // console.log(res);
                  
                });
                 connection.query("SELECT * FROM products WHERE item_id = ?",[answers.ID], function(err, res) {
                  if (err) throw err;
                  var result = answers.Units * res[0].price;
                  console.log("This is your total: "+result);
                  connection.end();
                });
              }
            });
          }

         

        });
}
