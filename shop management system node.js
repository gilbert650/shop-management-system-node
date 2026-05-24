
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ============================================================
// DATABASE CONNECTION
// ============================================================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "shop_system"
});

db.connect((err) => {

    if (err) {
        console.log(err);
    } else {
        console.log("MySQL Connected");
    }

});

// ============================================================
// CREATE TABLES
// ============================================================

const productTable = `
CREATE TABLE IF NOT EXISTS products(
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(100),
    price DECIMAL(10,2),
    quantity INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

const salesTable = `
CREATE TABLE IF NOT EXISTS sales(
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    product_name VARCHAR(100),
    quantity INT,
    total DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

db.query(productTable);
db.query(salesTable);

// ============================================================
// GLOBAL HTML
// ============================================================

let productsHTML = "";
let salesHTML = "";

// ============================================================
// LOAD PRODUCTS
// ============================================================

function loadProducts(callback) {

    db.query(
        "SELECT * FROM products",
        (err, result) => {

            productsHTML = "";

            result.forEach((product) => {

                productsHTML += `
                <tr>

                    <td>${product.id}</td>

                    <td>${product.product_name}</td>

                    <td>${product.category}</td>

                    <td>$${product.price}</td>

                    <td>${product.quantity}</td>

                    <td>

                    <a href="/delete-product/${product.id}">

                    <button class="delete">
                    Delete
                    </button>

                    </a>

                    </td>

                </tr>
                `;

            });

            callback();

        }
    );

}

// ============================================================
// LOAD SALES
// ============================================================

function loadSales(callback) {

    db.query(
        "SELECT * FROM sales",
        (err, result) => {

            salesHTML = "";

            result.forEach((sale) => {

                salesHTML += `
                <tr>

                    <td>${sale.id}</td>

                    <td>${sale.customer_name}</td>

                    <td>${sale.product_name}</td>

                    <td>${sale.quantity}</td>

                    <td>$${sale.total}</td>

                </tr>
                `;

            });

            callback();

        }
    );

}

// ============================================================
// HOME PAGE
// ============================================================

app.get("/", (req, res) => {

    loadProducts(() => {

        loadSales(() => {

            res.send(`

<!DOCTYPE html>
<html>
<head>

<title>
SHOP MANAGEMENT SYSTEM
</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Arial;
}

body{
    background:#f4f6f9;
}

/* NAVBAR */

.navbar{
    background:#1e293b;
    color:white;
    padding:15px;
    display:flex;
    justify-content:space-between;
    align-items:center;
}

.navbar h1{
    font-size:24px;
}

.navbar a{
    color:white;
    text-decoration:none;
    margin:10px;
}

/* HERO */

.hero{
    height:300px;

    background:
    linear-gradient(
    rgba(0,0,0,.7),
    rgba(0,0,0,.7)),
    url('https://images.unsplash.com/photo-1481437156560-3205f6a55735');

    background-size:cover;
    background-position:center;

    display:flex;
    justify-content:center;
    align-items:center;
    flex-direction:column;

    color:white;
    text-align:center;
}

.hero h2{
    font-size:45px;
}

.hero p{
    margin-top:10px;
    font-size:20px;
}

/* CONTAINER */

.container{
    width:90%;
    margin:auto;
    margin-top:30px;
}

/* CARD */

.card{
    background:white;
    padding:20px;
    margin-bottom:30px;
    border-radius:10px;
    box-shadow:0 0 10px rgba(0,0,0,.1);
}

/* FORM */

input{
    width:100%;
    padding:12px;
    margin-top:10px;
    border:1px solid #ccc;
    border-radius:5px;
}

button{
    margin-top:15px;
    padding:12px 20px;
    border:none;
    background:#1e293b;
    color:white;
    border-radius:5px;
    cursor:pointer;
}

button:hover{
    background:#334155;
}

.delete{
    background:red;
}

/* TABLE */

table{
    width:100%;
    border-collapse:collapse;
    margin-top:20px;
}

table th{
    background:#1e293b;
    color:white;
    padding:12px;
}

table td{
    border:1px solid #ddd;
    padding:12px;
}

/* FOOTER */

.footer{
    background:#1e293b;
    color:white;
    text-align:center;
    padding:20px;
    margin-top:40px;
}

</style>

</head>

<body>

<!-- NAVBAR -->

<div class="navbar">

<h1>
SHOP MANAGEMENT SYSTEM
</h1>

<div>
<a href="/">Home</a>
<a href="#products">Products</a>
<a href="#sales">Sales</a>
</div>

</div>

<!-- HERO -->

<div class="hero">

<h2>
WELCOME TO SHOP SYSTEM
</h2>

<p>
Manage Products, Stock & Sales
</p>

</div>

<div class="container">

<!-- ADD PRODUCT -->

<div class="card">

<h2>
Add Product
</h2>

<form action="/add-product"
method="POST">

<input
type="text"
name="product_name"
placeholder="Product Name"
required>

<input
type="text"
name="category"
placeholder="Category"
required>

<input
type="number"
step="0.01"
name="price"
placeholder="Price"
required>

<input
type="number"
name="quantity"
placeholder="Quantity"
required>

<button type="submit">
Add Product
</button>

</form>

</div>

<!-- PRODUCT TABLE -->

<div class="card" id="products">

<h2>
Products List
</h2>

<table>

<tr>

<th>ID</th>
<th>Product</th>
<th>Category</th>
<th>Price</th>
<th>Quantity</th>
<th>Action</th>

</tr>

${productsHTML}

</table>

</div>

<!-- SALES FORM -->

<div class="card">

<h2>
Record Sale
</h2>

<form action="/record-sale"
method="POST">

<input
type="text"
name="customer_name"
placeholder="Customer Name"
required>

<input
type="text"
name="product_name"
placeholder="Product Name"
required>

<input
type="number"
name="quantity"
placeholder="Quantity"
required>

<input
type="number"
step="0.01"
name="total"
placeholder="Total Amount"
required>

<button type="submit">
Save Sale
</button>

</form>

</div>

<!-- SALES TABLE -->

<div class="card" id="sales">

<h2>
Sales Records
</h2>

<table>

<tr>

<th>ID</th>
<th>Customer</th>
<th>Product</th>
<th>Quantity</th>
<th>Total</th>

</tr>

${salesHTML}

</table>

</div>

</div>

<!-- FOOTER -->

<div class="footer">

<p>
© 2026 SHOP MANAGEMENT SYSTEM
</p>

</div>

</body>
</html>

            `);

        });

    });

});

// ============================================================
// ADD PRODUCT
// ============================================================

app.post("/add-product",
(req, res) => {

    const {
        product_name,
        category,
        price,
        quantity
    } = req.body;

    const sql = `
    INSERT INTO products(
        product_name,
        category,
        price,
        quantity
    )
    VALUES(?,?,?,?)
    `;

    db.query(
        sql,
        [
            product_name,
            category,
            price,
            quantity
        ],
        (err, result) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/");

        }
    );

});

// ============================================================
// DELETE PRODUCT
// ============================================================

app.get("/delete-product/:id",
(req, res) => {

    db.query(
        "DELETE FROM products WHERE id=?",
        [req.params.id],
        (err, result) => {

            res.redirect("/");

        }
    );

});

// ============================================================
// RECORD SALE
// ============================================================

app.post("/record-sale",
(req, res) => {

    const {
        customer_name,
        product_name,
        quantity,
        total
    } = req.body;

    const sql = `
    INSERT INTO sales(
        customer_name,
        product_name,
        quantity,
        total
    )
    VALUES(?,?,?,?)
    `;

    db.query(
        sql,
        [
            customer_name,
            product_name,
            quantity,
            total
        ],
        (err, result) => {

            if (err) {
                console.log(err);
            }

            res.redirect("/");

        }
    );

});

// ============================================================
// SERVER
// ============================================================

app.listen(3000, () => {

    console.log(
    "SHOP MANAGEMENT SYSTEM RUNNING");

    console.log(
    "http://localhost:3000");

});