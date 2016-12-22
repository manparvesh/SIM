var DB = {};

DB.init = function() {
	if (window.confirm('are you sure to initialize database?')) {
		DB.load();
	}
};

DB.load = function() {
	alasql.options.joinstar = 'overwrite';

	// Classes
	alasql('DROP TABLE IF EXISTS kind;');
	alasql('CREATE TABLE kind(id INT IDENTITY, text STRING);');
	var pkind = alasql.promise('SELECT MATRIX * FROM CSV("data/KIND-KIND.csv", {headers: true})').then(function(kinds) {
		for (var i = 0; i < kinds.length; i++) {
			var kind = kinds[i];
			alasql('INSERT INTO kind VALUES(?,?);', kind);
		}
	});

	// Items
	alasql('DROP TABLE IF EXISTS item;');
	alasql('CREATE TABLE item(id INT IDENTITY, code STRING, kind INT, detail STRING, maker STRING, price INT, unit STRING);');
	var pitem = alasql.promise('SELECT MATRIX * FROM CSV("data/ITEM-ITEM.csv", {headers: true})').then(function(items) {
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			alasql('INSERT INTO item VALUES(?,?,?,?,?,?,?);', item);
		}
	});

	// Warehouses
	alasql('DROP TABLE IF EXISTS whouse;');
	alasql('CREATE TABLE whouse(id INT IDENTITY, name STRING, addr STRING, tel STRING);');
	var pwhouse = alasql.promise('SELECT MATRIX * FROM CSV("data/WHOUSE-WHOUSE.csv", {headers: true})').then(
			function(whouses) {
				for (var i = 0; i < whouses.length; i++) {
					var whouse = whouses[i];
					alasql('INSERT INTO whouse VALUES(?,?,?,?);', whouse);
				}
			});

	// Inventories
	alasql('DROP TABLE IF EXISTS stock;');
	alasql('CREATE TABLE stock(id INT IDENTITY, item INT, whouse INT, balance INT);');
	var pstock = alasql.promise('SELECT MATRIX * FROM CSV("data/STOCK-STOCK.csv", {headers: true})').then(
			function(stocks) {
				for (var i = 0; i < stocks.length; i++) {
					var stock = stocks[i];
					alasql('INSERT INTO stock VALUES(?,?,?,?);', stock);
				}
			});

	// Transaction
	alasql('DROP TABLE IF EXISTS trans;');
	alasql('CREATE TABLE trans(id INT IDENTITY, stock INT, date DATE, qty INT, balance INT, memo STRING);');
	var ptrans = alasql.promise('SELECT MATRIX * FROM CSV("data/TRANS-TRANS.csv", {headers: true})').then(
			function(transs) {
				for (var i = 0; i < transs.length; i++) {
					var trans = transs[i];
					alasql('INSERT INTO trans VALUES(?,?,?,?,?,?);', trans);
				}
			});
    
    // Users
    alasql('DROP TABLE IF EXISTS users;');
    alasql('CREATE TABLE users(id INT IDENTITY, name STRING, pass STRING, dept STRING);');
    var pusers = alasql.promise('SELECT MATRIX * FROM CSV("data/USERS-USERS.csv", {headers: true})').then(
            function(users) {
                for (var i = 0; i < users.length; i++) {
                    var user = users[i];
                    alasql('INSERT INTO users VALUES(?,?,?,?);', user);
                }
            });

    // Logins
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
    var plogins = alasql.promise('SELECT MATRIX * FROM CSV("data/LOGINS-LOGINS.csv", {headers: true})').then(
            function(users) {
                for (var i = 0; i < users.length; i++) {
                    var user = users[i];
                    alasql('INSERT INTO users VALUES(?,?);', user);
                }
            });
    
    // customers
    alasql('DROP TABLE IF EXISTS customers;');
    alasql('CREATE TABLE customers(id INT IDENTITY, name STRING, addr STRING, contact STRING, whouse INT);');
    var pcustomers = alasql.promise('SELECT MATRIX * FROM CSV("data/CUSTOMERS-CUSTOMERS.csv", {headers: true})').then(
            function(customers) {
                for (var i = 0; i < customers.length; i++) {
                    var customer = customers[i];
                    alasql('INSERT INTO customers VALUES(?,?,?,?,?);', customer);
                }
            });

	// order add
    alasql('DROP TABLE IF EXISTS ordersadd;');
    alasql('CREATE TABLE ordersadd(id INT IDENTITY, order_id INT, whouse INT, supplier_id INT, status INT, date_received DATE,  date_approved DATE, date_shipped DATE, date_completed DATE);');
    var pordersadd = alasql.promise('SELECT MATRIX * FROM CSV("data/ORDERADD-ORDERADD.csv", {headers: true})').then(
            function(ordersadd) {
                for (var i = 0; i < ordersadd.length; i++) {
                    var orderadd = ordersadd[i];
                    alasql('INSERT INTO ordersadd VALUES(?,?,?,?,?,?,?,?,?);', orderadd);
                }
            });

	// order add details
    alasql('DROP TABLE IF EXISTS ordersadddetails;');
    alasql('CREATE TABLE ordersadddetails(id INT IDENTITY, order_id INT, supplier_id INT, product_id INT, quantity INT);');
    var pordersadddetails = alasql.promise('SELECT MATRIX * FROM CSV("data/ORDERADDDETAILS-ORDERADDDETAILS.csv", {headers: true})').then(
            function(ordersadddetails) {
                for (var i = 0; i < ordersadddetails.length; i++) {
                    var orderadddetails = ordersadddetails[i];
                    alasql('INSERT INTO ordersadddetails VALUES(?,?,?,?,?);', orderadddetails);
                }
            });

	// order remove
    alasql('DROP TABLE IF EXISTS ordersremove;');
    alasql('CREATE TABLE ordersremove(id INT IDENTITY, customer_id INT, status INT, date_received DATE, date_approved DATE, date_shipped DATE, date_completed DATE);');
    var pordersremove = alasql.promise('SELECT MATRIX * FROM CSV("data/ORDERREMOVE-ORDERREMOVE.csv", {headers: true})').then(
            function(ordersremove) {
                for (var i = 0; i < ordersremove.length; i++) {
                    var orderremove = ordersremove[i];
                    alasql('INSERT INTO ordersremove VALUES(?,?,?,?,?,?,?);', orderremove);
                }
            });

	// order remove details
    alasql('DROP TABLE IF EXISTS ordersremovedetails;');
    alasql('CREATE TABLE ordersremovedetails(id INT IDENTITY, order_id INT, product_id INT, quantity INT);');
    var pordersremovedetails = alasql.promise('SELECT MATRIX * FROM CSV("data/ORDERREMOVEDETAILS-ORDERREMOVEDETAILS.csv", {headers: true})').then(
            function(ordersremovedetails) {
                for (var i = 0; i < ordersremovedetails.length; i++) {
                    var orderremovedetails = ordersremovedetails[i];
                    alasql('INSERT INTO ordersremovedetails VALUES(?,?,?,?);', orderremovedetails);
                }
            });

	// suppliers
    alasql('DROP TABLE IF EXISTS suppliers;');
    alasql('CREATE TABLE suppliers(id INT IDENTITY, name STRING, addr STRING, contact STRING, whouse INT, delivery_time INT);');
    var psuppliers = alasql.promise('SELECT MATRIX * FROM CSV("data/SUPPLIERS-SUPPLIERS.csv", {headers: true})').then(
            function(suppliers) {
                for (var i = 0; i < suppliers.length; i++) {
                    var supplier = suppliers[i];
                    alasql('INSERT INTO suppliers VALUES(?,?,?,?,?,?);', supplier);
                }
            }); 

    // supplier products
    alasql('DROP TABLE IF EXISTS supplierproducts;');
    alasql('CREATE TABLE supplierproducts(id INT IDENTITY, supplier_id INT, product_id INT, cost INT);');
    var psupplierproducts = alasql.promise('SELECT MATRIX * FROM CSV("data/SUPPLIERPRODUCTS-SUPPLIERPRODUCTS.csv", {headers: true})').then(
            function(supplierproducts) {
                for (var i = 0; i < supplierproducts.length; i++) {
                    var supplierproduct = supplierproducts[i];
                    alasql('INSERT INTO supplierproducts VALUES(?,?,?,?);', supplierproduct);
                }
            }); 


	//  replacements
    // replacement type: 1. customer return 2. defective
    alasql('DROP TABLE IF EXISTS replacements;');
    alasql('CREATE TABLE replacements(id INT IDENTITY, order_id INT, order_type INT, product_id INT, quantity INT, replacement_type INT, status INT);');
    var preplacements = alasql.promise('SELECT MATRIX * FROM CSV("data/REPLACEMENTS-REPLACEMENTS.csv", {headers: true})').then(
            function(replacements) {
                for (var i = 0; i < replacements.length; i++) {
                    var replacement = replacements[i];
                    alasql('INSERT INTO replacements VALUES(?,?,?,?,?,?,?);', replacement);
                }
            }); 


	//  requirements
    alasql('DROP TABLE IF EXISTS requirements;');
    alasql('CREATE TABLE requirements(id INT IDENTITY, order_id INT, whouse INT, req INT, product_id INT, quantity INT, status INT, order_add_id INT);');
    var prequirements = alasql.promise('SELECT MATRIX * FROM CSV("data/REQUIREMENTS-REQUIREMENTS.csv", {headers: true})').then(
            function(requirements) {
                for (var i = 0; i < requirements.length; i++) {
                    var requirement = requirements[i];
                    alasql('INSERT INTO requirements VALUES(?,?,?,?,?,?,?,?);', requirements);
                }
            }); 


	//  stockrange
    alasql('DROP TABLE IF EXISTS stockrange;');
    alasql('CREATE TABLE stockrange(id INT IDENTITY, product_id INT, whouse INT, min INT, max INT, optimum INT);');
    var pstockrange = alasql.promise('SELECT MATRIX * FROM CSV("data/STOCKRANGE-STOCKRANGE.csv", {headers: true})').then(
            function(stockrange) {
                for (var i = 0; i < stockrange.length; i++) {
                    var stockrange_i = stockrange[i];
                    alasql('INSERT INTO stockrange VALUES(?,?,?,?,?,?);', stockrange_i);
                }
            }); 


	//  restock
    alasql('DROP TABLE IF EXISTS restock;');
    alasql('CREATE TABLE restock(id INT IDENTITY, product_id INT, whouse_from INT, whouse_to INT, quantity INT,status INT);');
    var prestock = alasql.promise('SELECT MATRIX * FROM CSV("data/RESTOCK-RESTOCK.csv", {headers: true})').then(
            function(restock) {
                for (var i = 0; i < restock.length; i++) {
                    var restock_i = restock[i];
                    alasql('INSERT INTO restock VALUES(?,?,?,?,?,?);', restock_i);
                }
            }); 


	//  temp
    alasql('DROP TABLE IF EXISTS temp;');
    alasql('CREATE TABLE temp(id INT IDENTITY, product_id INT, whouse_from INT, whouse_to INT, quantity INT);');
    var ptemp = alasql.promise('SELECT MATRIX * FROM CSV("data/TEMP-TEMP.csv", {headers: true})').then(
        function(temp) {
            for (var i = 0; i < temp.length; i++) {
                var temp_i = temp[i];
                alasql('INSERT INTO temp VALUES(?,?,?,?,?);', temp_i);
            }
        }); 

	// Reload page
	Promise.all([ pkind, pitem, pwhouse, pstock, ptrans, pusers, plogins, pcustomers, pordersadd, pordersadddetails, pordersremove, pordersremovedetails, psuppliers, psupplierproducts, preplacements, prequirements, pstockrange, prestock, ptemp ]).then(function() {
		window.location.reload(true);
	});
};

DB.remove = function() {
	if (window.confirm('are you sure to delete dababase?')) {
		alasql('DROP localStorage DATABASE STK')
	}
};

// add commas to number
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// DO NOT CHANGE!
alasql.promise = function(sql, params) {
	return new Promise(function(resolve, reject) {
		alasql(sql, params, function(data, err) {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

// connect to database
try {
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
} catch (e) {
	alasql('CREATE localStorage DATABASE STK;');
	alasql('ATTACH localStorage DATABASE STK;');
	alasql('USE STK;');
	DB.load();
}
