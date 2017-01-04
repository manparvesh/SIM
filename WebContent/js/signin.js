var users = alasql('SELECT * FROM users;');

function co(s){
    console.log(s);
}

var username = false, password = false;
var dept = 0;

function setURL(dept){
    var url = getURL(dept);
    
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
        $('#signin').prop('disabled', false);
    }else{
        dept = 0;
        setURL(dept);
        $('#signin').prop('disabled', true);
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
        $('#signin').prop('disabled', false);
    }else{
        dept = 0;
        setURL(dept);
        $('#signin').prop('disabled', true);
    }
});

$('#inputPassword').keypress(function (e) {
  if (e.which == 13) {
    if($('#signin').prop('disabled')){}else{
        login();
        window.location = $('#signin').attr('href');
    }
    return false;
  }
});

function login(){
    alasql('DROP TABLE IF EXISTS logins;');
    alasql('CREATE TABLE logins(id INT IDENTITY, emp_id INT);');

    alasql('INSERT INTO logins VALUES(?,?);', [1,dept]);
    
}