
var users = alasql('SELECT * FROM users;');

function co(s){
    console.log(s);
}

var username = false, password = false;
var dept = 0;

function setURL(dept){
    var url;
    switch(dept){
        case 0:
            url = '/';
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
    co('url = '+url);
    
    $('#signin').attr('href', url);
}

$('#inputUserName').on('input', function(){
    var name = $('#inputUserName').val();
    var details = alasql('SELECT * FROM users WHERE name=?', [name]);
    var pass = $('#inputPassword').val();
    
    if(details.length){
        username = true;
        if(details[0].pass == pass){
            password = true;
        }else{
            password = false;
        }
    }else{
        username = false;
    }
    
    if(username && password){
        dept = details[0].dept;
        co('dept = ' + dept);
        
        setURL(dept);
    }else{
        dept = 0;
        setURL(dept);
    }
});

$('#inputPassword').on('input', function(){
    var name = $('#inputUserName').val();
    var details = alasql('SELECT * FROM users WHERE name=?', [name]);
    var pass = $('#inputPassword').val();
    
    if(details.length){
        if(details[0].pass == pass){
            password = true;
        }else{
            password = false;
        }
    }else{
        password = false;
    }
    
    if(username && password){
        dept = details[0].dept;
        co('dept = ' + dept);
        
        setURL(dept);
    }else{
        dept = 0;
        setURL(dept);
    }
});

function login(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');

    alasql('INSERT INTO logins VALUES(?,?);', [1,dept]);
    
}