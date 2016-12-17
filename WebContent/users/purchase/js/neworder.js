var rows_no = 0;
var row_id = 0;

function removeRow(rn){
    $('#row-'+rn).remove();
    rows_no--;
}

function setWHouseValuesToDropDown(id){
    var selectedProductID = parseInt($('#row-' + id + '-product-name').val());
    var selectedProductDetails = alasql('select * from item where id=?',[selectedProductID])[0];
    var rows = alasql('SELECT * FROM whouse;');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var option = $('<option>');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
        option.attr('value', row.id);
        option.text(row.name);
        //console.log(option);
        $('#row-' + id + '-whouse').append(option);
        //co($('#row-' + id + '-whouse'));
    }
}

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

function setSupplierValuesToDropDown(id){
    var selectedProductID = parseInt($('#row-' + id + '-product-name').val());
    var selectedWHouseID = parseInt($('#row-' + id + '-whouse').val());
    var rows = alasql('SELECT supplierproducts.*,suppliers.whouse FROM supplierproducts JOIN suppliers ON supplierproducts.supplier_id=suppliers.id WHERE product_id=? AND suppliers.whouse=?',[selectedProductID, selectedWHouseID]);
    //co(rows);
    var minCost=10000000000, maxCost=-1, minIndex = 0, maxIndex = 0;
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
        $('#row-' + id + '-price').text(quantity * price);
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

function setWHouseFunction(id){
    $('#row-' + id + '-whouse').on('change',function(){
        var selectedProductID = parseInt($('#row-' + id + '-product-name').val());
        var selectedWHouseID = parseInt($('#row-' + id + '-whouse').val());
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
    });
}

$('#add-row').on('click', function(){
    var tbody = $('#tbody-orders');
    rows_no++;
    row_id++;
    var tr = $('<tr id="row-' + row_id + '"></tr>');
    tr.append('<td><select class="form-control" id="row-' + row_id + '-product-name"></select></td>'); // product name
    tr.append('<td><input type="number" class="form-control" name="qty" value="0" id="row-' + row_id + '-quantity"></td>'); // quantity
    tr.append('<td><select class="form-control" id="row-' + row_id + '-whouse"></select></td>'); // warehouse
    tr.append('<td><select class="form-control" id="row-' + row_id + '-suppliers"></select></td>'); // supplier
    tr.append('<td id="row-' + row_id + '-price"></td>'); // price
    tr.append('<td><a class="btn btn-raised btn-danger btn-sm pull-right" onclick="removeRow(' + row_id + ')"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>');
    tr.appendTo(tbody);
    
    setProductNameValuesToDropDown(row_id);
    setWHouseValuesToDropDown(row_id);
    setSupplierValuesToDropDown(row_id);
    setQuantityFunction(row_id);
    testSupplier(row_id);
    setWHouseFunction(row_id);
});