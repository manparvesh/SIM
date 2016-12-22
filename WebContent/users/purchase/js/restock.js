var rows_no = 0;
var row_id = 0;

var total = 0;

function removeRow(rn){
    $('#row-'+rn).remove();
    rows_no--;
}

co(alasql('select * from restock'));

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
        
        calcTotal();
    });
}

//console.log(alasql('select * from stockrange'));

function checkIfBalanceOutOfRange(prod_id, whouse_id, bal){
    var range = alasql('select * from stockrange where product_id=? and whouse=?',[prod_id, whouse_id])[0];
    
    if(bal > range.max){
        return true;
    }
    return false;
}

var ans = [];

function addRows(){
    var tbody = $('#tbody-orders');
    tbody.empty();
    
    var tbody_confirm = $('#tbody-suppliers-confirm');
    tbody_confirm.empty();
    
    var products = alasql('select * from item');
    
    
    //co(products);
    
    for(var i=0;i<products.length;i++){
        var product = products[i];
        var prod_id = product.id;
        
        // check where this product is available
        var avails = alasql('select * from stock where item=?',[prod_id]);
        
        var maxBal = avails[0].balance, maxID = avails[0].id, maxWHouse = avails[0].whouse, minBal = 10000000000, minWHouse = avails[0].whouse, minID = avails[0].id;
        
        if(avails.length>1){
            for(var j=1;j<avails.length;j++){

                var avail = avails[j];
                //check which one is the max and distribute that into other whouses
                var bal = avail.balance;
                if(bal > maxBal){
                    maxBal = bal;
                    maxID = avail.id;
                    maxWHouse = avail.whouse;
                }
                if(bal < minBal){
                    minBal = bal;
                    minID = avail.id;
                    minWHouse = avail.whouse;
                }
            }
        }
        
        if(checkIfBalanceOutOfRange(prod_id, maxWHouse, maxBal)){
            //can proceed for transfer
            rows_no++;
            row_id++;
            
            var opt_transfer = parseInt((maxBal - minBal)/2);
            
            var whouses = alasql('select * from whouse');
            
            var fromWH = ''+whouses[maxWHouse-1].name; // max
            var toWH = ''+whouses[minWHouse-1].name;
            
            var tr = $('<tr id="row-' + row_id + '" class="row"></tr>');
            tr.append('<td class="col-md-2 text-center">' + product.detail + '</td>'); // product name
            tr.append('<td class="col-md-3 text-center">' + fromWH + '</td>'); // for warehouse (Name, quantity, maximum required quantity)
            tr.append('<td class="col-md-3 text-center">' + toWH + '</td>'); // to warehouse (Name, quantity, minimum required quantity)
            tr.append('<td class="col-md-2 text-center">' + opt_transfer + '</td>'); // optimum quantity
            tr.append('<td class="col-md-2 text-center"><input type="number" class="form-control" name="qty" value="' + opt_transfer + '" min="0" max="' + opt_transfer + '" id="row-' + row_id + '-quantity"></td>'); // quantity
            tr.appendTo(tbody);  
            
            
            var tr2 = $('<tr class="row"></tr>');
            tr2.append('<td class="col-md-2 text-center">' + product.detail + '</td>');
            tr2.append('<td class="col-md-3 text-center">' + fromWH + '</td>');
            tr2.append('<td class="col-md-3 text-center">' + toWH + '</td>');
            tr2.append('<td class="col-md-2 text-center">' + opt_transfer + '</td>');
            tr2.append('<td class="col-md-2 text-center" id="confirm-row-' + row_id + '-quantity">' + $('#row-' + row_id + '-quantity').val() + '</td>');
            tr2.appendTo(tbody_confirm);
            
            ans.push({
                "p_detail": product.id,
                "fromWH": maxWHouse,
                "toWH": minWHouse,
                "qty": opt_transfer
            });
            
            $('#row-' + row_id + '-quantity').on('change',function(){
                $('#confirm-row-' + row_id + '-quantity').text($(this).val());
                
                ans[row_id-1].qty = $(this).val();
                //co(ans);
            });
        }
    }
    

}

addRows();

$('#update').on('click',function(){
    $('#the-form').hide();
    $('#confirmation').show();
    $('#top-1').removeClass('active');
    $('#top-2').addClass('active');
    //co(alasql('select * from temp'));
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
	//var memo = 'Restock order on ' + date +' for warehouse in: ' + getWHouseName();
    
    var restocks = alasql('select * from restock');//insert into this table
    //id , product_id, whouse_from , whouse_to, quantity ,status 
    for(var i=0;i<ans.length;i++){
        var restock_id = alasql('select MAX(id)+1 as id from restock')[0].id;
        if(restock_id){}else{
            restock_id = 1;
        }
        alasql('INSERT INTO restock VALUES(?,?,?,?,?,?);', [ restock_id, ans[i].p_detail, ans[i].fromWH, ans[i].toWH, ans[i].qty, 1 ]);
    }
    
    
    setTimeout(function() {
	    window.location.assign('index.html');
    }, 1000);
});

function logout(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');
}