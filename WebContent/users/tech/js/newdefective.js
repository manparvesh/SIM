var req_order_id;
var rows_no=0;
var row_id=0;

function setOrderValuesToSelect(){
    /// order-select
    var order_select = $('#order-select');
    order_select.empty();
    var rows = alasql('SELECT * FROM ordersadd where status=4;');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var option = $('<option>');
        
        option.attr('value', row.id);
        var whouse_name = alasql('select * from whouse where id = ?',[row.whouse])[0].name;
        var supplier_name = alasql('select * from suppliers where id=?',[row.supplier_id])[0].name;
        option.text('Order: ' + row.id +' for warehouse: '+ whouse_name + ' from Supplier: ' + supplier_name);
        //console.log(option);
        option.appendTo(order_select);
        //co($('#row-' + id + '-whouse'));
    }
    
    if(rows.length == 0){
        alert('There are no new order currently');
    }
    
    req_order_id = parseInt(order_select.val());
    
    setAllValues();
    
    order_select.on('change', function(){
        req_order_id = parseInt($(this).val());
        setAllValues();
    });
}

setOrderValuesToSelect();

function setAllValues(){
    var entries = alasql('select * from ordersadd where id=?',[req_order_id]);
    var details = alasql('select * from ordersadddetails where order_id=?',[req_order_id]);
    
    co(entries);
    co(alasql('select * from ordersadddetails'));
    
    var tbody = $('#tbody-orders');
    var tbody_confirm = $('#tbody-confirm');
    
    tbody.empty();
    tbody_confirm.empty();
    for(var i=0;i<details.length;i++){
        var entry = entries[0];
        var detail = details[i];
        
        var prod_name = alasql('select * from item where id=?',[detail.product_id])[0].detail;
        var supplier_name = alasql('select * from suppliers where id=?',[entry.supplier_id])[0].name;
        
        rows_no++;
        row_id++;
        var tr = $('<tr id="row-' + row_id + '"></tr>');
        
        tr.append('<td>'+prod_name+'</td>'); // product name
        tr.append('<td>'+supplier_name+'</td>'); // supplier
        tr.append('<td>'+ detail.quantity +'</td>'); // quantity
        
        tr.append('<td><input type="number" class="form-control" name="def" value="0" min="0" id="row-' + row_id + '-quantity" max="'+ detail.quantity +'"></td>'); // defective products
        tr.appendTo(tbody); 
        
        var tr2 = $('<tr></tr>');
        
        tr2.append('<td>'+prod_name+'</td>'); // product name
        tr2.append('<td>'+supplier_name+'</td>'); // supplier
        tr2.append('<td>'+ detail.quantity +'</td>'); // quantity
        
        tr2.append('<td id="row-' + row_id + '-quantity-confirm"></td>'); // defective products
        tr2.appendTo(tbody_confirm); 
        
        $('#row-' + row_id + '-quantity').on('change', function(){
            $('#row-' + row_id + '-quantity-confirm').text($(this).val());
        });
    }
    
    
}

function removeRow(rn){
    $('#row-'+rn).remove();
    rows_no--;
}

$('#update').on('click',function(){
    $('#the-form').hide();
    $('#confirmation').show();
    $('#top-1').removeClass('active');
    $('#top-2').addClass('active');
    
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
	//var memo = 'defective order order on ' + date +' for warehouse in: ' + whouse_name;
    
    var entries = alasql('select * from ordersadd where id=?',[req_order_id]);
    var details = alasql('select * from ordersadddetails where order_id=?',[req_order_id]);
    //ID,ORDER_ID,ORDER_TYPE,PRODUCT_ID,QUANTITY,REPLACEMENT_TYPE,STATUS
    
    for(var i=0;i<details.length;i++){
        var entry = entries[0];
        var detail = details[i];
        
        var prod_name = alasql('select * from item where id=?',[detail.product_id])[0].detail;
        var supplier_name = alasql('select * from suppliers where id=?',[entry.supplier_id])[0].name;
        
        var def_prods = parseInt($('#row-' + row_id + '-quantity').val()); // defective products

        var t_id = alasql('SELECT MAX(id) + 1 as id FROM replacements')[0].id;
        if(t_id){}else{
            t_id = 1;
        }
        
        alasql('INSERT INTO replacements VALUES(?,?,?,?,?,?,?)', [ t_id, req_order_id, 1, detail.product_id, def_prods, 1, 5 ]);
    }
    
    co(alasql('select * from replacements'));
	
    setTimeout(function() {
        // open new product's page after 1 second
	    window.location.assign('defective.html?id='+ordersadd_id);
    }, 1000);
});
