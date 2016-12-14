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
$('#customer-id').text(order.customer_id);
$('#status').empty();
$('#status').append(getLabelForOrderStatus(order.status));

var details = alasql('SELECT * FROM ordersremovedetails WHERE order_id=?',[orderID]);

function populateTable(){
    var tbody_order_details = $('#tbody-sales-order-details');
    tbody_order_details.empty();
    var products = alasql('SELECT * FROM item');
    for (var i = 0; i < details.length; i++) {
        var detail = details[i];
        var product = products[detail.product_id - 1];
        co(product);
        var tr = $('<tr></tr>');
        tr.append('<td class="col-md-1">' + detail.id + '</td>');
        tr.append('<td class="col-md-2">' + product.detail + '</td>');

        tr.append('<td class="col-md-1">' + detail.quantity + '</td>');
        tr.appendTo(tbody_order_details);
    }
}

populateTable();