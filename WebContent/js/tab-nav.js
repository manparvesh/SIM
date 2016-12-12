function showTab(current_item, total_items){
    for(var i=1;i<=total_items;i++){
        if ($('#nav-list-item-'+i).hasClass('active')){
            $('#nav-list-item-'+i).removeClass('active');
        }
        $('#div-'+i).hide();
    }
    $('#nav-list-item-'+current_item).addClass('active');
    $('#div-'+current_item).show();
}