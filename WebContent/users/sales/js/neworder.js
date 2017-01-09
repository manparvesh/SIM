var rows_no = 0;
var row_id = 0;

var total = 0;

function removeRow(rn){
    $('#row-'+rn).remove();
    rows_no--;
}

var whouse_location = 1;

// this sets values of customers to the dropdown menu, not whouse
function setWHouseValuesToDropDown(){
    $('#whouse-select').empty();
    var rows = alasql('SELECT * FROM customers;');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var option = $('<option>');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
        option.attr('value', row.id);
        option.text(row.name);
        //console.log(option);
        $('#whouse-select').append(option);
        //co($('#row-' + id + '-whouse'));
    }
    var whouse_name = alasql('select * from whouse where id=?',[getWHouseID()])[0].name;
        //co(whouse_name);
    $('#warehouse-name').text(whouse_name);
    $('#customer-name-confirm').text(getCustomerName());
}

function getWHouseID(){
    var customer_id = parseInt($('#whouse-select').val());
    //co(alasql('select * from customers where id=?',[customer_id])[0]);
    return alasql('select * from customers where id=?',[customer_id])[0].whouse;
}

function getCustomerID(){
    return parseInt($('#whouse-select').val());
}

setWHouseValuesToDropDown();

function setProductNameValuesToDropDown(id){
    var rows = alasql('SELECT stock.*,item.detail FROM stock JOIN item ON stock.item=item.id WHERE whouse=?;',[getWHouseID()]);
    //co(rows);
    $('#row-' + id + '-product-name').empty();
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var option = $('<option>');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
        option.attr('value', row.item);
        option.text(row.detail);
        //console.log(option);
        $('#row-' + id + '-product-name').append(option);
        //co($('#row-' + id + '-whouse'));
    }
    //do this every time product id is changed
    $('#row-' + id + '-product-name').on('change', function(){
        //console.log($(this).val());
        var selectedProductID = parseInt($(this).val());
        var rows = alasql('SELECT * FROM supplierproducts WHERE product_id=? ;',[selectedProductID]);
        $('#row-' + id + '-suppliers').empty();
        var minCost=10000000000, maxCost=-1, minIndex = 0, maxIndex = 0;
        for (var i = 0; i < rows.length; i++) {
            var row = alasql('select * from suppliers where id=?;',[rows[i].supplier_id])[0] ;
            //co(rows[i].supplier_id);
            var option = $('<option id="row-' + id + '-product-name-option-'+i+'">');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
            option.attr('value', row.id);
            option.text(row.name + ' (¥ ' + rows[i].cost +')');
            //console.log(option);
            $('#row-' + id + '-suppliers').append(option);
            //co($('#row-' + id + '-suppliers'));
            var thisCost = rows[i].cost;
            if(thisCost > maxCost){
                maxCost = thisCost;
                maxIndex = i;
            }
            if(thisCost < minCost){
                minCost = thisCost;
                minIndex = i;
            }
        }
        //$('#row-' + id + '-product-name-option-'+minIndex).attr('style', 'background-color:green;color:white;');
        //$('#row-' + id + '-product-name-option-'+maxIndex).attr('style', 'background-color:red;color:white;');
    });
}

function setQuantityFunction(id){
    $('#row-' + id + '-quantity').on('change', function(){
        var supplier_id = parseInt($('#row-' + id + '-suppliers').val());
        var product_id = parseInt($('#row-' + id + '-product-name').val());
        var selectedProductCost = alasql('select * from item where id=?',[product_id])[0].price;
        //var rows = alasql('SELECT * FROM supplierproducts WHERE product_id=? ;',[selectedProductID]);
        //co(selectedProductCost);
        var quantity = parseInt($(this).val());
        var price = selectedProductCost;//rows[id - 1].cost;
        //console.log(quantity+' ' + $('#row-' + id + '-product-name-option-'+(i+1)).val() + ' ' + $('#row-' + id + '-suppliers').val() + ' ' + price);
        $('#row-' + id + '-price').text(quantity * price);
        
        calcTotal();
    });
}

function getCustomerName(){
    var customer_id = parseInt($('#whouse-select').val());
    return alasql('select * from customers where id=?',[customer_id])[0].name;
}

function setWHouseFunction(){
    $('#whouse-select').on('change',function(){
        ///co($(this).val());
        var whouse_name = alasql('select * from whouse where id=?',[getWHouseID()])[0].name;
        //co(whouse_name);
        $('#warehouse-name').text(whouse_name);
        $('#customer-name-confirm').text(getCustomerName());

        for(var id=1;id<=row_id;id++){
            setProductNameValuesToDropDown(id);
            var selectedProductID = parseInt($('#row-' + id + '-product-name').val());
            var selectedWHouseID = getWHouseID();
            var rows = alasql('SELECT supplierproducts.*,suppliers.whouse FROM supplierproducts JOIN suppliers ON supplierproducts.supplier_id=suppliers.id WHERE product_id=? AND suppliers.whouse=?',[selectedProductID, selectedWHouseID]);
            //co(rows);
            var minCost=10000000000, maxCost=-1, minIndex = 0, maxIndex = 0;
            $('#row-' + id + '-suppliers').empty();
            for (var i = 0; i < rows.length; i++) {
                var row = alasql('select * from suppliers where id=?;',[rows[i].supplier_id])[0] ;
                //co(rows[i].supplier_id);
                var option = $('<option id="row-' + id + '-product-name-option-'+(i+1)+'">');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
                option.attr('value', row.id);
                option.attr('cost', rows[i].cost);
                option.text(row.name + ' (¥ ' + rows[i].cost +')');
                //console.log(option);
                $('#row-' + id + '-suppliers').append(option);
                //co($('#row-' + id + '-suppliers'));
                var thisCost = rows[i].cost;
                if(thisCost > maxCost){
                    maxCost = thisCost;
                    maxIndex = i;
                }
                if(thisCost < minCost){
                    minCost = thisCost;
                    minIndex = i;
                }
            }
            //co(maxCost + ' ' + maxIndex);
            //co(minCost + ' ' + minIndex);
            //$('#row-' + id + '-product-name-option-'+minIndex).attr('style', 'background-color:green;color:white;');
            //$('#row-' + id + '-product-name-option-'+maxIndex).attr('style', 'background-color:red;color:white;');
        }
    });
}

setWHouseFunction();

function calcTotal(){
    var sum = 0;
    for(var i=1;i<=row_id;i++){
        var price = $('#row-' + i + '-price');
        if(price.text()){
            sum += parseInt(price.text());
        }
    }   
    //co(sum);
    $('#total').text(numberWithCommas(sum));
    $('#total-confirm').text(numberWithCommas(sum));
    total = sum;
}

$('#add-row').on('click', function(){
    var tbody = $('#tbody-orders');
    rows_no++;
    row_id++;
    var tr = $('<tr id="row-' + row_id + '"></tr>');
    tr.append('<td><select class="form-control" id="row-' + row_id + '-product-name"></select></td>'); // product name
    tr.append('<td><input type="number" min="0" class="form-control" name="qty" value="0" id="row-' + row_id + '-quantity"></td>'); // quantity
    tr.append('<td id="row-' + row_id + '-price"></td>'); // price
    tr.append('<td><a class="btn btn-raised btn-danger btn-sm pull-right" onclick="removeRow(' + row_id + ')"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>');
    tr.appendTo(tbody);
    
    setProductNameValuesToDropDown(row_id);
    //setWHouseValuesToDropDown(row_id);
    setQuantityFunction(row_id);
});

$('#update').on('click',function(){
    $('#the-form').hide();
    $('#confirmation').show();
    $('#top-1').removeClass('active');
    $('#top-2').addClass('active');
    
    var tbody = $('#tbody-suppliers-confirm');
    tbody.empty();
    var whouses = alasql('select * from whouse');
    var suppliers = alasql('select * from suppliers');
    
    for(var i=1;i<=row_id;i++){
        var product_id = parseInt($('#row-' + i + '-product-name').val());
        co('product id = '+$('#row-' + i + '-product-name').val());
        var product_name = alasql('select * from item where id=?',[product_id])[0].detail;
        //co(product_name);
        var whouse = whouses[getWHouseID()-1].name;
        var quantity = parseInt($('#row-' + i + '-quantity').val());
        //co(supplier);
        var price = $('#row-' + i + '-price').text();
        
        if(product_name){
            
            
            var tr = $('<tr></tr>');
            tr.append('<td>' + product_name + '</td>');
            tr.append('<td>' + whouse + '</td>');
            tr.append('<td>' + quantity + '</td>');
            tr.append('<td>' + numberWithCommas(price) + '</td>');
            tr.appendTo(tbody);
        }
        
    }
});

$('#not-confirm').on('click', function(){
    $('#the-form').show();
    $('#confirmation').hide();
    $('#top-2').removeClass('active');
    $('#top-1').addClass('active');
});

$('#pura-ok').on('click', function(){
    $('#ok-done').show();
    $('#confirmation').hide();
    $('#top-2').removeClass('active');
    $('#top-3').addClass('active');
    
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
	var memo = 'New order on ' + date + ' by ';
    
    // add to list ordersremove
    var ordersremove_id = alasql('SELECT MAX(id) + 1 as id FROM ordersremove')[0].id;
    
    var whouse_id = getWHouseID();
    
    alasql('INSERT INTO ordersremove VALUES(?,?,?,?,?,?,?)', [ ordersremove_id, getCustomerID(), 1, date, date2, date3, date4 ]);
    
    co(alasql('select * from ordersremove where id=?',[ordersremove_id]));
    
    for(var i=1;i<=row_id;i++){
        // update stock record
        var whouse = getWHouseID();
        var item = parseInt($('#row-' + i + '-product-name').val());
        var qty = parseInt($('#row-' + i + '-quantity').val());
        var rows = alasql('SELECT id, balance FROM stock WHERE whouse = ? AND item = ?', [ whouse, item ]);
        var stock_id, balance = 0;
        if (rows.length > 0) {
            stock_id = rows[0].id; 
            balance = rows[0].balance;
            //alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance - qty, stock_id ]);
        } else {
            stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
            //alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item, whouse, balance - qty ]);
        }
        // add trans record
        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        //alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stock_id, date, qty, balance - qty, memo ]);
        
        var ordersremovedetails_id = alasql('SELECT MAX(id) + 1 as id FROM ordersremovedetails')[0].id;
        
        alasql('INSERT INTO ordersremovedetails VALUES(?,?,?,?)', [ ordersremovedetails_id, ordersremove_id, item, qty ]);
    }
    
    //co('success!');
    //co(alasql('select * from ordersremove where id=?',[ordersremove_id])[0]);
    //co(alasql('select * from ordersremovedetails where order_id=?',[ordersremove_id]));
	
    setTimeout(function() {
        // open new product's page after 1 second
	    window.location.assign('order.html?id='+ordersremove_id);
    }, 1000);
});

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}
