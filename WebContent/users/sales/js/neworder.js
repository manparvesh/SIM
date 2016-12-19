var rows_no = 0;
var row_id = 0;

var total = 0;

function removeRow(rn){
    $('#row-'+rn).remove();
    rows_no--;
}

var whouse_location = 1;

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
}

function getWHouseID(){
    var customer_id = parseInt($('#whouse-select').val());
    return alasql('select * from customers where id=?',[customer_id])[0].whouse;
}

setWHouseValuesToDropDown();

function setProductNameValuesToDropDown(id){
    var rows = alasql('SELECT stock.*,item.detail FROM stock JOIN item ON stock.item=item.id WHERE whouse=?;',[getWHouseID()]);
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
        $('#row-' + id + '-product-name-option-'+minIndex).attr('style', 'background-color:green;color:white;');
        $('#row-' + id + '-product-name-option-'+maxIndex).attr('style', 'background-color:red;color:white;');
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

function setWHouseFunction(){
    $('#whouse-select').on('change',function(){
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
            $('#row-' + id + '-product-name-option-'+minIndex).attr('style', 'background-color:green;color:white;');
            $('#row-' + id + '-product-name-option-'+maxIndex).attr('style', 'background-color:red;color:white;');
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
    $('#total').text(sum);
    $('#total-confirm').text(sum);
    total = sum;
}

$('#add-row').on('click', function(){
    var tbody = $('#tbody-orders');
    rows_no++;
    row_id++;
    var tr = $('<tr id="row-' + row_id + '"></tr>');
    tr.append('<td><select class="form-control" id="row-' + row_id + '-product-name"></select></td>'); // product name
    tr.append('<td><input type="number" class="form-control" name="qty" value="0" id="row-' + row_id + '-quantity"></td>'); // quantity
    tr.append('<td id="row-' + row_id + '-price"></td>'); // price
    tr.append('<td><a class="btn btn-raised btn-danger btn-sm pull-right" onclick="removeRow(' + row_id + ')"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>');
    tr.appendTo(tbody);
    
    setProductNameValuesToDropDown(row_id);
    setWHouseValuesToDropDown(row_id);
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
            tr.append('<td>' + price + '</td>');
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
	var memo = 'New order on ' + date;
    
    // add to list ordersadd
    var ordersadd_id = alasql('SELECT MAX(id) + 1 as id FROM ordersremove')[0].id;
    
    var whouse_id = getWHouseID(); // set everything for this warehouse only
    
    alasql('INSERT INTO ordersremove VALUES(?,?,?,?,?,?,?)', [ ordersadd_id, whouse_id, 1, date, '', '', '' ]);
    
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
            alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, stock_id ]);
        } else {
            stock_id = alasql('SELECT MAX(id) + 1 as id FROM stock')[0].id;
            alasql('INSERT INTO stock VALUES(?,?,?,?)', [ stock_id, item, whouse, balance + qty ]);
        }
        // add trans record
        var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
        alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, stock_id, date, qty, balance + qty, memo ]);
        
        var ordersadddetails_id = alasql('SELECT MAX(id) + 1 as id FROM ordersadddetails')[0].id;
        
        alasql('INSERT INTO ordersadddetails VALUES(?,?,?,?)', [ ordersadddetails_id, ordersadd_id, item, qty ]);
    }
	
    setTimeout(function() {
        // open new product's page after 1 second
	    window.location.assign('index.html');
    }, 1000);
});
