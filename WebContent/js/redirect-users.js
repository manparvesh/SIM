function getURL(dept){
    var url;
    switch(dept){
        case 0:
            url = '/';
            break;
        case 1:
            url = '/users/purchase/';
            break;
        case 2:
            url = '/users/sales/';
            break;
        case 3:
            url = '/users/tech/';
            break;
        case 4:
            url = '/users/warehouse/';
            break;
        case 5:
            url = '/users/warehouse/';
            break;
        case 6:
            url = '/users/warehouse/';
            break;
        case 7:
            url = '/users/warehouse/';
            break;
    }
    
    if(window.location.hostname != "127.0.0.1"){
        url = '/inventory-i18n-task3' + url;
    }
    
    return url;
}

var tempLogin = alasql('SELECT * FROM logins');
if(tempLogin.length){
    var dept = tempLogin[0].emp_id;
    if(getURL(dept) != window.location.pathname){
        window.location.pathname = getURL(dept);
    }
}else{
    window.location.pathname = '/';
}

console.log(window.location);
