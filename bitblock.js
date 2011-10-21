/*
v03 Todos
2. done: fix menu-to-game so it doesn't erase the board, reload the page, get lost, disappear.
3. done: add New Game button
4. done: added a Last Games list when you replay a board, to see how you did the last few times
 
v04 Todo
1. server database, saving games to replay, compete
18. timing bonus (not really needed right now)
 
*/
$(document).ready(function(){
	$("#options > div.section").first().addClass("current");
	
	$("a.back").live('touchstart click', function(event) {
		var current = $(event.currentTarget).attr("href");
		$(".current").removeClass("current").addClass("reverse");
		$(current).addClass("current");
	});
	
	$(".menu a[href]").live('touchstart click', function(event) {
		var link = $(event.currentTarget);
		var section = link.closest('div.section');
		var prev_element = "#"+(section.removeClass("current").addClass("reverse").attr("id"));
		$(link.attr("href")).addClass("current");
		$(".current .back").remove();
		$(".current .toolbar").prepend("<a href=\""+prev_element+"\" class=\"back\">Backy</a>");
	});

	$(".menu a[togame]").live('touchstart click', go2game);
	$("#go2options").live('touchstart click', go2options);

	function go2options(event){
		$("#game01").css("display","hide");		
		$("#options").css("display","block");
		$("#options > div.section").first().addClass("current");
	}

	function go2game(event){
		$("#options").css("display","hide");
		$("#game01").css("display","block");
		//$("#go2options").live('touchstart click', go2options);
	}

	$("#replay").live('touchstart click', function(event) {
		replayLastGame();
		showNewBitblockMatrix();
		setLastGame();
		resetScores();
	});

	$("#newgame").live('touchstart click', function(event) {
		genNewGame();
		showNewBitblockMatrix();
		resetLastGames();
		resetScores();
	});

	$(".tapper").live('touchstart click', function(event) {
		var tapid = $(event.target).attr("id");
		var tapcolor = $(this).css("background-color");
		var tapccode = $(this).attr("ccode");
		//alert(tapid+" "+tapcolor+" "+tapccode);
		//$(".matrix").;
		//$("#options").show();
		var grays = getGraycount();
		playTurnMatrixChange(tapccode); 
		var newgrays = getGraycount();
		squarecount = newgrays - grays;
		var sqbonus = playTurnSquareCountBonus(squarecount);
//alert(score + " + " + sqbonus + " = " + (score+sqbonus));
		score = score + sqbonus;
		if(grays < newgrays) {
			tapscount += 1;
		}
		showNewBitblockMatrix();
		showScores();
		squarecount = 0;
	});

	var gameover = false;
	var score = 0;
	var tapscount = 0;
	var squarecount = 0; //track num squares killed for each tap
	var matrixwidth = 10;
	var matrixheight = 5;
	var colors = Array("#555555","#864bff","#469bff","#57ffaa","#ffc81b","#ff388b");
	var marr = new Array(matrixheight);
	var marr2 = new Array(matrixheight);
	

    function genNewGame(){
    	gameover = false;
    	for(var i = 0; i < matrixheight; i++){
    		//marr  is the matrix used to display BitBlocks
    		marr[i] = new Array(matrixwidth);  
    		//marr2 is a matrix used in calculating each modified BitBlocks (each turn)
    		marr2[i] = new Array(matrixwidth);
    		for(var j = 0; j < matrixwidth; j++){
    			var mcellid = "m"+int22char(i)+int22char(j);
    			var mcellccode = Math.floor(1 + Math.random() * 5);
    			marr[i][j] = mcellccode;
    			marr2[i][j] = mcellccode;
    			var mcellbgcolor = colors[mcellccode];
    			var mstr = "<div id=\""+ mcellid +"\" class=\"matrix\" ccode=\""+ mcellccode +"\" style=\"background-color:"+ mcellbgcolor +";\">"+mcellccode+"</div>";
    			$("#bitblocks").append(mstr);
    		}
    		var bstr = "<div class=\"b02\"></div>";
    		$("#bitblocks").append(bstr);
    	}
    	//set upper left corner to color 0 (gray)
    	marr[0][0] = 0;
    	mcellbgcolor = colors[0];
    	$("#m0000").css("background-color",mcellbgcolor).html("");
    }
	
	//var int22char = function(theint){
	function int22char(theint) {
		//creates a minimum-two char value for integer numbers.
		var newstr = theint;
		if(theint < 10){
		    newstr = "0"+theint;
		}
		return newstr;
	//};	
	}	

	function playTurnMatrixChange(tapccode){
		//changes the matrix array (marr) in place.  marr2 represents the last known state of marr
		/*
		for(var i = 0; i < matrixheight; i++){
			for(var j = 0; j < matrixwidth; j++){
				marr2[i][j] = marr[i][j];				
			}
		}
		*/
		//while(numgrays < newgrays){
		//for(var grays = 0; grays <= pregrays; bill = 1 ){
		for(var loops=0; loops<matrixheight-1; loops++){  //not efficient... should be recursive to find hidden connected blocks
			var pregrays = getGraycount();
			for(var i = 0; i < matrixheight; i++){
				for(var j = 0; j < matrixwidth; j++){
					if(marr[i][j] == 0){
						//this is a gray cell, so change it's neighbors' colors
						//don't look outside the matrix!
						if(i==0){
							if(j>0 && j<matrixwidth-1){
								if(marr[i][j-1] == tapccode){ score = newScore(tapccode); marr[i][j-1] = 0; }
								if(marr[i][j+1] == tapccode){ score = newScore(tapccode); marr[i][j+1] = 0; }
								if(marr[i+1][j] == tapccode){ score = newScore(tapccode); marr[i+1][j] = 0; }  //assumes matrixheight > 1
							} else if(j == 0){
								if(marr[i][j+1] == tapccode){ score = newScore(tapccode); marr[i][j+1] = 0; }
								if(marr[i+1][j] == tapccode){ score = newScore(tapccode); marr[i+1][j] = 0; }  //assumes matrixheight > 1
							} else if(j == matrixwidth-1){
								if(marr[i][j-1] == tapccode){ score = newScore(tapccode); marr[i][j-1] = 0; }
								if(marr[i+1][j] == tapccode){ score = newScore(tapccode); marr[i+1][j] = 0; }  //assumes matrixheight > 1
							}
						} else if(i>0 && i<matrixheight-1){
							if(j>0 && j<matrixwidth-1){
								if(marr[i][j-1] == tapccode){ score = newScore(tapccode); marr[i][j-1] = 0; }
								if(marr[i][j+1] == tapccode){ score = newScore(tapccode); marr[i][j+1] = 0; }
								if(marr[i+1][j] == tapccode){ score = newScore(tapccode); marr[i+1][j] = 0; }  //assumes matrixheight > 1
								if(marr[i-1][j] == tapccode){ score = newScore(tapccode); marr[i-1][j] = 0; }  //assumes matrixheight > 1
							} else if(j == 0){
								if(marr[i][j+1] == tapccode){ score = newScore(tapccode); marr[i][j+1] = 0; }
								if(marr[i+1][j] == tapccode){ score = newScore(tapccode); marr[i+1][j] = 0; }  //assumes matrixheight > 1
								if(marr[i-1][j] == tapccode){ score = newScore(tapccode); marr[i-1][j] = 0; }  //assumes matrixheight > 1
							} else if(j == matrixwidth-1){
								if(marr[i][j-1] == tapccode){ score = newScore(tapccode); marr[i][j-1] = 0; }
								if(marr[i+1][j] == tapccode){ score = newScore(tapccode); marr[i+1][j] = 0; }  //assumes matrixheight > 1
								if(marr[i-1][j] == tapccode){ score = newScore(tapccode); marr[i-1][j] = 0; }  //assumes matrixheight > 1
							}
						} else if(i==matrixheight-1){
							if(j>0 && j<matrixwidth-1){
								if(marr[i][j-1] == tapccode){ score = newScore(tapccode); marr[i][j-1] = 0; }
								if(marr[i][j+1] == tapccode){ score = newScore(tapccode); marr[i][j+1] = 0; }
								if(marr[i-1][j] == tapccode){ score = newScore(tapccode); marr[i-1][j] = 0; }  //assumes matrixheight > 1
							} else if(j == 0){
								if(marr[i][j+1] == tapccode){ score = newScore(tapccode); marr[i][j+1] = 0; }
								if(marr[i-1][j] == tapccode){ score = newScore(tapccode); marr[i-1][j] = 0; }  //assumes matrixheight > 1
							} else if(j == matrixwidth-1){
								if(marr[i][j-1] == tapccode){ score = newScore(tapccode); marr[i][j-1] = 0; }
								if(marr[i-1][j] == tapccode){ score = newScore(tapccode); marr[i-1][j] = 0; }  //assumes matrixheight > 1
							}
						}
					}
				}
			}
			var grays = getGraycount();
			if(grays == pregrays){ 
				//you're finished, there was no change in the graycount
			    break; 
			}
		}
		//alert("numgrays: "+grays+"  numloops: "+loops);  //works! loops just enough to solve the graycount efficiently
	}

	function showNewBitblockMatrix(){
		//var newmarr = new Array(matrixheight);
		$("#bitblocks").html("");
		for(var i = 0; i < matrixheight; i++){
			//newmarr[i] = new Array(matrixwidth);
			for(var j = 0; j < matrixwidth; j++){
				var mcellid = "m"+int22char(i)+int22char(j);
				var mcellccode = marr[i][j];
				//newmarr[i][j] = mcellccode;
				var mcellbgcolor = colors[mcellccode];
				var mcellcodevis = mcellccode;
				if(mcellccode == 0){
					mcellcodevis = "";
				} 
				var mstr = "<div id=\""+ mcellid +"\" class=\"matrix\" ccode=\""+ mcellccode +"\" style=\"background-color:"+ mcellbgcolor +";\">"+mcellcodevis+"</div>";
				$("#bitblocks").append(mstr);
			}
			var bstr = "<div class=\"b02\"></div>";
			$("#bitblocks").append(bstr);
		}
		$("#bitblocks").show();
	}

	function replayLastGame(){
		for(var i = 0; i < matrixheight; i++){
			for(var j = 0; j < matrixwidth; j++){
				marr[i][j] = marr2[i][j];				
			}
		}
		marr[0][0] = 0;
		mcellbgcolor = colors[0];
		$("#m0000").css("background-color",mcellbgcolor).html("");
	}

	function showScores(){
		//var oldscore = $("#score").html();
		//if( (oldscore + 0) == score){
		//	//no change in score, must have been a bad tap.  decrement tap, no change in scores or taps.
		//	tapscount = tapscount - 1;
		//}
		var isDone = isMatrixCompleted();
		if(isDone){
			gameover = true;
			var bonus = getBonusScore();
			var timebonus = getTimeBonusScore();
			//score = score + bonus + timebonus;			
			//$("#bonus").html("<br/>Tap Bonus: "+bonus+"! Time Bonus: "+timebonus+"!");
			$("#bonus").html("<br/>FewTaps Bonus: "+bonus+"!");
			$("#fini").html("Finished!<br/>");
			var scorestr = score + " + " + bonus + " = " + (score+bonus+timebonus);
			$("#score").html(scorestr);	
		} else {
			$("#bonus").html("");
			$("#fini").html("...not finished yet.<br/>");
    		$("#score").html(score);	
		}
		$("#tapscount").html(tapscount);	
	}

	function resetScores(){
		score = 0;
		tapscount = 0;
		$("#score").html("0");	
		$("#tapscount").html("0");	
		$("#fini").html("");
		$("#bonus").html("");
		gameover = false;
	}

	function isMatrixCompleted(){
		//matrix is completed when all is gray (0)
		var isDone = false;
		var graycount = getGraycount();
		if(graycount == matrixwidth * matrixheight) { 
			isDone = true; 
		}		
		return isDone;
	}

	function getGraycount(){
		var graycount = 0;
		for(var i = 0; i < matrixheight; i++){
			for(var j = 0; j < matrixwidth; j++){
				if(marr[i][j] == 0){
					graycount = graycount + 1;
				}				
			}
		}
		return graycount;	
	}

	function setLastGame(){
		// prepends #lastgames with a new score
		if(gameover){
			var bonus = getBonusScore();
			var timebonus = getTimeBonusScore();
			var scorestr = score + " + " + bonus + " = " + (score+bonus+timebonus);
			var laststr = "<li>Score: " + scorestr + " Taps: " + tapscount + "</li>\n";
			$("#lastgames").prepend(laststr);
		}
	}

	function resetLastGames(){
		// kills #lastgames content
		$("#lastgames").html("");
	}

	function newScore(thisccode){
		//tapscount must be incremented here because we hit this before we actually bump it up.  score as if the tap has already counted.
		var newscore = score;
		var newpts = (tapscount+1) * thisccode;
		return newscore + newpts;
	}

	function getBonusScore(){
		var tcount = tapscount; 
		if(tcount > matrixheight * matrixwidth) {
		    var tcount = matrixheight * matrixwidth;
		}
		var newpts = (Math.pow( 2*(matrixheight * matrixwidth - tapscount),2 )) / 2;
		return Math.floor(newpts);
	}

	function getTimeBonusScore(){
		//need to keep track of time to do this one.
		var duration = 20; //seconds
		if(duration > 30) {
		    duration = 30;
		}
		var tbonus = Math.pow((30 - duration),2);
		return Math.floor(tbonus);
	}

    function playTurnSquareCountBonus(sqcount){
        var sqbonus = Math.pow(sqcount,2);
        return sqbonus;
    }
});

