var customerID = parseInt($.url().param('id') || '0');
if(customerID){
    //alert(orderID);
}else{
    alert('Please select a customer first');
    $('#everything').empty();
    $('#everything').append('<a class="btn btn-raised btn-warning" href="/">Click here to return to the previous page</a>');
}

function setRowLinks(){
    // click event
    $('#tbody-supplier-orders > tr').css('cursor', 'pointer').on('click', function() {
        window.location = $(this).attr('data-href');
    });
}

var customer = alasql('SELECT * FROM customers WHERE id=?', [customerID])[0];
var whouse = alasql('select * from whouse where id=?',[customer.whouse])[0];
co(whouse);
// put details of supplier 
// ID,NAME,ADDR,CONTACT,WHOUSE,DELIVERY_TIME
$('#supplier-id').text(customerID);
$('#name').text(customer.name);
$('#address').text(customer.addr);
$('#contact').text(customer.contact);
$('#warehouse').text(whouse.name);
$('#delivery-time').text(customer.delivery_time);

function populateTable2(){
    var tbody_supplier_orders = $('#tbody-supplier-orders');
    var orders = alasql('select * from ordersremove where customer_id=?',[customerID]);
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

populateTable2();

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}
