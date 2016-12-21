var orderID = parseInt($.url().param('id') || '0');
if(orderID){
    //alert(orderID);
}else{
    alert('Please select an order first');
    $('#everything').empty();
    //$('#everything').append('<h2>nothing here, homes</h2>');
}

var returnType = 1;
var requirement = false;

var order = alasql('SELECT * FROM ordersremove WHERE id=?', [orderID])[0];

co(order);

co(alasql('select * from customers where id=?',[order.customer_id]));

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
    
    if(status > 2){ //3 or more
        $('#order-approved .line').css('background-color','#4caf50');
        $('#order-shipped .imgcircle').css('background-color','#4caf50');
        $('#span-3').show();
    }
    
    if(status > 3){ //complete
        $('#order-shipped .line').css('background-color','#4caf50');
        $('#order-complete .imgcircle').css('background-color','#4caf50');
        $('#span-4').show();
        $('#btn-return').show();
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
}

var details = alasql('SELECT * FROM ordersremovedetails WHERE order_id=?',[orderID]);

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
$('#date-2').text(getPrettyDate(order.date_approved));
$('#date-3').text(getPrettyDate(order.date_shipped));
$('#date-4').text(getPrettyDate(order.date_completed));

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
    
    if(status>1){
        thead_order_details.append('\
                                   <tr> \
                            <th class="col-md-1">ID</th>\
                            <th class="col-md-3">Manufacturer</th>\
                            <th class="col-md-3">Kind</th>\
                            <th class="col-md-3">Product</th>\
                            <th class="col-md-2">Quantity</th>\
                        </tr>\
                                   ');
        
        for (var i = 0; i < details.length; i++) {
            var detail = details[i];
            var product = products[detail.product_id - 1];
            var kind = alasql('select * from kind where id = ?',[product.kind])[0].text;
            var tr = $('<tr></tr>');
            tr.append('<td class="col-md-1">' + detail.id + '</td>');
            tr.append('<td class="col-md-3">' + kind + '</td>');
            tr.append('<td class="col-md-3">' + product.maker + '</td>');
            tr.append('<td class="col-md-3">' + product.detail + '</td>');
            tr.append('<td class="col-md-2">' + detail.quantity + '</td>');
            tr.appendTo(tbody_order_details);
        }
    }else{
        thead_order_details.append('\
                   <tr> \
            <th class="col-md-1">ID</th>\
            <th class="col-md-2">Manufacturer</th>\
            <th class="col-md-2">Kind</th>\
            <th class="col-md-3">Product</th>\
            <th class="col-md-2">Quantity</th>\
            <th class="col-md-2">Availability</th>\
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
            co(product.id + ' ' + temp_whouse_id);
            var temp_whouse_q = alasql('select * from stock where item=? and whouse=?',[product.id, temp_whouse_id])[0].balance;
            if(detail.quantity > temp_whouse_q){
                requirement = true;
            }
            tr.append('<td class="col-md-2">' + getAvailability(detail.quantity, temp_whouse_q) + '</td>');
            tr.appendTo(tbody_order_details);
        }
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
                    requirement_id = 0;
                }

                alasql('INSERT INTO requirements VALUES(?,?,?,?,?,?,?)', [ requirement_id, orderID, temp_whouse_id, product.id, req, quant, 7 ]);
                
                var space = ' ';
                
                //co(requirement_id + space + orderID  + space +  temp_whouse_id + space +  product.id + space +  req + space +  quant);
                
                
                co(alasql('select * from requirements'));
                
                //co(alasql('select * from requirements where id=?',[requirement_id])[0]);
                
                // update Order details
                alasql('UPDATE ordersremovedetails SET quantity = ? WHERE order_id=? and product_id=?', [ temp_whouse_q, orderID, product.id ]);
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
            alasql('INSERT INTO replacements VALUES(?,?,?,?,?,?,?)', [ replacement_id, orderID, 1, product_id, qty, returnType, 5 ]);
        }
    }
    co(alasql('select * from replacements'));
    
    //update status of order in db
    alasql('UPDATE ordersremove SET status = ? WHERE id = ?', [ 5, orderID ]);
    
    window.location.reload(true); // reload page
}

$('#btn-approve-order').on('click', function(){
     alasql('UPDATE ordersremove SET status = ? WHERE id = ?', [ 2, orderID ]);
    
    window.location.reload(true); // reload page
}); 