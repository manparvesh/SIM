// Different labels for different order status codes

function getLabelForOrderStatus(n){
    switch(n){
        case 1: // just added (new order) - warning
            return '<span class="label label-warning">New</span>';
            break;
        case 2: // Approved - parimary
            return '<span class="label label-primary">Approved</span>';
            break;
        case 3: // Completed - success
            return '<span class="label label-success">Completed</span>';
            break;
        default:
            return '';
    }
}