var loginID = alasql('select * from logins')[0].emp_id;
var orderID = parseInt($.url().param('id') || '0');
if(orderID){
    //alert(orderID);
}else{
    alert('Please select an order first');
    $('#everything').empty();
    $('#everything').append('<a class="btn btn-raised btn-warning" href="/">Click here to return to the previous page</a>');
}

//co(alasql('SELECT * FROM ordersadd WHERE id=?', [orderID]));
//co(alasql('SELECT * FROM ordersadddetails WHERE id=?', [orderID]));

var order = alasql('SELECT * FROM ordersadd WHERE id=?', [orderID])[0];
co(order);
var status = order.status;
if(status > 1){ //2 or more
    $('#new-order .line').css('background-color','#4caf50');
    $('#order-approved .imgcircle').css('background-color','#4caf50');
    $('#span-2').show();
    $('#btn-approve-order').hide();
    $('#btn-shipped').show();
    
    if(status > 2){ //3 or more
        $('#order-approved .line').css('background-color','#4caf50');
        $('#order-shipped .imgcircle').css('background-color','#4caf50');
        $('#span-3').show();
        $('#btn-shipped').hide();
        
        if(loginID > 3){
            //warehouse manager
            $('#btn-complete').show();
        }
    }
    
    if(status > 3){ //complete
        $('#order-shipped .line').css('background-color','#4caf50');
        $('#order-complete .imgcircle').css('background-color','#4caf50');
        $('#span-4').show();
        $('#btn-complete').hide();
        //$('#btn-return').show();
    }
    if(status > 4){ // return init
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

var whouse = alasql('SELECT * FROM ordersadd WHERE id=?', [orderID])[0].whouse;
var whouse_name = alasql('select * from whouse where id=?',[whouse])[0].name;
var supplier_name = alasql('select * from suppliers where id=?',[order.supplier_id])[0].name;
// put details of order
$('#order-id').text(orderID);
$('#supplier-id').text(supplier_name);
$('#waarehouse').text(whouse_name);
$('#status').empty();
$('#status').append(getLabelForOrderStatus(order.status));

var details = alasql('SELECT * FROM ordersadddetails WHERE order_id=?',[orderID]);

function populateTable(){
    var tbody_order_details = $('#tbody-sales-order-details');
    tbody_order_details.empty();
    var products = alasql('SELECT * FROM item');
    for (var i = 0; i < details.length; i++) {
        var detail = details[i];
        var product = products[detail.product_id - 1];
        //co(product);
        var tr = $('<tr></tr>');
        tr.append('<td class="col-md-2">' + detail.id + '</td>');
        tr.append('<td class="col-md-2">' + product.kind + '</td>');
        tr.append('<td class="col-md-2">' + product.maker + '</td>');
        tr.append('<td class="col-md-4">' + product.detail + '</td>');
        tr.append('<td class="col-md-2">' + detail.quantity + '</td>');
        tr.appendTo(tbody_order_details);
    }
}

populateTable();

$('#address').empty();
$('#address').append('<strong>'+ supplier_name +'</strong><br>');
$('#address').append(alasql('select * from suppliers where id=?',[order.supplier_id])[0].addr);

function getPrettyDate(daaate){
    return moment(daaate).format('LL');
}

$('#date-1').text(getPrettyDate(order.date_received));
$('#date-2').text(getPrettyDate(order.date_approved));
$('#date-3').text(getPrettyDate(order.date_shipped));
$('#date-4').text(getPrettyDate(order.date_completed));

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

var date = today;

$('#btn-approve-order').on('click', function(){
     alasql('UPDATE ordersadd SET status = ? WHERE id = ?', [ 2, orderID ]);
    
    alasql('UPDATE ordersadd SET date_approved = ? WHERE id = ?', [ date, orderID ]);
    
    window.location.reload(true); // reload page
}); 
$('#btn-shipped').on('click', function(){
     alasql('UPDATE ordersadd SET status = ? WHERE id = ?', [ 3, orderID ]);
    
    alasql('UPDATE ordersadd SET date_shipped = ? WHERE id = ?', [ date, orderID ]);
    
    window.location.reload(true); // reload page
}); 

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

$('#btn-complete').on('click', function(){
     alasql('UPDATE ordersadd SET status = ? WHERE id = ?', [ 4, orderID ]);
    
    alasql('UPDATE ordersadd SET date_completed = ? WHERE id = ?', [ getToday(), orderID ]);
    
    // add products to inventory
    //var whouse = whouse;
    for(var i=0;i<details.length;i++){
        var detail = details[i];
        
        var item = detail.product_id;
        
        var qty = detail.quantity;
        var customer_name = alasql('select * from suppliers where id=?',[order.supplier_id])[0].name;

        var memo = 'Purchase Order by: ' + customer_name + ' on ' + getToday();

        // update stock record
        var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ whouse, item ]);
        
        co(whouse + ' '+  item);
        co(rows);
        
        var stock_id, balance = 0;
        if (rows.length) {
            stock_id = rows[0].id; 
            balance = rows[0].balance;
            //alert(stock_id + ' ' + balance);
            alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, stock_id ]);
        } else {
            stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
            alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item, whouse, balance + qty ]);
        }
        // add trans record
        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stock_id, getToday(), qty, balance + qty, memo ]);
    }
    
    window.location.reload(true); // reload page
}); 

var returnType = 1;

function setReturnType(n){
    returnType = parseInt(n);
}

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}

function printPage(){
    html2canvas($('body')).then(function(canvas) {
        //document.body.appendChild(canvas);
        //var w = window.open("").document.body.appendChild(canvas);

        var divToPrint= canvas; //document.getElementById('DivIdToPrint');
        var newWin=window.open('','Print-Window', '');
        //newWin.document.open();
        newWin.document.body.appendChild(canvas);
        newWin.print();
        newWin.document.close();

        //window.print();
        //FileSaver.saveAs(w, "hw.png");
        //w.print();
        //window.print(canvas);
    });
}