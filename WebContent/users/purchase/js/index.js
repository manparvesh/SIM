var logins = alasql('SELECT * FROM logins');
//console.log(logins.length);
//console.log(logins[0].emp_id);
var user = alasql('SELECT * FROM users WHERE id=?',[logins[0].emp_id]);
//console.log(user[0].name);

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
var q1;// = parseInt($.url().param('q1') || '0');
//$('select[name="q1"]').val(q1);
var q2;// = parseInt($.url().param('q2') || '0');
//$('select[name="q2"]').val(q2);
var q3;// = $.url().param('q3') || '';
//$('input[name="q3"]').val(q3);

// build sql
var sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, stock.balance, item.unit \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind';

// send query
var stocks = alasql(sql);
//co(stocks);
$('#tbody-stocks').empty();

$('#btn-search').on('click', function(){
    $('#tbody-stocks').empty();
    
    sql = 'SELECT stock.id, whouse.name, kind.text, item.code, item.maker, item.detail, item.price, stock.balance, item.unit \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

    co($('select[name="q1"]').val());
    co($('select[name="q2"]').val());
    co($('input[name="q3"]').val());
    
    q1 = parseInt($('select[name="q1"]').val())+1;
    q2 = parseInt($('select[name="q2"]').val())+1;
    q3 = $('input[name="q3"]').val();
    
    sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
    sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';
    
    stocks = alasql(sql, [ '%' + q3 + '%' ]);
});

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
var temporders = alasql('SELECT * FROM requirements');
if(temporders.length){
    $('#well-orders').text(temporders.length);
}else{
    $('#well-orders').text('No');
}//set order numbers in dashboard
var temporders = alasql('SELECT * FROM restock');
if(temporders.length){
    $('#restocking-requests').text(temporders.length);
}else{
    $('#restocking-requests').text('No');
}//set order numbers in dashboard
var temporders = alasql('SELECT * FROM replacements where replacement_type=2');
if(temporders.length){
    $('#products').text(temporders.length);
}else{
    $('#products').text('No');
}


// build html table for orders
var orders = alasql('SELECT * FROM ordersadd WHERE status=1');

function getPrettyDate(daaate){
    if(moment(daaate).format('LL') == 'Invalid date'){
        return '-';
    }
    return moment(daaate).format('LL');
}

var table_orders = $('#data-table-orders').DataTable({
                "order":[[0,"desc"]],
                "iDisplayLength": 25,
                className: 'mdl-data-table__cell--non-numeric'
            });


function populateOrderTable(){
    table_orders.destroy();
    
    var tbody_orders = $('#tbody-purchase-orders');
    tbody_orders.empty();
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var tr = $('<tr data-href="order.html?id=' + order.id + '"></tr>');
        tr.append('<td class="col-md-1">' + order.id + '</td>'); // id
        tr.append('<td class="col-md-1">' + alasql('select * from suppliers where id=?',[order.supplier_id])[0].name + '</td>'); //supplier name
        tr.append('<td class="col-md-1" data-order='+ order.whouse +'>' + alasql('select * from whouse where id=?',[order.whouse])[0].name + '</td>'); //warehouse
        tr.append('<td class="col-md-1" data-order='+ order.status +'>' + getLabelForOrderStatus(order.status) + '</td>'); //status

        tr.append('<td class="col-md-1" data-order='+ order.date_received +'>' + getPrettyDate(order.date_received) + '</td>'); //date 
        tr.append('<td class="col-md-1" data-order='+ order.date_approved +'>' + getPrettyDate(order.date_approved) + '</td>'); //date 
        tr.append('<td class="col-md-1" data-order='+ order.date_shipped +'>' + getPrettyDate(order.date_shipped) + '</td>'); //date 
        tr.append('<td class="col-md-1" data-order='+ order.date_completed +'>' + getPrettyDate(order.date_completed) + '</td>'); //date 

        tr.appendTo(tbody_orders);
    }
    
    setRowLinks();
    
    table_orders = $('#data-table-orders').DataTable({
                "order":[[0,"desc"]],
                "iDisplayLength": 25,
                className: 'mdl-data-table__cell--non-numeric'
            });
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
            orders = alasql('SELECT * FROM ordersadd WHERE status=?', [4]);
            break;
        case 5:
            orders = alasql('SELECT * FROM ordersadd');
            break;
    }
    console.log('length: ' + orders.length);
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
    var s = [
        ['29/12/2016',"Monthly restocking","restock.html","#ff9703",""],
        ['30/12/2016',"Add monthly stock","neworder.html?type=monthly","#3bc8f2",""],
        ['29/1/2017',"Monthly restocking","restock.html","#ff9703",""],
        ['30/1/2017',"Add monthly stock","neworder.html?type=monthly","#3bc8f2",""],
        ['27/2/2017',"Monthly restocking","restock.html","#ff9703",""],
        ['28/2/2017',"Add monthly stock","neworder.html?type=monthly","#3bc8f2",""]
            ]; //DB.getRestockDates(100);
    //s.push();
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

function populateRequirementsTable(){
    var tbody_requirements = $('#tbody-requirements');
    tbody_requirements.empty();
    var requirements = alasql('SELECT * FROM requirements group by order_id');
    co('requirements:')
    co(requirements);
    var whouses = alasql('select * from whouse');
    for (var i = 0; i < requirements.length; i++) {
        var requirement = requirements[i];
        if(requirement.order_id){
            var tr = $('<tr onclick="putValuesInRequirementModal(' + requirement.order_id + ')" data-href="#" href="#requirementDialog"  data-toggle="modal"></tr>');
            tr.append('<td>' + requirement.order_id + '</td>');
            var temp_order_id = requirement.order_id;
            co(alasql('select * from ordersremove where id=?',[requirement.order_id]));
            co(requirement);
            //co(alasql('select * from ordersremove'));
            var temp_customer_id = alasql('select * from ordersremove where id=?',[requirement.order_id])[0].customer_id;
            var temp_whouse_id = alasql('select * from customers where id=?',[temp_customer_id])[0].whouse;
            //co(requirement.order_id);
            //co(temp_whouse_id);
            //co(alasql('select * from ordersremove'));
            var temp_whouse_name = alasql('select * from whouse where id=?',[temp_whouse_id])[0].name;
            tr.append('<td>' + temp_whouse_name + '</td>');
            //co(requirement);
            //co(alasql('select * from ordersremove where id=?',[requirement.order_id])[0]);
            var temp_status = alasql('select * from requirements where order_id=?',[requirement.order_id])[0].status;
            tr.append('<td>' + getLabelForOrderStatus(temp_status) + '</td>');

            tr.appendTo(tbody_requirements);
        }
    }
    
    setRowLinks();
}

populateRequirementsTable();

function putValuesInRequirementModal(id){
    var requirements = alasql('select * from requirements where order_id=?',[id]);
    $('#modal-span-order-id').text(id);
    co(requirements);
    var temp_customer_id = alasql('select * from ordersremove where id=?',[id])[0].customer_id;
    var temp_customer_name = alasql('select * from customers where id=?',[temp_customer_id])[0].name;
    $('#modal-span-customer').text(temp_customer_name);
    
    //set onclick function to new purchase order button
    $('#doneReq').attr('onclick','placeNewPurchaseOrder('+id+')');
    
    
    var temp_whouse_name = alasql('select * from whouse');
    
    var tbody_modal_req = $('#modal-tbody-requirement');
    tbody_modal_req.empty();
    
    //table
    for(var i=0;i<requirements.length;i++){
        var req = requirements[i];
        if(req){
            var product = alasql('select * from item where id=?',[req.product_id])[0];
            co(product);
            var kind = alasql('select * from kind where id=?',[product.kind])[0];
            var tr = $('<tr></tr>');
            tr.append('<td>' + temp_whouse_name[req.whouse - 1].name + '</td>');
            tr.append('<td>' + product.maker + '</td>');
            tr.append('<td>' + kind.text + '</td>');
            tr.append('<td>' + product.detail + '</td>');
            tr.append('<td>' + req.req + '</td>');
            tr.append('<td>' + req.quantity + '</td>');

            tr.appendTo(tbody_modal_req);
        }
    }
    
    if(requirements[0].status == 8){//req order placed
        $('#doneReq').hide();
        $('#req-order-placed').show();
        
        var order_add_id = requirements[0].order_add_id;
        $('#view-completed-order').attr('href','order.html?id='+order_add_id);
    }
}



function placeNewPurchaseOrder(id){
    co(id);
    //do something here
    window.location.assign('neworder.html?type=req&id='+id);
}

function populateDefectiveProductsTable(){
    var tbody_returns = $('#tbody-defective'); 
    tbody_returns.empty();
    var returns = alasql('SELECT * FROM replacements where order_type=1'); //purchase order tha
    var rets = alasql('SELECT * FROM replacements  where order_type=1 GROUP BY order_id');
    
    //co(rets);
    
    //co('order_remove:');
    //co(order_remove);
    var whouses = alasql('select * from whouse');
    for (var i = 0; i < rets.length; i++) {
        var ret1 = rets[i];
        var return1 = alasql('SELECT * FROM replacements where order_id=? and order_type=1',[ret1.order_id])[0];
        //co(return1);
        if(return1){
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
        var tr = $('<tr href="#returnDialog"  data-toggle="modal" data-href="#"></tr>');
        tr.append('<td>' + temp_whouse_name + '</td>');
        tr.append('<td>' + temp_prod.detail + '</td>');
        tr.append('<td>' + temp_prod.maker + '</td>');
        tr.append('<td>' + kind + '</td>');
        tr.append('<td>' + return1.quantity + '</td>');

        tr.appendTo(modal_tbody_returns);
    }
    
    $('#setReturnStatus').on('click',function(){
        alasql('UPDATE replacements SET status = ? where order_id=? and order_type=1', [ 6, return_id ]);
        
        window.location.assign('index.html');
    });
    
    if(returns[0].status == 6){
        $('#setReturnStatus').hide();
    }
}

function getWHNameFromID(id){
    return alasql('select * from whouse where id=?',[id])[0].name;
}

function populateRestockingTable(){
    var restocks = alasql('select * from restock');
    
    var modal_tbody_restock = $('#tbody-restocking-orders');
    modal_tbody_restock.empty();
    
    for(var i=0;i<restocks.length;i++){
        var restock = restocks[i];
        
        var prod = alasql('select * from item where id=?',[restock.product_id])[0].detail;
        
        //ID,PRODUCT_ID,WHOUSE_FROM,WHOUSE_TO,QUANTITY,STATUS
        var tr = $('<tr data-href="#"></tr>');
        tr.append('<td>' + restock.id + '</td>');
        tr.append('<td>' + prod + '</td>');
        tr.append('<td>' + getWHNameFromID(restock.whouse_from) + '</td>');
        tr.append('<td>' + getWHNameFromID(restock.whouse_to) + '</td>');
        tr.append('<td>' + restock.quantity + '</td>');
        tr.append('<td>' + getLabelForOrderStatus(restock.status) + '</td>');

        tr.appendTo(modal_tbody_restock);
        
    }
}

populateRestockingTable();