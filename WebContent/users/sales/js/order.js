var loginID = alasql('select * from logins')[0].emp_id;
var orderID = parseInt($.url().param('id') || '0');
if(orderID){
    //alert(orderID);
}else{
    alert('Please select an order first');
    $('#everything').empty();
    $('#everything').append('<a class="btn btn-raised btn-warning" href="/">Click here to return to the previous page</a>');
}

var returnType = 1;
var requirement = false;

var order = alasql('SELECT * FROM ordersremove WHERE id=?', [orderID])[0];

co('order:')
co(order);
co('order details:')
co(alasql('select * from ordersremovedetails where order_id=?',[orderID]));

//co(alasql('select * from customers where id=?',[order.customer_id]));

// put details of order
$('#order-id').text(orderID);
var temp_whouse_id = alasql('select * from customers where id=?',[order.customer_id])[0].whouse;
$('#waarehouse').text(alasql('select * from whouse where id=?',[temp_whouse_id])[0].name);
$('#customer-id').text(alasql('select * from customers where id=?',[order.customer_id])[0].name);
$('#status').empty();
$('#status').append(getLabelForOrderStatus(order.status));

var status = order.status;
if(status > 1){ //2 or more
    $('#new-order .line').css('background-color','#4caf50');
    $('#order-approved .imgcircle').css('background-color','#4caf50');
    $('#span-2').show();
    $('#btn-approve-order').hide();
    if(loginID >3 && status == 2){
        $('#btn-ship-order').show();
    }else{
        $('#btn-ship-order').hide();
    }
    
    if(status > 2){ //3 or more
        $('#order-approved .line').css('background-color','#4caf50');
        $('#order-shipped .imgcircle').css('background-color','#4caf50');
        $('#span-3').show();
        $('#btn-ship-order').hide();
        
        if(loginID >3 && status == 3){
            $('#btn-complete').show();
        }else{
            $('#btn-complete').hide();
        }
    }
    
    if(status > 3){ //complete
        $('#order-shipped .line').css('background-color','#4caf50');
        $('#order-complete .imgcircle').css('background-color','#4caf50');
        $('#span-4').show();
        $('#btn-ship-order').hide();
        $('#btn-return').show();
        
        if(loginID >3){
            $('#btn-return').hide();
        }
        
    }
    if(status > 4){ // refund init
        $('#btn-return').hide();
        $('#refund-initiated').show();
        $('#order-complete .line').show();
        $('#refund-track').show();
        
    }
    if(status > 5){//return complete
        $('#span-5').show();
        $('#refund-complete').show();
    }
    
    //cancelled
    if(status == 9){
        $('.content3').hide();
    }
}

var details = alasql('SELECT * FROM ordersremovedetails WHERE order_id=?',[orderID]);
//co(details);

function getPrettyDate(daaate){
    return moment(daaate).format('LL');
}

function getShortPrettyDate(daaate){
    return moment(daaate).format('ll');
}

// set shipping details
$('#address').empty();
$('#address').append('<strong>'+alasql('select * from customers where id=?',[order.customer_id])[0].name+'</strong>');
$('#address').append('<p>'+alasql('select * from customers where id=?',[order.customer_id])[0].addr+'</p>');

$('#date-1').text(getPrettyDate(order.date_received));
if(status>1){
    $('#date-2').text(getPrettyDate(order.date_approved));
}else{
    $('#date-2').text(getPrettyDate(order.date_approved) + ' (expected)');
}
if(status>2){
    $('#date-3').text(getPrettyDate(order.date_shipped));
}else{
    $('#date-3').text(getPrettyDate(order.date_shipped) + ' (expected)');
}
if(status>3){
    $('#date-4').text(getPrettyDate(order.date_completed));
}else{
    $('#date-4').text(getPrettyDate(order.date_completed) + ' (expected)');
}

function getAvailability(thisQuantity, whouseQuantity){
    if(thisQuantity < whouseQuantity){
        return '<span class="label label-success">Available</span>';
    }else{
        return '<span class="label label-danger">Short by '+ (thisQuantity-whouseQuantity) + ' pieces</span>';
    }
}

function populateTable(){
    var tbody_order_details = $('#tbody-sales-order-details');
    tbody_order_details.empty();
    var products = alasql('SELECT * FROM item');
    
    var thead_order_details = $('#thead-sales-order-details');
    thead_order_details.empty();
    
    details = alasql('SELECT * FROM ordersremovedetails WHERE order_id=?',[orderID]);
    
    var total = 0;
    
    if(status>1){
        thead_order_details.append('\
                                   <tr> \
                            <th class="col-md-1">ID</th>\
                            <th class="col-md-2">Kind</th>\
                            <th class="col-md-2">Manufacturer</th>\
                            <th class="col-md-3">Product</th>\
                            <th class="col-md-2">Quantity</th>\
                            <th class="col-md-2">Price (in JP¥)</th>\
                        </tr>\
                                   ');
        
        for (var i = 0; i < details.length; i++) {
            var detail = details[i];
            var product = products[detail.product_id - 1];
            var kind = alasql('select * from kind where id = ?',[product.kind])[0].text;
            var tr = $('<tr></tr>');
            tr.append('<td class="col-md-1">' + detail.id + '</td>');
            tr.append('<td class="col-md-2">' + kind + '</td>');
            tr.append('<td class="col-md-2">' + product.maker + '</td>');
            tr.append('<td class="col-md-3">' + product.detail + '</td>');
            tr.append('<td class="col-md-2">' + detail.quantity + '</td>');
            tr.append('<td class="col-md-2">' + numberWithCommas(detail.quantity*product.price) + '</td>');
            total += detail.quantity*product.price;
            
            tr.appendTo(tbody_order_details);
        }
        
        tbody_order_details.append('<tr>\
                    <td></td>\
                    <td></td>\
                    <td></td>\
                    <td></td>\
                    <th>Total (in JP¥):</th>\
                    <th>'+ numberWithCommas(total) +'</th>\
                    </tr>');
    }else{
        thead_order_details.append('\
                   <tr> \
            <th class="col-md-1">ID</th>\
            <th class="col-md-2">Kind</th>\
            <th class="col-md-2">Manufacturer</th>\
            <th class="col-md-2">Product</th>\
            <th class="col-md-1">Quantity</th>\
            <th class="col-md-2">Price (in JP¥)</th>\
            <th class="col-md-2">Availability</th>\
        </tr>\
                   ');
        
        for (var i = 0; i < details.length; i++) {
            var detail = details[i];
            if(1){
                var product = products[detail.product_id - 1];
                var kind = alasql('select * from kind where id = ?',[product.kind])[0].text;
                var tr = $('<tr></tr>');
                tr.append('<td class="col-md-1">' + detail.id + '</td>');
                tr.append('<td class="col-md-2">' + kind + '</td>');
                tr.append('<td class="col-md-2">' + product.maker + '</td>');
                tr.append('<td class="col-md-2">' + product.detail + '</td>');
                tr.append('<td class="col-md-1">' + detail.quantity + '</td>');
                tr.append('<td class="col-md-2">' + numberWithCommas(detail.quantity*product.price) + '</td>');
                co(product.id + ' ' + temp_whouse_id);
                var temp_whouse_q = alasql('select * from stock where item=? and whouse=?',[product.id, temp_whouse_id])[0].balance;
                if(detail.quantity > temp_whouse_q){
                    requirement = true;
                }
                tr.append('<td class="col-md-2">' + getAvailability(detail.quantity, temp_whouse_q) + '</td>');
                tr.appendTo(tbody_order_details);
                total += detail.quantity*product.price;
            }
        }
        tbody_order_details.append('<tr>\
                    <td></td>\
                    <td></td>\
                    <td></td>\
                    <td></td>\
                    <th>Total (in JP¥):</th>\
                    <th>'+ numberWithCommas(total) +'</th>\
                    <td></td>\
                    </tr>');
    }
}

function populateModalTable(){
    var modal_tbody_order_details = $('#modal-tbody-sales-order-details');
    var products = alasql('SELECT * FROM item');
    modal_tbody_order_details.empty();
    for (var i = 0; i < details.length; i++) {
        var detail = details[i];
        var product = products[detail.product_id - 1];
        var kind = alasql('select * from kind where id = ?',[product.kind])[0].text;
        var tr = $('<tr></tr>');
        tr.append('<td class="col-md-1">' + detail.id + '</td>');
        tr.append('<td class="col-md-2">' + kind + '</td>');
        tr.append('<td class="col-md-2">' + product.maker + '</td>');
        tr.append('<td class="col-md-3">' + product.detail + '</td>');
        tr.append('<td class="col-md-2">' + detail.quantity + '</td>');
        tr.append('<td class="col-md-2"><input type="number" min="0" class="form-control" name="qty" value="0" id="row-' + (i+1) + '-quantity" max="' + detail.quantity + '" min="0" style="margin:0px;"></td>');
        tr.appendTo(modal_tbody_order_details);
    }
}

populateTable();
populateModalTable();

function setRequirementTable(){
    var modal_tbody_requirement = $('#modal-tbody-requirement');
    var products = alasql('SELECT * FROM item');
    modal_tbody_requirement.empty();
    for (var i = 0; i < details.length; i++) {
        var detail = details[i];
        var product = products[detail.product_id - 1];
        var kind = alasql('select * from kind where id = ?',[product.kind])[0].text;
        var temp_whouse_q = alasql('select * from stock where item=? and whouse=?',[product.id, temp_whouse_id])[0].balance;
        var whouse_name = alasql('select * from whouse where id=?',[temp_whouse_id])[0].name;
        co(detail.quantity + ' ' + temp_whouse_q);
        if(detail.quantity > temp_whouse_q){
            var tr = $('<tr></tr>');
            tr.append('<td class="col-md-2">' + whouse_name + '</td>');
            tr.append('<td class="col-md-2">' + product.maker + '</td>');
            tr.append('<td class="col-md-2">' + kind + '</td>');
            tr.append('<td class="col-md-2">' + product.detail + '</td>');
            tr.append('<td class="col-md-2">' + (detail.quantity-temp_whouse_q) + '</td>');

            tr.append('<td class="col-md-2"><input type="number" class="form-control" name="qty" value="' + (detail.quantity-temp_whouse_q) + '" id="requirement-row-' + (i+1) + '-quantity" min="' + (detail.quantity-temp_whouse_q) + '"></td>');
            tr.appendTo(modal_tbody_requirement);
        }
    }
}

if(requirement){
    $('#btn-requirement').show();
    $('#btn-approve-order').hide();
    setRequirementTable();
}

function placeRequirementRequest(){
    var products = alasql('SELECT * FROM item');
    
    // split this order into 2, crate new order
    
    var today = new Date();
    var dd = today.getDate();
    var dd2 = today.getDate()+1;
    var dd3 = today.getDate()+2;
    var dd4 = today.getDate()+4;
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    if(dd2<10){
        dd2='0'+dd2;
    } 
    if(dd3<10){
        dd3='0'+dd3;
    } 
    if(dd4<10){
        dd4='0'+dd4;
    } 
    if(mm<10){
        mm='0'+mm;
    } 
    var today = yyyy+'-'+mm+'-'+dd;
    
	var date = today;
    var date2 = yyyy+'-'+mm+'-'+dd2;
    var date3 = yyyy+'-'+mm+'-'+dd3;
    var date4 = yyyy+'-'+mm+'-'+dd4;
    
    var newOrderID = alasql('SELECT MAX(id) + 1 as id FROM ordersremove')[0].id;
    
    //insert
    alasql('insert into ordersremove values(?,?,?,?,?,?,?)', [ newOrderID, order.customer_id, 1, date, date2, date3, date4 ]);
    
    
    for (var i = 0; i < details.length; i++) {
        if($('requirement-row-' + (i+1) + '-quantity')){
            var detail = details[i];
            var product = products[detail.product_id - 1];
            var kind = alasql('select * from kind where id = ?',[product.kind])[0].text;
            var temp_whouse_q = alasql('select * from stock where item=? and whouse=?',[product.id, temp_whouse_id])[0].balance;
            var whouse_name = alasql('select * from whouse where id=?',[temp_whouse_id])[0].name;
            //co(detail.quantity + ' ' + temp_whouse_q);
            if(detail.quantity > temp_whouse_q){
                var req = detail.quantity-temp_whouse_q;
                var quant = parseInt($('#requirement-row-' + (i+1) + '-quantity').val());
                var requirement_id = alasql('SELECT MAX(id) + 1 as id FROM requirements')[0].id;
                
                if(requirement_id){
                    
                }else{
                    requirement_id = 1;
                }

                alasql('INSERT INTO requirements VALUES(?,?,?,?,?,?,?,?)', [ requirement_id, orderID, temp_whouse_id, product.id, req, quant, 7, 0 ]);
                
                var space = ' ';
                
                //co(requirement_id + space + orderID  + space +  temp_whouse_id + space +  product.id + space +  req + space +  quant);
                
                
                //co(alasql('select * from requirements'));
                
                co(alasql('select * from requirements where id=?',[requirement_id])[0]);
                
                // update Order details
                alasql('UPDATE ordersremovedetails SET quantity = ? WHERE order_id=? and product_id=?', [ temp_whouse_q, orderID, product.id ]);
                
                //insert into new order 
                var ordersremovedetails_id = alasql('SELECT MAX(id) + 1 as id FROM ordersremovedetails')[0].id;
                //details
                alasql('INSERT INTO ordersremovedetails VALUES(?,?,?,?)', [ ordersremovedetails_id, newOrderID, product.id, detail.quantity-temp_whouse_q ]);
                
                // update Order details
                //alasql('UPDATE ordersremovedetails SET quantity = ? WHERE order_id=? and product_id=?', [ temp_whouse_q, orderID, product.id ]);
            }
        }
    }
    
    //set status
    alasql('UPDATE ordersremove SET status = ? WHERE id = ?', [ 2, orderID ]);
    
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    var today = yyyy+'-'+mm+'-'+dd;
    //set date
    alasql('UPDATE ordersremove SET date_approved = ? WHERE id = ?', [ today, orderID ]);
    
    window.location.reload(true); // reload page
}

//ID,ORDER_ID,ORDER_TYPE,PRODUCT_ID,QUANTITY,REPLACEMENT_TYPE,STATUS - replacements table coplumns
function setReturnType(n){
    returnType = parseInt(n);
}

function initiateReturn(){
    for (var i = 0; i < details.length; i++) {
        var replacement_id = alasql('SELECT MAX(id) + 1 as id FROM replacements')[0].id;
        if(replacement_id){

        }else{
            replacement_id = 1;
        }
        var detail = details[i];
        var product_id = detail.product_id;
        var qty = parseInt($('#row-' + (i+1) + '-quantity').val());
        
        if(qty){
            alasql('INSERT INTO replacements VALUES(?,?,?,?,?,?,?)', [ replacement_id, orderID, 2, product_id, qty, returnType, 5 ]);
        }
    }
    co(alasql('select * from replacements'));
    
    //update status of order in db
    alasql('UPDATE ordersremove SET status = ? WHERE id = ?', [ 5, orderID ]);
    
    window.location.reload(true); // reload page
}


function getToday(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    } 
    if(mm<10){
        mm='0'+mm
    } 
    var today = yyyy+'-'+mm+'-'+dd;

    return today;
}

$('#btn-approve-order').on('click', function(){
     alasql('UPDATE ordersremove SET status = ? WHERE id = ?', [ 2, orderID ]);
    
    alasql('UPDATE ordersremove SET date_approved = ? WHERE id = ?', [ getToday(), orderID ]);
    
    window.location.reload(true); // reload page
}); 

$('#btn-ship-order').on('click', function(){
     alasql('UPDATE ordersremove SET status = ? WHERE id = ?', [ 3, orderID ]);
    
    alasql('UPDATE ordersremove SET date_shipped = ? WHERE id = ?', [ getToday(), orderID ]);
    
    window.location.reload(true); // reload page
});

$('#btn-complete').on('click', function(){
     alasql('UPDATE ordersremove SET status = ? WHERE id = ?', [ 4, orderID ]);
    
    alasql('UPDATE ordersremove SET date_completed = ? WHERE id = ?', [ getToday(), orderID ]);
    
    // remove products from inventory
    var whouse = temp_whouse_id;
    for(var i=0;i<details.length;i++){
        var detail = details[i];
        
        var item = detail.product_id;
        
        var qty = detail.quantity;
        var customer_name = alasql('select * from customers where id=?',[order.customer_id])[0].name;

        var memo = 'Sales Order by: ' + customer_name + ' on ' + getToday();

        // update stock record
        var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ whouse, item ]);
        
        var stock_id, balance = 0;
        if (rows.length > 0) {
            stock_id = rows[0].id; 
            balance = rows[0].balance;
            alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance - qty, stock_id ]);
        } else {
            stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
            alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item, whouse, balance - qty ]);
        }
        // add trans record
        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stock_id, getToday(), qty, balance - qty, memo ]);
    }
    
    window.location.reload(true); // reload page
}); 

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}

function printPage(){
    html2canvas(document.body, {
      onrendered: function(canvas) {
          //document.body.appendChild(canvas);
          var newWin=window.open('','Print-Window', '');
          newWin.document.body.appendChild(canvas);
          newWin.print();
      }
    });
}

//order cancellation
if(status<3){
    $('#btn-cancel').show();
}


$('#btn-cancel').on('click', function(){
    alasql('UPDATE ordersremove SET status = ? WHERE id = ?', [ 9, orderID ]);
    
    window.location.reload(true); // reload page
});

