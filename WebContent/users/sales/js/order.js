var orderID = parseInt($.url().param('id') || '0');
if(orderID){
    //alert(orderID);
}else{
    alert('Please select an order first');
    $('#everything').empty();
    //$('#everything').append('<h2>nothing here, homes</h2>');
}

var order = alasql('SELECT * FROM ordersremove WHERE id=?', [orderID])[0];

// put details of order
$('#order-id').text(orderID);
$('#customer-id').text(alasql('select * from customers where id=?',[order.customer_id])[0].name);
$('#status').empty();
$('#status').append(getLabelForOrderStatus(order.status));

var status = order.status;
if(status > 1){ //2 or more
    $('#new-order .line').css('background-color','#4caf50');
    $('#order-approved .imgcircle').css('background-color','#4caf50');
    $('#span-2').show();
    
    if(status > 2){ //3 or more
        $('#order-approved .line').css('background-color','#4caf50');
        $('#order-shipped .imgcircle').css('background-color','#4caf50');
        $('#span-3').show();
    }
    
    if(status > 3){ //complete
        $('#order-shipped .line').css('background-color','#4caf50');
        $('#order-complete .imgcircle').css('background-color','#4caf50');
        $('#span-4').show();
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

function populateTable(){
    var tbody_order_details = $('#tbody-sales-order-details');
    tbody_order_details.empty();
    var products = alasql('SELECT * FROM item');
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
}

populateTable();