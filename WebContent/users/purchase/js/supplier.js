var supplierID = parseInt($.url().param('id') || '0');
if(supplierID){
    //alert(orderID);
}else{
    alert('Please select a supplier first');
    $('#everything').empty();
    $('#everything').append('<a class="btn btn-raised btn-warning" href="/">Click here to return to the previous page</a>');
}

function setRowLinks(){
    // click event
    $('#tbody-supplier-orders > tr').css('cursor', 'pointer').on('click', function() {
        window.location = $(this).attr('data-href');
    });
}

var supplier = alasql('SELECT * FROM suppliers WHERE id=?', [supplierID])[0];
var whouse = alasql('select * from whouse where id=?',[supplier.whouse])[0];

// put details of supplier 
// ID,NAME,ADDR,CONTACT,WHOUSE,DELIVERY_TIME
$('#supplier-id').text(supplierID);
$('#name').text(supplier.name);
$('#address').text(supplier.addr);
$('#contact').text(supplier.contact);
$('#warehouse').text(whouse.name);
$('#delivery-time').text(supplier.delivery_time);

var details = alasql('SELECT * FROM supplierproducts WHERE supplier_id=?',[supplierID]);

function populateTable(){
    var tbody_supplier_details = $('#tbody-supplier-details');
    tbody_supplier_details.empty();
    var products = alasql('SELECT * FROM item');
    for (var i = 0; i < details.length; i++) {
        var detail = details[i];
        var product = products[detail.product_id - 1];
        co(product);
        var tr = $('<tr></tr>');
        tr.append('<td class="col-md-1">' + detail.id + '</td>');
        tr.append('<td class="col-md-2">' + product.detail + '</td>');
        tr.append('<td class="col-md-1">' + detail.cost + '</td>');

        tr.appendTo(tbody_supplier_details);
    }
}

function populateTable2(){
    var tbody_supplier_orders = $('#tbody-supplier-orders');
    var orders = alasql('select * from ordersadd where supplier_id=?',[supplierID]);
    tbody_supplier_orders.empty();
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var tr = $('<tr data-href="order.html?id=' + order.id + '"></tr>');
        tr.append('<td class="col-md-1">' + order.id + '</td>');
        tr.append('<td class="col-md-2">' + getLabelForOrderStatus(order.status) + '</td>');

        tr.appendTo(tbody_supplier_orders);
    }
    
    setRowLinks();
}

populateTable();
populateTable2();
