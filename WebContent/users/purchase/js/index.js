var logins = alasql('SELECT * FROM logins');
console.log(logins.length);
console.log(logins[0].emp_id);
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

// click event
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});

// build html table for orders
var orders = alasql('SELECT * FROM ordersadd');

function populateOrderTable(){
    var tbody_orders = $('#tbody-purchase-orders');
    tbody_orders.empty();
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var tr = $('<tr></tr>');
        tr.append('<td>' + order.id + '</td>');
        tr.append('<td>' + order.supplier_id + '</td>');

        tr.append('<td>' + getLabelForOrderStatus(order.status) + '</td>');
        tr.appendTo(tbody_orders);
    }
}

populateOrderTable();

function showOrders(n){
    switch(n){
        case 1:
            orders = alasql('SELECT * FROM ordersadd WHERE status=?', [1]);
            break;
        case 2:
            orders = alasql('SELECT * FROM ordersadd WHERE status=?', [2]);
            break;
        case 3:
            orders = alasql('SELECT * FROM ordersadd WHERE status=?', [3]);
            break;
        case 4:
            orders = alasql('SELECT * FROM ordersadd');
            break;
    }
    console.log(orders.length);
    populateOrderTable();
}

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}