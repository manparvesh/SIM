function getURL(dept){
    var url;
    switch(dept){
        case 0:
            url = '#';
            break;
        case 1:
            url = 'users/purchase';
            break;
        case 2:
            url = 'users/sales';
            break;
        case 3:
            url = 'users/tech';
            break;
        case 4:
            url = 'users/warehouse';
            break;
        case 5:
            url = 'users/warehouse';
            break;
        case 6:
            url = 'users/warehouse';
            break;
        case 7:
            url = 'users/warehouse';
            break;
    }
    return url;
}

var tempLogin = alasql('SELECT * FROM logins');
if(tempLogin.length){
    window.location = getURL(tempLogin[0].emp_id);
}