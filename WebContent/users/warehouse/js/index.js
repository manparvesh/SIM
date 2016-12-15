var logins = alasql('SELECT * FROM logins');
console.log(logins.length);
console.log(logins[0].emp_id);
var loginID = logins[0].emp_id;
var user = alasql('SELECT * FROM users WHERE id=?',[logins[0].emp_id]);
console.log(user[0].name);

// create search box
var rows = alasql('SELECT * FROM whouse;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.id);
	option.text(row.name);
	$('select[name="q1"]').append(option);
}

var rows = alasql('SELECT * FROM kind;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.id);
	option.text(row.text);
	$('select[name="q2"]').append(option);
}

// get search params
var q1 = parseInt($.url().param('q1') || '0');
$('select[name="q1"]').val(q1);
var q2 = parseInt($.url().param('q2') || '0');
$('select[name="q2"]').val(q2);
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);

// build sql
var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, stock.balance, item.unit \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

sql += 'AND whouse.id = ' + (loginID - 3) + ' ';

console.log(sql);

// send query
var stocks = alasql(sql, [ '%' + q3 + '%' ]);

// build html table
var tbody = $('#tbody-stocks');
for (var i = 0; i < stocks.length; i++) {
	var stock = stocks[i];
	var tr = $('<tr data-href="../../stock.html?id=' + stock.id + '"></tr>');
	tr.append('<td>' + stock.name + '</td>');
	tr.append('<td>' + stock.text + '</td>');
	tr.append('<td>' + stock.code + '</td>');
	tr.append('<td>' + stock.maker + '</td>');
	tr.append('<td>' + stock.detail + '</td>');
	tr.append('<td style="text-align: right;">' + numberWithCommas(stock.price) + '</td>');
	tr.append('<td style="text-align: right;">' + stock.balance + '</td>');
	tr.append('<td>' + stock.unit + '</td>');
	tr.appendTo(tbody);
}

function setRowLinks(){
    // click event
    $('tbody > tr').css('cursor', 'pointer').on('click', function() {
        window.location = $(this).attr('data-href');
    });
}

setRowLinks();

var ordersremove = alasql('SELECT ordersremove.*,customers.whouse FROM ordersremove JOIN customers ON ordersremove.customer_id=customers.id WHERE customers.whouse=?',[loginID - 3]);
var ordersadd = alasql('SELECT ordersadd.*,suppliers.whouse FROM ordersadd JOIN suppliers ON ordersadd.supplier_id=suppliers.id WHERE suppliers.whouse=?',[loginID - 3]);

function populateSaleTable(){
    var tbody_orders = $('#tbody-sales-orders');
    tbody_orders.empty();
    for (var i = 0; i < ordersremove.length; i++) {
        var orderremove = ordersremove[i];
        var tr = $('<tr data-href="../sales/order.html?id=' + orderremove.id + '"></tr>');
        tr.append('<td>' + orderremove.id + '</td>');
        tr.append('<td>' + orderremove.customer_id + '</td>');

        tr.append('<td>' + getLabelForOrderStatus(orderremove.status) + '</td>');
        tr.appendTo(tbody_orders);
    }
    setRowLinks();
}


function populatePurchaseTable(){
    var tbody_orders = $('#tbody-purchases-orders');
    tbody_orders.empty();
    for (var i = 0; i < ordersadd.length; i++) {
        var orderadd = ordersadd[i];
        var tr = $('<tr data-href="../purchase/order.html?id=' + orderadd.id + '"></tr>');
        tr.append('<td>' + orderadd.id + '</td>');
        tr.append('<td>' + orderadd.supplier_id + '</td>');

        tr.append('<td>' + getLabelForOrderStatus(orderadd.status) + '</td>');
        tr.appendTo(tbody_orders);
    }
    setRowLinks();
}

populatePurchaseTable();
populateSaleTable();

function showOrders(type, status){
    if(type == 1){ // purchase orders (order add)
        if(status < 4){
            ordersadd = alasql('SELECT ordersadd.*,suppliers.whouse FROM ordersadd JOIN suppliers ON ordersadd.supplier_id=suppliers.id WHERE suppliers.whouse=? AND status=?',[loginID - 3, status]);
        }else{
            ordersadd = alasql('SELECT ordersadd.*,suppliers.whouse FROM ordersadd JOIN suppliers ON ordersadd.supplier_id=suppliers.id WHERE suppliers.whouse=?',[loginID - 3]);
        }
        populatePurchaseTable();
    }else{ // sales ( remove )
        if(status < 4){
            ordersremove = alasql('SELECT ordersremove.*,customers.whouse FROM ordersremove JOIN customers ON ordersremove.customer_id=customers.id WHERE customers.whouse=? AND status=?',[loginID - 3, status]);
        }else{
            ordersremove = alasql('SELECT ordersremove.*,customers.whouse FROM ordersremove JOIN customers ON ordersremove.customer_id=customers.id WHERE customers.whouse=?',[loginID - 3]);
        }
        populateSaleTable();
    }
    setRowLinks();
}

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}
