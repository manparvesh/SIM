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

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}

function setRowLinks(){
    // click event
    $('tbody > tr').css('cursor', 'pointer').on('click', function() {
        window.location = $(this).attr('data-href');
    });
}

function populateDefectiveProductsTable(){
    var tbody_returns = $('#tbody-defective');
    tbody_returns.empty();
    var returns = alasql('SELECT * FROM replacements where order_type=1'); //purchase order tha
    var rets = alasql('SELECT * FROM replacements  where order_type=1 GROUP BY order_id');
    
    co(rets);
    
    //co('order_remove:');
    //co(order_remove);
    var whouses = alasql('select * from whouse');
    for (var i = 0; i < rets.length; i++) {
        var ret1 = rets[i];
        var return1 = alasql('SELECT * FROM replacements where order_id=? and order_type=1',[ret1.order_id])[0];
        co(return1);
        if(return1.order_id){
            var temp_order_id = return1.order_id;
            var order_remove = alasql('select * from ordersadd where id=?',[temp_order_id])[0];
            var temp_customer_id = alasql('select * from ordersadd where id=?',[temp_order_id])[0].supplier_id;
            var temp_customer_name = alasql('select * from suppliers where id=?',[temp_customer_id])[0].name;

            var returnType = return1.replacement_type;
            var returnText;
            if(returnType == 1){
                returnText = 'Defective';
            }else{
                returnText = 'Not required';
            }

            //add these value to table
            var tr = $('<tr href="#defectiveDialog"  data-toggle="modal" data-href="#" onclick="populateModalReturnDetails('+return1.order_id+')"></tr>');
            tr.append('<td>' + return1.order_id + '</td>');
            tr.append('<td>' + temp_customer_name + '</td>');
            //tr.append('<td>' + returnText + '</td>');
            tr.append('<td>' + alasql('select * from whouse where id=?',[alasql('select * from suppliers where id=?',[temp_customer_id])[0].whouse])[0].name + '</td>');
            tr.append('<td>' + getLabelForOrderStatus(return1.status) + '</td>');

            tr.appendTo(tbody_returns);
        }
    }
    
    setRowLinks();
}

populateDefectiveProductsTable();

function populateModalReturnDetails(return_id){
    $('#modal-span-order-id').text(return_id);
        var temp_customer_id = alasql('select * from ordersadd where id=?',[return_id])[0].supplier_id;
        var temp_customer_name = alasql('select * from suppliers where id=?',[temp_customer_id])[0].name;
    $('#modal-span-customer').text(temp_customer_name);
    
    var modal_tbody_returns = $('#modal-tbody-returns');
    modal_tbody_returns.empty();
    var returns = alasql('SELECT * FROM replacements where order_id=? and order_type=1',[return_id]);
    co(returns);
    
    var returnType = returns[0].replacement_type;
    var returnText;
    if(returnType == 1){
        returnText = 'Defective';
    }else{
        returnText = 'Not required';
    }
    
    $('#modal-span-replacement-type').text(returnText);
    $('#modal-span-status').empty();
    $('#modal-span-status').append(getLabelForOrderStatus(returns[0].status));
    
    //co('order_remove:');
    //co(order_remove);
    var whouses = alasql('select * from whouse');
    for (var i = 0; i < returns.length; i++) {
        var return1 = returns[i];
        co(return1);
        
        var temp_whouse = alasql('select * from suppliers where id=?',[temp_customer_id])[0].whouse;
        var temp_whouse_name = alasql('select * from whouse where id=?',[temp_whouse])[0].name;
        
        var temp_product_id = return1.product_id;
        var temp_prod = alasql('select * from item where id=?',[temp_product_id])[0];
        var kind = alasql('select * from kind where id=?',[temp_prod.kind])[0].text;
        
        //add these value to table
        var tr = $('<tr href="#returnDialog"  data-toggle="modal" data-href="#" onclick="populateModalReturnDetails('+return1.order_id+')"></tr>');
        tr.append('<td>' + temp_whouse_name + '</td>');
        tr.append('<td>' + temp_prod.detail + '</td>');
        tr.append('<td>' + temp_prod.maker + '</td>');
        tr.append('<td>' + kind + '</td>');
        tr.append('<td>' + return1.quantity + '</td>');

        tr.appendTo(modal_tbody_returns);
    }
}