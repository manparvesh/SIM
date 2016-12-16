var rows_no = 0;

function removeRow(rn){
    $('#row-'+rn).remove();
    rows_no--;
}

function setWHouseValuesToDropDown(id){
    var rows = alasql('SELECT * FROM whouse;');
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var option = $('<option>');// '<option value="'+row.id+'">'+row.name+'</option>'; //$('<option></option>');
        option.attr('value', row.id);
        option.text(row.name);
        console.log(option);
        $('#row-' + id + '-whouse').append(option);
        //co($('#row-' + id + '-whouse'));
    }
}
//<option value="1">Tokyo</option><option value="2">Shanghai</option><option value="3">Singapore</option><option value="4">Delhi</option
$('#add-row').on('click', function(){
    var tbody = $('#tbody-orders');
    rows_no++;
    var tr = $('<tr id="row-' + rows_no + '"></tr>');
    tr.append('<td></td>'); // product name
    tr.append('<td><input type="number" class="form-control" name="qty" value="0" id="row-' + rows_no + '-quantity"></td>'); // quantity
    tr.append('<td><select class="form-control" id="row-' + rows_no + '-whouse">></select></td>'); // warehouse
    
    tr.append('<td>hi</td>'); // supplier
    tr.append('<td></td>'); // price
    tr.append('<td><a class="btn btn-raised btn-danger btn-sm pull-right" onclick="removeRow(' + rows_no + ')"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a></td>');
    tr.appendTo(tbody);
    
    setWHouseValuesToDropDown(rows_no);
});