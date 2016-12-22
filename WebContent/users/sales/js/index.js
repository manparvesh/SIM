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

//set order numbers in dashboard
var temporders = alasql('SELECT * FROM ordersremove WHERE status=?', [1]);
if(temporders.length){
    $('#well-orders').text(temporders.length);
}else{
    $('#well-orders').text('No');
}

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
// build html table for orders
var orders = alasql('SELECT * FROM ordersremove where status=1');

function populateOrderTable(){
    var tbody_orders = $('#tbody-sales-orders');
    tbody_orders.empty();
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var tr = $('<tr data-href="order.html?id=' + order.id + '"></tr>');
        tr.append('<td>' + order.id + '</td>');
        tr.append('<td>' + order.customer_id + '</td>');

        tr.append('<td>' + getLabelForOrderStatus(order.status) + '</td>');
        tr.appendTo(tbody_orders);
    }
    setRowLinks();
}

function populateCustomerTable(){
    var tbody_customers = $('#tbody-customers');
    tbody_customers.empty();
    var customers = alasql('SELECT * FROM customers');
    var whouses = alasql('select * from whouse');
    for (var i = 0; i < customers.length; i++) {
        var customer = customers[i];
        var tr = $('<tr data-href="customer.html?id=' + customer.id + '"></tr>');
        tr.append('<td>' + customer.id + '</td>');
        tr.append('<td>' + customer.name + '</td>');
        tr.append('<td>' + customer.addr + '</td>');
        tr.append('<td>' + customer.contact + '</td>');
        tr.append('<td>' + whouses[customer.whouse - 1].name + '</td>');

        tr.appendTo(tbody_customers);
    }
    
    setRowLinks();
}

populateOrderTable();
populateCustomerTable();

function showOrders(n){
    switch(n){
        case 1:
            orders = alasql('SELECT * FROM ordersremove WHERE status=?', [1]);
            break;
        case 2:
            orders = alasql('SELECT * FROM ordersremove WHERE status=?', [2]);
            break;
        case 3:
            orders = alasql('SELECT * FROM ordersremove WHERE status=?', [3]);
            break;
        case 4:
            orders = alasql('SELECT * FROM ordersremove WHERE status=?', [4]);
            break;
        case 5:
            orders = alasql('SELECT * FROM ordersremove');
            break;
    }
    console.log(orders.length);
    populateOrderTable();
}

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}

function handleScheduleCalendar(){
    var today=new Date,d = today.getDate(),m=today.getMonth()+1,y=today.getFullYear();
    var s = []; //DB.getRestockDates(100);
    s.push([d+"/"+m+"/"+y,"Today","#","#009688",""]);
    var o=$("#schedule-calendar");
    $(o).calendar({events:s,tooltip_options:{placement:"top",html:true}});
    $(o).find("td.event").each(
            function(){var e=$(this).css("background-color");
                $(this).removeAttr("style");
                $(this).find("a").css("background-color",e)
            });
    $(o).find(".icon-arrow-left, .icon-arrow-right").parent().on("click",function(){$(o).find("td.event").each(function(){var e=$(this).css("background-color");$(this).removeAttr("style");$(this).find("a").css("background-color",e)})})
}

handleScheduleCalendar();

function populateReturnsTable(){
    var tbody_returns = $('#tbody-returns');
    tbody_returns.empty();
    var returns = alasql('SELECT * FROM replacements where order_type=2');
    var rets = alasql('SELECT * FROM replacements where order_type=2 GROUP BY order_id');
    
    //co('order_remove:');
    //co(order_remove);
    var whouses = alasql('select * from whouse');
    for (var i = 0; i < rets.length; i++) {
        var ret1 = rets[i];
        var return1 = alasql('SELECT * FROM replacements where order_id=? and order_type=2',[ret1.order_id])[0];
        if(return1){
            var temp_order_id = return1.order_id;
            var order_remove = alasql('select * from ordersremove where id=?',[temp_order_id])[0];
            var temp_customer_id = alasql('select * from ordersremove where id=?',[temp_order_id])[0].customer_id;
            var temp_customer_name = alasql('select * from customers where id=?',[temp_customer_id])[0].name;

            var returnType = return1.replacement_type;
            var returnText;
            if(returnType == 1){
                returnText = 'Defective';
            }else{
                returnText = 'Not required';
            }

            //add these value to table
            var tr = $('<tr href="#returnDialog"  data-toggle="modal" data-href="#" onclick="populateModalReturnDetails('+return1.order_id+')"></tr>');
            tr.append('<td>' + return1.order_id + '</td>');
            tr.append('<td>' + temp_customer_name + '</td>');
            tr.append('<td>' + returnText + '</td>');
            tr.append('<td>' + getLabelForOrderStatus(return1.status) + '</td>');

            tr.appendTo(tbody_returns);
        }
    }
    
    setRowLinks();
}

populateReturnsTable();

function populateModalReturnDetails(return_id){
    $('#modal-span-order-id').text(return_id);
        var temp_customer_id = alasql('select * from ordersremove where id=?',[return_id])[0].customer_id;
        var temp_customer_name = alasql('select * from customers where id=?',[return_id])[0].name;
    $('#modal-span-customer').text(temp_customer_name);
    
    var modal_tbody_returns = $('#modal-tbody-returns');
    modal_tbody_returns.empty();
    var returns = alasql('SELECT * FROM replacements where order_id=? and order_type=2',[return_id]);
    
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
        
        var temp_whouse = alasql('select * from customers where id=?',[temp_customer_id])[0].whouse;
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