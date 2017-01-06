var rows_no = 0;
var row_id = 0;

var total = 0;

var order_type = ($.url().param('type'));

function removeRow(rn){
    $('#row-'+rn).remove();
    rows_no--;
}

var whouse_location = 1;

function setWHouseValuesToDropDown(){
    $('#whouse-select').empty();
    var rows = alasql('SELECT * FROM whouse;');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var option = $('<option>');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
        option.attr('value', row.id);
        option.text('Warehouse location: ' + row.name);
        //console.log(option);
        $('#whouse-select').append(option);
        //co($('#row-' + id + '-whouse'));
    }
}

function getWHouseID(){
    return parseInt($('#whouse-select').val());
}

function getWHouseName(){
    var whouses = alasql('select * from whouse where id=?',[getWHouseID()])[0];
    return whouses.name;
}

setWHouseValuesToDropDown();

function setProductNameValuesToDropDown(id){
    var rows = alasql('SELECT * FROM item;');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var option = $('<option>');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
        option.attr('value', row.id);
        option.text(row.detail);
        //console.log(option);
        $('#row-' + id + '-product-name').append(option);
        //co($('#row-' + id + '-whouse'));
    }
    //do this every time product id is changed
    $('#row-' + id + '-product-name').on('change', function(){
        console.log($(this).val());
        var selectedProductID = parseInt($(this).val());
        var rows = alasql('SELECT * FROM supplierproducts WHERE product_id=? ;',[selectedProductID]);
        $('#row-' + id + '-suppliers').empty();
        var minCost=10000000000, maxCost=-1, minIndex = 0, maxIndex = 0;
        for (var i = 0; i < rows.length; i++) {
            var row = alasql('select * from suppliers where id=?;',[rows[i].supplier_id])[0] ;
            //co(rows[i].supplier_id);
            var option = $('<option id="row-' + id + '-product-name-option-'+i+'">');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
            option.attr('value', row.id);
            option.text(row.name + ' (¥ ' + numberWithCommas(rows[i].cost) +')');
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
        $('#row-' + id + '-product-name-option-'+(1+minIndex)).attr('style', 'background-color:green;color:white;');
        
        //setSupplierValuesToDropDown(id);
    });
}

function setSupplierValuesToDropDown(id){
    var selectedProductID = parseInt($('#row-' + id + '-product-name').val());
    var selectedWHouseID = getWHouseID();
    var rows = alasql('SELECT supplierproducts.*,suppliers.whouse FROM supplierproducts JOIN suppliers ON supplierproducts.supplier_id=suppliers.id WHERE product_id=? AND suppliers.whouse=? order by cost',[selectedProductID, selectedWHouseID]);
    //co(rows);
    var minCost=10000000000, maxCost=-1, minIndex = 0, maxIndex = 0;
    $('#row-' + id + '-suppliers').empty();
    for (var i = 0; i < rows.length; i++) {
        var row = alasql('select * from suppliers where id=?;',[rows[i].supplier_id])[0] ;
        //co(rows[i].supplier_id);
        var option = $('<option id="row-' + id + '-product-name-option-'+(i+1)+'">');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
        option.attr('value', row.id);
        option.attr('cost', rows[i].cost);
        option.text(row.name + ' (¥ ' + numberWithCommas(rows[i].cost) +')');
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
    $('#row-' + id + '-product-name-option-'+(1+minIndex)).attr('style', 'background-color:green;color:white;');
    //co('min= '+minCost+' max= '+maxCost);
    //co('min= '+minIndex+' max= '+maxIndex);
}

function setQuantityFunction(id){
    $('#row-' + id + '-quantity').on('change', function(){
        var supplier_id = parseInt($('#row-' + id + '-suppliers').val());
        var product_id = parseInt($('#row-' + id + '-product-name').val());
        var selectedProductCost = alasql('select * from supplierproducts where supplier_id=? and product_id=?',[supplier_id, product_id])[0].cost;
        //var rows = alasql('SELECT * FROM supplierproducts WHERE product_id=? ;',[selectedProductID]);
        //co(selectedProductCost);
        var quantity = parseInt($(this).val());
        var price = selectedProductCost;//rows[id - 1].cost;
        //console.log(quantity+' ' + $('#row-' + id + '-product-name-option-'+(i+1)).val() + ' ' + $('#row-' + id + '-suppliers').val() + ' ' + price);
        $('#row-' + id + '-price').text((quantity * price));
        
        calcTotal();
    });
}

function testSupplier(id){
    $('#row-' + id + '-suppliers').on('change',function(){
        var supplier_id = parseInt($('#row-' + id + '-suppliers').val());
        var product_id = parseInt($('#row-' + id + '-product-name').val());
        var selectedProductCost = alasql('select * from supplierproducts where supplier_id=? and product_id=?',[supplier_id, product_id])[0].cost;
        //var rows = alasql('SELECT * FROM supplierproducts WHERE product_id=? ;',[selectedProductID]);
        //co(selectedProductCost);
        var quantity = parseInt($('#row-' + id + '-quantity').val());
        var price = selectedProductCost;//rows[id - 1].cost;
        //console.log(quantity+' ' + $('#row-' + id + '-product-name-option-'+(i+1)).val() + ' ' + $('#row-' + id + '-suppliers').val() + ' ' + price);
        $('#row-' + id + '-price').text(quantity * price);
    });
}

function setWHouseFunction(){
    $('#whouse-select').on('change',function(){
        for(var id=1;id<=row_id;id++){
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
            $('#row-' + id + '-product-name-option-'+(1+minIndex)).attr('style', 'background-color:green;color:white;');
            $('#row-' + id + '-product-name-option-'+(1+maxIndex)).attr('style', 'background-color:red;color:white;');
        }
    });
}

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

function addRow(){
    var tbody = $('#tbody-orders');
    rows_no++;
    row_id++;
    var tr = $('<tr id="row-' + row_id + '"></tr>');
    tr.append('<td><select class="form-control" id="row-' + row_id + '-product-name"></select></td>'); // product name
    tr.append('<td><select class="form-control" id="row-' + row_id + '-suppliers"></select></td>'); // supplier
    tr.append('<td><input type="number" class="form-control" name="qty" value="0" min="0" id="row-' + row_id + '-quantity"></td>'); // quantity
    tr.append('<td id="row-' + row_id + '-price"></td>'); // price
    tr.append('<td><a class="btn btn-raised btn-danger btn-sm pull-right" onclick="removeRow(' + row_id + ')"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>');
    tr.appendTo(tbody);
    
    setProductNameValuesToDropDown(row_id);
    setWHouseValuesToDropDown(row_id);
    setSupplierValuesToDropDown(row_id);
    setQuantityFunction(row_id);
    testSupplier(row_id);
    setWHouseFunction();
}

$('#add-row').on('click', function(){
    addRow();
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
        var product_name = alasql('select * from item where id=?',[product_id])[0].detail;
        //co(product_name);
        var whouse = whouses[getWHouseID()-1].name;
        var quantity = parseInt($('#row-' + i + '-quantity').val());
        var supplier = suppliers[parseInt($('#row-' + i + '-suppliers').val())-1].name;
        //co(supplier);
        var price = $('#row-' + i + '-price').text();
        
        if(product_name){
            
            
            var tr = $('<tr></tr>');
            tr.append('<td>' + product_name + '</td>');
            tr.append('<td>' + whouse + '</td>');
            tr.append('<td>' + supplier + '</td>');
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
	var memo = 'New order on ' + date +' for warehouse in: ' + getWHouseName();
    
    // list of suppliers that supply goods to selected warehouse:
    var goodSuppliers = alasql('select * from suppliers');
    
    //traverse and see if the suplier is there
    // if he is, add a new entry to ordersadd table yo 
    for(var goodSupplier = 0; goodSupplier < goodSuppliers.length; goodSupplier++){
        var goodSupplierID = goodSuppliers[goodSupplier].id;
        var ordersadd_order_id = alasql('SELECT MAX(order_id) + 1 as id FROM ordersadd')[0].id;
        if(ordersadd_order_id){
            
        }else{
            ordersadd_order_id = 1;
        }
        var ordersadd_id = alasql('SELECT MAX(id) + 1 as id FROM ordersadd')[0].id;
        if(ordersadd_id){
            
        }else{
            ordersadd_id = 1;
        }
        
        var ordersFromThisSupplier = 0;
        
        for(var i=1;i<=row_id;i++){
            var supp = parseInt($('#row-' + i + '-suppliers').val());
            
            var item = parseInt($('#row-' + i + '-product-name').val());
            var qty = parseInt($('#row-' + i + '-quantity').val());
            
            //co('supp='+supp +' goodSupplierID='+goodSupplierID);
            
            //check if this supplier supplies 
            if(supp == goodSupplierID){
                co(goodSupplierID);
                var ordersadddetails_id = alasql('SELECT MAX(id) + 1 as id FROM ordersadddetails')[0].id;
                
                if(ordersadddetails_id){
                    
                }else{
                    ordersadddetails_id = 1;
                }

                alasql('INSERT INTO ordersadddetails VALUES(?,?,?,?,?)', [ ordersadddetails_id, ordersadd_id, goodSupplierID, item, qty ]);
                
                ordersFromThisSupplier++;
            }
        }
        
        //if there are orders from this supplier, add a row to ordersadd table
        if(ordersFromThisSupplier){
            alasql('INSERT INTO ordersadd VALUES(?,?,?,?,?,?,?,?,?)', [ ordersadd_id, ordersadd_order_id, getWHouseID(), goodSupplierID, 1, date, date2, date3, date4 ]);
        }
    }
    
    
    // add these products to the list of the 
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
            //alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, stock_id ]);
        } else {
            stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
            //alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item, whouse, balance + qty ]);
        }
        // add trans record
        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        var supplier_id = parseInt($('#row-' + i + '-suppliers').val());
        //alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stock_id, date, qty, balance + qty, memo ]);
        
    }
    
    if(order_type == 'req'){
        var req_order_id = parseInt(($.url().param('id')));
        
        //set status of order
        alasql('UPDATE ordersremove SET status = ? WHERE id = ?', [ 8, req_order_id ]);
        
        var order_remove = alasql('select * from requirements where order_id=?',[req_order_id]);
    
        // add products to list
        for(var i=0;i<order_remove.length;i++){
            var prod = order_remove[i];

            alasql('UPDATE requirements SET status = ? WHERE id = ?', [ 8, prod.id ]);
            
            //ordersadd_id
            alasql('UPDATE requirements SET order_add_id = ? WHERE id = ?', [ ordersadd_id, prod.id ]);
        }
    }
	
    setTimeout(function() {
        // open new product's page after 1 second
        ordersadd_id = alasql('SELECT MAX(id) as id FROM ordersadd')[0].id;
	    window.location.assign('order.html?id='+ordersadd_id);
    }, 1000);
});

// check if the order is a requirement

if(order_type == 'req'){
    var req_order_id = parseInt(($.url().param('id')));
    
    var order_remove = alasql('select * from requirements where order_id=?',[req_order_id]);
    
    co(order_remove);
    
    var req_whouse_id = order_remove[0].whouse;
    
    //set whouse location
    $('#whouse-select').val(req_whouse_id);
    
    // add products to list
    for(var i=0;i<order_remove.length;i++){
        var prod = order_remove[i];
        
        addRow();
        
        $('#row-' + (i+1) + '-product-name').val(prod.product_id);
        setSupplierValuesToDropDown(i+1);
        co(prod.quantity);
        $('#row-' + (i+1) + '-quantity').val(prod.quantity);
        
        var id = (i+1);
        
        var supplier_id = parseInt($('#row-' + id + '-suppliers').val());
        var product_id = parseInt($('#row-' + id + '-product-name').val());
        var selectedProductCost = alasql('select * from supplierproducts where supplier_id=? and product_id=?',[supplier_id, product_id])[0].cost;
        //var rows = alasql('SELECT * FROM supplierproducts WHERE product_id=? ;',[selectedProductID]);
        //co(selectedProductCost);
        var quantity = parseInt($('#row-' + id + '-quantity').val());
        var price = selectedProductCost;//rows[id - 1].cost;
        //console.log(quantity+' ' + $('#row-' + id + '-product-name-option-'+(i+1)).val() + ' ' + $('#row-' + id + '-suppliers').val() + ' ' + price);
        $('#row-' + id + '-price').text(quantity * price);
        
        calcTotal();
    }
}
// check if the order is monthly

if(order_type == 'monthly'){
    var whouse = parseInt($('#whouse-select').val());
    
    var prods = alasql('select * from stock where whouse=?',[whouse]);
    //co(alasql('select * from stock where whouse=1'));
    //co(prods)
    
    // add products to list
    for(var i=0;i<prods.length;i++){
        var prod = prods[i];
        
        var optimum = alasql('select * from stockrange where product_id=? and whouse=?',[prod.item, whouse])[0].optimum;
        var currentAmount = alasql('select * from stock where item=? and whouse=?',[prod.item, whouse])[0].balance;
        
        if(optimum>0){
            addRow();

            $('#row-' + (i+1) + '-product-name').val(prod.item);
            setSupplierValuesToDropDown(i+1);

            $('#row-' + (i+1) + '-quantity').val(optimum);

            var id = (i+1);

            var supplier_id = parseInt($('#row-' + id + '-suppliers').val());
            var product_id = parseInt($('#row-' + id + '-product-name').val());
            var selectedProductCost = alasql('select * from supplierproducts where supplier_id=? and product_id=?',[supplier_id, product_id])[0].cost;
            //var rows = alasql('SELECT * FROM supplierproducts WHERE product_id=? ;',[selectedProductID]);
            //co(selectedProductCost);
            var quantity = parseInt($('#row-' + id + '-quantity').val());
            var price = selectedProductCost;//rows[id - 1].cost;
            //console.log(quantity+' ' + $('#row-' + id + '-product-name-option-'+(i+1)).val() + ' ' + $('#row-' + id + '-suppliers').val() + ' ' + price);
            $('#row-' + id + '-price').text(quantity * price);

            calcTotal();        
        }
        
    }
}
if(order_type == 'low'){
    var whouse = parseInt($('#whouse-select').val());
    
    var prods = alasql('select * from stock where whouse=?',[whouse]);
    //co(alasql('select * from stock where whouse=1'));
    //co(prods)
    var ct=0;
    var tid=0;
    // add products to list
    for(var i=0;i<prods.length;i++){
        var prod = prods[i];
        
        var optimum = alasql('select * from stockrange where product_id=? and whouse=?',[prod.item, whouse])[0].optimum;
        var currentAmount = alasql('select * from stock where item=? and whouse=?',[prod.item, whouse])[0].balance;
        
        
        if(currentAmount < optimum){
            co((i+1) + ': ' + optimum + ' > ' + currentAmount);
            
            addRow();
            ct++;
            tid++;
            var row_id = tid;

            $('#row-' + row_id + '-product-name').val(prod.item);
            setSupplierValuesToDropDown(row_id);

            $('#row-' + row_id + '-quantity').val(optimum-currentAmount);


            var supplier_id = parseInt($('#row-' + row_id + '-suppliers').val());
            var product_id = parseInt($('#row-' + row_id + '-product-name').val());
            var selectedProductCost = alasql('select * from supplierproducts where supplier_id=? and product_id=?',[supplier_id, product_id])[0].cost;
            //var rows = alasql('SELECT * FROM supplierproducts WHERE product_id=? ;',[selectedProductID]);
            //co(selectedProductCost);
            var quantity = parseInt($('#row-' + row_id + '-quantity').val());
            var price = selectedProductCost;//rows[id - 1].cost;
            //console.log(quantity+' ' + $('#row-' + id + '-product-name-option-'+(i+1)).val() + ' ' + $('#row-' + id + '-suppliers').val() + ' ' + price);
            $('#row-' + row_id + '-price').text(quantity * price);

            calcTotal();        
        }
        
    }
    co(ct)
}

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}