var logins = alasql('SELECT * FROM logins');
console.log(logins.length);
console.log(logins[0].emp_id);
var loginID = logins[0].emp_id;
var user = alasql('SELECT * FROM users WHERE id=?',[logins[0].emp_id]);
console.log(user[0].name);

function getWHouseID(){
    return loginID - 3;
}

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

//console.log(sql);

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

var ordersremove = alasql('SELECT ordersremove.*,customers.whouse FROM ordersremove JOIN customers ON ordersremove.customer_id=customers.id WHERE customers.whouse=? and status=2',[loginID - 3]);
var ordersadd = alasql('SELECT ordersadd.*,suppliers.whouse FROM ordersadd JOIN suppliers ON ordersadd.supplier_id=suppliers.id WHERE suppliers.whouse=? and status=3',[loginID - 3]);


var table_in = $('#data-table-incoming').DataTable({
    "order":[[0,"desc"]],
    "iDisplayLength": 25,
    className: 'mdl-data-table__cell--non-numeric'
});
var table_out = $('#data-table-outgoing').DataTable({
    "order":[[0,"desc"]],
    "iDisplayLength": 25,
    className: 'mdl-data-table__cell--non-numeric'
});

function getPrettyDate(daaate){
    if(moment(daaate).format('LL') == 'Invalid date'){
        return '-';
    }
    return moment(daaate).format('LL');
}

//outgoing
function populateSaleTable(){
    table_out.destroy();
    
    var tbody_orders = $('#tbody-sales-orders');
    tbody_orders.empty();
    for (var i = 0; i < ordersremove.length; i++) {
        var orderremove = ordersremove[i];
        var tr = $('<tr data-href="../sales/order.html?id=' + orderremove.id + '"></tr>');
        tr.append('<td>' + orderremove.id + '</td>');
        tr.append('<td>' + alasql('select * from customers where id=?',[orderremove.customer_id])[0].name + '</td>');

        tr.append('<td>' + getLabelForOrderStatus(orderremove.status) + '</td>');
        
        tr.append('<td class="col-md-2" data-order='+ orderremove.date_received +'>' + getPrettyDate(orderremove.date_received) + '</td>'); //date 
        tr.append('<td class="col-md-2" data-order='+ orderremove.date_approved +'>' + getPrettyDate(orderremove.date_approved) + '</td>'); //date 
        tr.append('<td class="col-md-2" data-order='+ orderremove.date_shipped +'>' + getPrettyDate(orderremove.date_shipped) + '</td>'); //date 
        tr.append('<td class="col-md-2" data-order='+ orderremove.date_completed +'>' + getPrettyDate(orderremove.date_completed) + '</td>'); //date 
        
        tr.appendTo(tbody_orders);
    }
    setRowLinks();
    
    table_out = $('#data-table-outgoing').DataTable({
        "order":[[0,"desc"]],
        "iDisplayLength": 25,
        className: 'mdl-data-table__cell--non-numeric'
    });
}

//incoming
function populatePurchaseTable(){
    table_in.destroy();
    
    var tbody_orders = $('#tbody-purchases-orders');
    tbody_orders.empty();
    for (var i = 0; i < ordersadd.length; i++) {
        var orderadd = ordersadd[i];
        var tr = $('<tr class="" data-href="../purchase/order.html?id=' + orderadd.id + '"></tr>');
        
        tr.append('<td class="col-md-1">' + orderadd.id + '</td>'); // id
        tr.append('<td class="col-md-1">' + alasql('select * from suppliers where id=?',[orderadd.supplier_id])[0].name + '</td>'); //supplier name
        tr.append('<td class="col-md-1" data-order='+ orderadd.whouse +'>' + alasql('select * from whouse where id=?',[orderadd.whouse])[0].name + '</td>'); //warehouse
        tr.append('<td class="col-md-1" data-order='+ orderadd.status +'>' + getLabelForOrderStatus(orderadd.status) + '</td>'); //status

        tr.append('<td class="col-md-1" data-order='+ orderadd.date_received +'>' + getPrettyDate(orderadd.date_received) + '</td>'); //date 
        tr.append('<td class="col-md-1" data-order='+ orderadd.date_approved +'>' + getPrettyDate(orderadd.date_approved) + '</td>'); //date 
        tr.append('<td class="col-md-1" data-order='+ orderadd.date_shipped +'>' + getPrettyDate(orderadd.date_shipped) + '</td>'); //date 
        tr.append('<td class="col-md-1" data-order='+ orderadd.date_completed +'>' + getPrettyDate(orderadd.date_completed) + '</td>'); //date 
        
        tr.appendTo(tbody_orders);
    }
    setRowLinks();
    
    table_in = $('#data-table-incoming').DataTable({
        "order":[[0,"desc"]],
        "iDisplayLength": 25,
        className: 'mdl-data-table__cell--non-numeric'
    });
}

populatePurchaseTable();
populateSaleTable();

function showOrders(type, status){
    if(type == 1){ // purchase orders (order add)
        if(status < 5){
            ordersadd = alasql('SELECT ordersadd.*,suppliers.whouse FROM ordersadd JOIN suppliers ON ordersadd.supplier_id=suppliers.id WHERE suppliers.whouse=? AND status=?',[loginID - 3, status]);
        }else{
            ordersadd = alasql('SELECT ordersadd.*,suppliers.whouse FROM ordersadd JOIN suppliers ON ordersadd.supplier_id=suppliers.id WHERE suppliers.whouse=?',[loginID - 3]);
        }
        populatePurchaseTable();
    }else{ // sales ( remove )
        if(status < 5){
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

function getWHNameFromID(id){
    return alasql('select * from whouse where id=?',[id])[0].name;
}

var dataTablesRestocking = $('#data-table-restocking').DataTable({
                "order":[[0,"desc"]],
                "iDisplayLength": 25,
                className: 'mdl-data-table__cell--non-numeric'
            });

function populateRestockingTable(){
    
    dataTablesRestocking.destroy();
    
    var temp_whouse_id = loginID - 3;

    var restocks = alasql('select * from restock where whouse_from=? or whouse_to=?',[temp_whouse_id, temp_whouse_id]);
    
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = yyyy+'-'+mm+'-'+dd;
    
	var date = today;
    
    var modal_tbody_restock = $('#tbody-restocking-orders');
    modal_tbody_restock.empty();
    
    for(var i=0;i<restocks.length;i++){
        var restock = restocks[i];
        co(restock)
        
        var prod = alasql('select * from item where id=?',[restock.product_id])[0].detail;
        
        //ID,PRODUCT_ID,WHOUSE_FROM,WHOUSE_TO,QUANTITY,STATUS
        var tr = $('<tr data-href="#"></tr>');
        tr.append('<td class="text-center">' + restock.id + '</td>');
        tr.append('<td class="text-center">' + prod + '</td>');
        tr.append('<td class="text-center">' + getWHNameFromID(restock.whouse_from) + '</td>');
        tr.append('<td class="text-center">' + getWHNameFromID(restock.whouse_to) + '</td>');
        tr.append('<td class="text-center">' + restock.quantity + '</td>');
        tr.append('<td class="text-center">' + getLabelForOrderStatus(restock.status) + '</td>');
        
        if(restock.status == 1 && temp_whouse_id == restock.whouse_from){
            tr.append('<td class="text-center"><a style="cursor:pointer;" id="' + restock.id + '-setOrderToShippedLabel">' + getLabelForOrderStatus(3) + '</a></td>');
        }else if(restock.status == 3 && temp_whouse_id == restock.whouse_to){
            tr.append('<td class="text-center"><a style="cursor:pointer;" id="' + restock.id + '-setOrderToCompleteLabel">' + getLabelForOrderStatus(4) + '</a></td>');
        }else{
            tr.append('<td></td>');
        }

        tr.appendTo(modal_tbody_restock);
        
        if($('#' + restock.id+'-setOrderToShippedLabel')){
            $('#' + restock.id+'-setOrderToShippedLabel').on('click', function(){
                var temp = parseInt($(this).attr('id'));
                var temp_restock = alasql('select * from restock where id=?',[temp])[0];
                var restock_id = temp; 
                alasql('UPDATE restock SET status = ? WHERE id = ?', [ 3, restock_id ]);
                //co(restock_id)
                //update this in other tables
                var prod_dets = alasql('select * from stock where item=? and whouse=?',[temp_restock.product_id, temp_restock.whouse_from])[0];
                var balance = prod_dets.balance;
                var qty = temp_restock.quantity;
                
                alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance - qty, prod_dets.id ]);
                
                // add trans record
                var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                var memo = 'Restocking order from '+getWHNameFromID(temp_restock.whouse_from)+' to ' + getWHNameFromID(temp_restock.whouse_to);
                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, prod_dets.id, date, -qty, balance - qty, memo ]);
                
                populateRestockingTable();
            });
        }
        
        if($('#' + restock.id+'-setOrderToCompleteLabel')){
            $('#' + restock.id+'-setOrderToCompleteLabel').on('click', function(){
                var temp = parseInt($(this).attr('id'));
                var temp_restock = alasql('select * from restock where id=?',[temp])[0];
                alasql('UPDATE restock SET status = ? WHERE id = ?', [ 4, temp ]);
                
                //update this in other tables
                var prod_dets = alasql('select * from stock where item=? and whouse=?',[temp_restock.product_id, restock.whouse_to])[0];
                var balance = prod_dets.balance;
                var qty = temp_restock.quantity;
                
                alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, prod_dets.id ]);
                
                // add trans record
                var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
                var memo = 'Restocking order from '+getWHNameFromID(temp_restock.whouse_from)+' to ' + getWHNameFromID(temp_restock.whouse_to);
                alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, prod_dets.id, date, qty, balance + qty, memo ]);

                populateRestockingTable();
            });
        }
    }
    
    dataTablesRestocking = $('#data-table-restocking').DataTable({
                "order":[[0,"desc"]],
                "iDisplayLength": 25,
                className: 'mdl-data-table__cell--non-numeric'
            });
}

populateRestockingTable();

function handleScheduleCalendar(){
    var today=new Date,d = today.getDate(),m=today.getMonth()+1,y=today.getFullYear();
    var s = []; //DB.getRestockDates(100);
    s.push([d+"/"+m+"/"+y,"Today","#","#009688",""]);
    
    // order out shipping date
    var tempOutgoingOrders = alasql('select ordersremove.*, customers.whouse from ordersremove join customers on customers.id=ordersremove.customer_id where status=2 and whouse=?',[getWHouseID()]);
    for(var i=0;i<tempOutgoingOrders.length;i++){
        var ord = tempOutgoingOrders[i];
        var dt = new Date(ord.date_shipped);
        s.push([dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear(), 'Outgoing order #'+ ord.id +' estimated shipping date',"../sales/order.html?id="+ord.id,"#ff0000",""]);
    }
    
    // order out completion date
    var tempOutgoingOrders = alasql('select ordersremove.*, customers.whouse from ordersremove join customers on customers.id=ordersremove.customer_id where status=3 and whouse=?',[getWHouseID()]);
    for(var i=0;i<tempOutgoingOrders.length;i++){
        var ord = tempOutgoingOrders[i];
        var dt = new Date(ord.date_completed);
        s.push([dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear(), 'Outgoing order #'+ ord.id +' estimated completed date',"../sales/order.html?id="+ord.id,"#ff9300",""]);
    }
    
    // order in completion date
    var tempInComingOrders = alasql('select * from ordersadd where status=3 and whouse=?',[getWHouseID()]);
    for(var i=0;i<tempInComingOrders.length;i++){
        var ord = tempInComingOrders[i];
        var dt = new Date(ord.date_completed);
        s.push([dt.getDate() + '/' + (dt.getMonth() + 1) + '/' + dt.getFullYear(), 'Incoming order #'+ ord.id +' estimated completion date',"../purchase/order.html?id="+ord.id,"#00e800",""]);
    }
    
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

//set order numbers in dashboard
var temp_add_orders = alasql('SELECT * FROM ordersadd where status=3 and whouse=?',[getWHouseID()]);
if(temp_add_orders.length){
    $('#in-orders').text(temp_add_orders.length);
    $('#well-in').css('background-color','rgb(1, 200, 208)');
    $('#well-in').css('color','white');
}else{
    $('#in-orders').text('No');
}//set order numbers in dashboard
var temp_remove_orders = alasql('SELECT * FROM ordersremove join customers on customers.id=ordersremove.customer_id where status=2 and customers.whouse=?',[getWHouseID()]);
if(temp_remove_orders.length){
    $('#out-orders').text(temp_remove_orders.length);
    $('#well-out').css('background-color','#009688');
    $('#well-out').css('color','white');
}else{
    $('#out-orders').text('No');
}//set order numbers in dashboard
var temp_restock_orders = alasql('SELECT * FROM restock where (whouse_from=? or whouse_to=?) and status<4 ',[getWHouseID(), getWHouseID()]);
if(temp_restock_orders.length){
    $('#restocking-requests').text(temp_restock_orders.length);
    $('#well-restock').css('background-color','#ff9703');
    $('#well-restock').css('color','white');
}else{
    $('#restocking-requests').text('No');
}