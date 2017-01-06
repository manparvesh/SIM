function ransac(Xparams, Yparams){
    ////////RANSAC params////////////
    var num = 2; //num: the minimum number of points. For line fitting problem, num=2
    var iter = 20; //iter: the number of iterations
    var threshDist = 1;//threshDist: the threshold of the distances between points and the fitting line
    var inlierRatio = 0; //inlierRatio: the threshold of the number of inliers 
    ////////RANSAC params////////////

    // other params
    var number = Xparams.length;
    var bestInNum = 0; //% Best fitting line with largest number of inliers
    var bestParameter1=0, bestParameter2=0; //% parameters for best fitting line

    function dist(x, y){
        return Math.sqrt(x*x + y*y);
    }

    var best_rmse = 1e30;

    //start
    for(var i=0;i<iter;i++){
        //randomly select 2 distinct points
        var rand1 = Math.floor(Math.random()*number), rand2  = Math.floor(Math.random()*number);
        while(rand1 == rand2){
            rand2  = Math.floor(Math.random()*number);
        }

        var rmse = 0;
        var rmse1 = 0;
        var rmse2 = 0;


        co(rand1 + ' ' + rand2);

        //get x and y coordinates of both points
        var sample1 = [ Xparams[rand1], Yparams[rand1] ];
        var sample2 = [ Xparams[rand2], Yparams[rand2] ];

        co('sample1 = ' + sample1);
        co('sample2 = ' + sample2);

        //Compute the distances between all points with the fitting line 
        var kLine = [ sample2[0]-sample1[0], sample2[1]-sample1[1] ];
        var kLineLen = dist(kLine[0], kLine[1]);
        var kLineNorm = [ kLine[0]/kLineLen, kLine[1]/kLineLen ];
        var normVector = [-kLineNorm[1],kLineNorm[0]]; //%Ax+By+C=0 A=-kLineNorm(1),B=kLineNorm(0)
        var distanceX = [], distanceY = [];
        for(var j=0;j<number;j++){
            distanceX.push(Xparams[j] - sample1[0]);
            distanceY.push(Yparams[j] - sample1[1]);

            rmse1 += (Xparams[j] - sample1[0])*(Xparams[j] - sample1[0]);
            rmse2 += (Yparams[j] - sample1[1])*(Yparams[j] - sample1[1]);
        }

        rmse = dist(Math.sqrt(rmse1) / number, Math.sqrt(rmse2) / number);
        co('rmse1 = '+Math.sqrt(rmse1)/number);
        co('rmse2 = '+Math.sqrt(rmse2) / number);
        co('rmse = '+rmse +'------');


        //Compute the inliers with distances smaller than the threshold
        var inlierNum = 0;
        for(var j=0;j<number;j++){
            if(dist(distanceX[j], distanceY[j]) <= threshDist){
                inlierNum++;
            }
        }

        var bestParametersChanged = false;

        //Update the number of inliers and fitting model if better model is found
        if(inlierNum >= Math.round(inlierRatio*number) && inlierNum>bestInNum){
            bestInNum = inlierNum;
            var par1 = (sample2[1]-sample1[1])/(sample2[0]-sample1[0]); //slope
            co('sample2[0]-sample1[0] = '+ (sample2[0]-sample1[0]));
            var par2 = sample1[1] - par1*sample1[0];

            bestParameter1 = par1;
            bestParameter2 = par2;

            bestParametersChanged = true;
            best_rmse = rmse;
        }
        co('par1 = '+par1);
        co('par2 = '+par2);
        co('bestParameter1 = '+bestParameter1);
        co('bestParameter2 = '+bestParameter2);

        if(bestParametersChanged){
            co('best paramters were changed in this iteration');
        }

        co('');
    }


    co('');
    co('Final results:');
    co('--------------');
    co('m = '+bestParameter1);
    co('c = '+bestParameter2);
    co('RMSE = '+best_rmse);
    
    return [bestParameter1, bestParameter2];
}

function getPoint(trendlineParams, x){
    var m = trendlineParams[0], c = trendlineParams[1];
    return m*x + c;
}

function getArrayFromTable(x, name){
    var ar = [];
    for(var i=0;i<x.length;i++){
        ar.push(x[i][name]);
    }
    return ar;
}