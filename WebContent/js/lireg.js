function lireg(Xparams, Yparams){
    // solve this
//    Regression Equation(y) = a + bx  
//    Slope(b) = (NΣXY - (ΣX)(ΣY)) / (NΣX2 - (ΣX)2) 
//    Intercept(a) = (ΣY - b(ΣX)) / N
    var n = Xparams.length;
    var sumXY = 0.0, sumX = 0.0, sumY = 0.0, sumX2 = 0.0;
    for(var i=0;i<n;i++){
        var x = Xparams[i], y = Yparams[i];
        sumX += x;
        sumX2 += (x*x);
        sumXY += (x*y);
        sumY += y;
    }
    
    var slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
    var intercept = (sumY - slope*sumX) / n;
    
    return [slope, intercept];
}


function getPoint(trendlineParams, x){
    var slope = trendlineParams[0], intercept = trendlineParams[1];
    return (slope*x + intercept);
}

function getArrayFromTable(x, name){
    var ar = [];
    for(var i=0;i<x.length;i++){
        ar.push(x[i][name]);
    }
    return ar;
}