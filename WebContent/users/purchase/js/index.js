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

function setRowLinks(){
    // click event
    $('tbody > tr').css('cursor', 'pointer').on('click', function() {
        window.location = $(this).attr('data-href');
    });
}

//set order numbers in dashboard
var temporders = alasql('SELECT * FROM ordersadd WHERE status=?', [1]);
if(temporders.length){
    $('#well-orders').text(temporders.length);
}else{
    $('#well-orders').text('No');
}


// build html table for orders
var orders = alasql('SELECT * FROM ordersadd');

function populateOrderTable(){
    var tbody_orders = $('#tbody-purchase-orders');
    tbody_orders.empty();
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var tr = $('<tr data-href="order.html?id=' + order.id + '"></tr>');
        tr.append('<td>' + order.id + '</td>');
        tr.append('<td>' + order.supplier_id + '</td>');

        tr.append('<td>' + getLabelForOrderStatus(order.status) + '</td>');
        tr.appendTo(tbody_orders);
    }
    
    setRowLinks();
}

function populateSupplierTable(){
    var tbody_suppliers = $('#tbody-suppliers');
    tbody_suppliers.empty();
    var suppliers = alasql('SELECT * FROM suppliers');
    var whouses = alasql('select * from whouse');
    for (var i = 0; i < suppliers.length; i++) {
        var supplier = suppliers[i];
        var tr = $('<tr data-href="supplier.html?id=' + supplier.id + '"></tr>');
        tr.append('<td>' + supplier.id + '</td>');
        tr.append('<td>' + supplier.name + '</td>');
        tr.append('<td>' + supplier.addr + '</td>');
        tr.append('<td>' + supplier.contact + '</td>');
        tr.append('<td>' + whouses[supplier.whouse - 1].name + '</td>');
        tr.append('<td>' + supplier.delivery_time + '</td>');

        tr.appendTo(tbody_suppliers);
    }
    
    setRowLinks();
}

populateOrderTable();
populateSupplierTable();

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

DB.getRestockDates = function(n){
	var setting = alasql('SELECT start, duration FROM setting')[0];

	var start = moment(setting.start,'YYYY-MM-DD').format('D/M/YYYY');
	var result = [[start,"Start Date","#","#5da5e8",""]];
	for(var i = 0; i<n; i++){
		var date = moment(start,'D/M/YYYY').add(parseInt(setting.duration),'days').format('D/M/YYYY');
		result.push([date,"Restocking day","#","#00acac",""]);
		start = date;
	}
	return(result);
};

function handleScheduleCalendar(){
    var today=new Date,d = today.getDate(),m=today.getMonth()+1,y=today.getFullYear();
    var s = [['12/12/2016',"Start Date","#","#5da5e8",""]]; //DB.getRestockDates(100);
    s.push([d+"/"+m+"/"+y,"Today","#","#b6c832",""]);
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