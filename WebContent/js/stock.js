// get id
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

// read item data
var sql = 'SELECT item.id, whouse.name, item.code, item.maker, item.detail, item.price, stock.balance \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE stock.id = ?';
var row = alasql(sql, [ id ])[0];
$('#image').attr('src', 'img/' + row.id + '.jpg');
$('#whouse').text(row.name);
$('#code').text(row.code);
$('#maker').text(row.maker);
$('#detail').text(row.detail);
$('#price').text(numberWithCommas(row.price));
var balance = row.balance; // will be used later
$('#balance').text(balance);

// read transaction
var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
var tbody = $('#tbody-transs');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
    if(row.qty > 0){
        var tr = $('<tr>').appendTo(tbody);
    }else if(row.qty < 0){
        var tr = $('<tr>').appendTo(tbody);
    }
	tr.append('<td>' + (row.date) + '</td>');
	if(row.qty > 0){
        tr.append('<td class="success">' + row.qty + '</td>');
    }else{
        tr.append('<td class="danger">' + row.qty + '</td>');
    }
	tr.append('<td>' + row.balance + '</td>');
	tr.append('<td>' + row.memo + '</td>');
}

// storage/retrieval
$('#update').on('click', function() {
	var date = $('input[name="date"]').val();
	var qty = parseInt($('input[name="qty"]').val());
	var memo = $('textarea[name="memo"]').val();
	alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, id ]);
	var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, id, date, qty, balance + qty, memo ]);
	window.location.assign('stock.html?id=' + id);
});

function getPrettyDate(daaate){
    if(moment(daaate).format('LL') == 'Invalid date'){
        return '-';
    }
    return moment(daaate).format('LL');
}

//--------chart--------
var projectCount = 0;
var config = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: "Amount",
            fill: false,
            backgroundColor: window.chartColors.blue,
            borderColor: window.chartColors.blue,
            data: [
            ],
            fill: false,
        }, {
            label: "Optimal amount",
            fill: false,
            backgroundColor: window.chartColors.red,
            borderColor: window.chartColors.red,
            borderDash: [5, 5],
            data: [
            ],
        }]
    },
    options: {
        responsive: true,
        tooltips: {
            mode: 'index',
            intersect: false
        },
        hover: {
            mode: 'nearest',
            intersect: true
        },
        scales: {
            xAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Date'
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Amount'
                }
            }]
        }
    }
};

function addDataToChart(projData, date) {
    if (config.data.datasets.length > 0) {
        projectCount++;
        config.data.labels.push(date);

        for(var i=0;i<2;i++){
            config.data.datasets[i].data.push(projData[i]);
        }

        window.myLine.update();
    }
};

function clearChartData(){
    if (config.data.datasets.length > 0) {
        projectCount = 0;
        var len = config.data.labels.length;
        for(var i=0;i<len;i++){
            config.data.labels.pop();
        }

        len = config.data.datasets[0].data.length;
        
        for(var i=0;i<len;i++){
            for(var j=0;j<2;j++){
                config.data.datasets[i].data.pop();
            }
        }

        window.myLine.update();
    }
}

//var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
//var tbody = $('#tbody-transs');
//for (var i = 0; i < rows.length; i++) {
//	var row = rows[i];
//    if(row.qty > 0){
//        var tr = $('<tr>').appendTo(tbody);
//    }else if(row.qty < 0){
//        var tr = $('<tr>').appendTo(tbody);
//    }
//	tr.append('<td>' + row.date + '</td>');
//	if(row.qty > 0){
//        tr.append('<td class="success">' + row.qty + '</td>');
//    }else{
//        tr.append('<td class="danger">' + row.qty + '</td>');
//    }
//	tr.append('<td>' + row.balance + '</td>');
//	tr.append('<td>' + row.memo + '</td>');
//}

function showChart(){
    var ctx = document.getElementById("canvas").getContext("2d");
    window.myLine = new Chart(ctx, config);
    clearChartData();
    
    var balanceData = getArrayFromTable(rows, 'balance');
    var tempYAxis = [];
    for(var i=0;i<balanceData.length;i++){
        tempYAxis.push(i+1);
    }
    var trendlineParams = lireg(tempYAxis, balanceData);
    co(trendlineParams);
    
    for(var i=0;i<rows.length;i++){
        var row = rows[i];
        var projData = [];
        projData.push(row.balance); // amount 
        if(trendlineParams[0]>0 || trendlineParams[0]==0 || trendlineParams[0]<0){
            projData.push(Math.round(getPoint(trendlineParams, i+1))); // optimal
        }else{
            projData.push(row.balance); // optimal
        }
        
        var date = row.date;
        
        // add this to chart
        addDataToChart(projData, getPrettyDate(date));
    }
    
    //current optimal values
    var projData = [];
    projData.push(null); // amount 
    var opt;
    if(trendlineParams[0]>0 || trendlineParams[0]==0 || trendlineParams[0]<0){
        projData.push(Math.round(getPoint(trendlineParams, i+1))); // optimal
        opt = Math.round(getPoint(trendlineParams, i+1));
    }else{
        projData.push(rows[0].balance); // optimal
        opt = rows[0].balance;
    }
    
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    } 
    
    var date = yyyy+'-'+mm+'-'+dd;

    // add this to chart
    addDataToChart(projData, 'Today: '+getPrettyDate(date));
    
    //set optimum values
    $('#optimum').text(opt);
    $('#min').text(parseInt(opt/2));
    $('#max').text(opt*2);
}

showChart();
// --------------------------------- / chart  ---------------------------------

