$(document).ready(function() {  
  //Check for canvas support
  function canvasSupport() {
    return Modernizr.canvas;
  }
  
  canvasApp();
  
  function canvasApp() {
    //Check for canvas support
    if (!canvasSupport()) {
      return;
    } else {
      var theCanvas = document.getElementById('canvasOne');
      var context = theCanvas.getContext("2d"); 
    }
    
    // Variables
	var collisions = 0;
	var collisionsPerDay = 0;
	var totalDays = 0;
	var cyclesPerDay = 10;
	var mortalityRate = 0.02;
	var cycles = 0;
    var numBalls=200;
	var totalIll = 1;
	var totalNaive = numBalls;
	var totalImmune = 0;
	var totalDeaths = 0;
    var maxSize=5;
    var minSize=5;
    var minSpeed=2;
    var maxSpeed=2;
	var marginSize=200;
	var illColour = '#e74c3c';
	var naiveColour = '#f1c40f';
	var immuneColour = '#3498db';
	var deadColour = '#000000';
	var text1Colour = '#2ecc71';
	var text2Colour = '#d35400';
	var illnessLength = cyclesPerDay * 16;
	var textLeftMargin = theCanvas.width - marginSize;
    var balls=[];
    var tempBall;
    var tempX;
    var tempY;
    var tempSpeed;
    var tempAngle;
    var tempRadius;
    var tempRadians;
    var tempVelocityX;
    var tempVelocityY;
    var tempColour;
    
    // Find spots to place each ball so none start on top of each other
    for (var i = 0; i < numBalls; i += 1) {
      tempRadius = getRandomInt(minSize, maxSize);
      var placeOK = false;
      while (!placeOK) {
        tempX = tempRadius * 3 + (Math.floor(Math.random() * textLeftMargin) - tempRadius * 3);
        tempY = tempRadius * 3 + (Math.floor(Math.random() * theCanvas.height) - tempRadius * 3);
        tempSpeed = getRandomInt(minSpeed, maxSpeed);
        tempAngle = Math.floor(Math.random() * 360);
        tempRadians = tempAngle * Math.PI/180;
        tempVelocityX = Math.cos(tempRadians) * tempSpeed;
        tempVelocityY = Math.sin(tempRadians) * tempSpeed;
        //tempColour=get_random_colour();
        tempColour = naiveColour;
		
        tempBall = {
          x: tempX, 
          y: tempY, 
          nextX: tempX, 
          nextY: tempY, 
          radius: tempRadius, 
          speed: tempSpeed,
          angle: tempAngle,
          velocityX: tempVelocityX,
          velocityY: tempVelocityY,
          mass: tempRadius,
          colour: tempColour,
		  illness: 0
        };
        placeOK = canStartHere(tempBall);
      }
      balls.push(tempBall);
    }
    balls[balls.length-1].colour = illColour;
	balls[balls.length-1].illness = illnessLength;
    // Drawing interval
    setInterval(drawScreen, 33);
    
    // Functions
    // Returns true if a ball can start at given location, otherwise returns false
    function canStartHere(ball) {
      var retVal = true;
      for (var i = 0; i < balls.length; i += 1) {
        if (hitTestCircle(ball, balls[i])) {
          retVal = false;
        }
      }
      return retVal;
    }
    
    // Circle collision test to see if two balls are touching
    // Uses nextX and nextY to test for collision before it occurs
    function hitTestCircle(ball1, ball2) {
      var retVal = false;
      var dx = ball1.nextX - ball2.nextX;
      var dy = ball1.nextY - ball2.nextY;
      var distance = (dx * dx + dy * dy);
      if (distance <= (ball1.radius + ball2.radius) * (ball1.radius + ball2.radius) ) {
        retVal = true;
      }
      return retVal;
    }
    
    // Loops through all the balls in the balls array and updates the nextX and nextY properties
    // with current x and y velocities for each ball
    function update() {
	  totalIll = 0;
	  totalImmune = 0;
	  totalNaive = 0;
	  totalDeaths = 0;
      for (var i = 0; i < balls.length; i += 1) {
        ball = balls[i];
        ball.nextX = (ball.x += ball.velocityX);
        ball.nextY = (ball.y += ball.velocityY);
		if ( ball.illness > 1 ) {
			ball.illness -= 1;
		} else if ( ball.illness == 1 ) {
			ball.illness = 0;
			if (Math.random() < mortalityRate ) {
				ball.colour = deadColour;
			} else {
				ball.colour = immuneColour;
			}
		}
		if (ball.colour == illColour) {
			totalIll += 1;
		}
		else if (ball.colour == immuneColour ) {
		totalImmune += 1;
		}
		else if (ball.colour == naiveColour ) {
			totalNaive += 1;
		}
		else if (ball.colour == deadColour ) {
			totalDeaths +=1 ;
		}
      }
	  cycles += 1;
	  if ( totalIll > 0 && cycles >= cyclesPerDay ) {
		  totalDays += 1;
		  collisionsPerDay = collisions/totalDays;
	  }
    }
    
    // We track balls by their center, so we test for all collision by adding or subtracting
    // each ball's radius before testing for wall collision
    function testWalls() {
      var ball;
      var testBall;
      
      for (var i = 0; i < balls.length; i += 1) {
        ball = balls[i];
        
        if (ball.nextX + ball.radius > textLeftMargin) { // right wall
          ball.velocityX = ball.velocityX * (-1);
          ball.nextX = textLeftMargin - ball.radius;
          
        } else if (ball.nextX - ball.radius < 0) { // top wall
          ball.velocityX = ball.velocityX * (-1);
          ball.nextX = ball.radius;
          
        } else if (ball.nextY + ball.radius > theCanvas.height) { // bottom wall
          ball.velocityY = ball.velocityY * (-1);
          ball.nextY = theCanvas.height - ball.radius;
          
        } else if (ball.nextY - ball.radius < 0) { // left wall
          ball.velocityY = ball.velocityY * (-1);
          ball.nextY = ball.radius;
        }
      }
    }
    
    // Tests whether any balls have hit each other. 
    // Uses two next loops to iterate through the balls array and test each ball against every other ball.
    function collide() {
      var ball;
      var testBall;
      for (var i = 0; i < balls.length; i += 1) {
        ball = balls[i];
        for (var j = i + 1; j < balls.length; j += 1) {
          testBall = balls[j];
          if (hitTestCircle(ball, testBall) && ball.colour != deadColour && testBall.colour != deadColour ) {
			if ( totalIll > 0 ) {
				collisions +=1;
				}
			if (testBall.colour == illColour && ball.colour == naiveColour) 
			{
				ball.colour = illColour;
				ball.illness = illnessLength;
			}
			if	(ball.colour == illColour && testBall.colour == naiveColour)
			{
				testBall.colour = illColour
				testBall.illness = illnessLength;
			}
            collideBalls(ball, testBall);
          }
        }
      }
    }
    
    // Updates properties of colliding balls so they appear to bounce off each other.
    // Uses nextX and nextY properties because we don't want to change where they are at the moment.
    function collideBalls(ball1, ball2) {
      var dx = ball1.nextX - ball2.nextX;
      var dy = ball1.nextY - ball2.nextY;
      var collisionAngle = Math.atan2(dy, dx);
      
      // Get velocities of each ball before collision
      var speed1 = Math.sqrt(ball1.velocityX * ball1.velocityX + ball1.velocityY * ball1.velocityY);
      var speed2 = Math.sqrt(ball2.velocityX * ball2.velocityX + ball2.velocityY * ball2.velocityY);
      
      // Get angles (in radians) for each ball, given current velocities
      var direction1 = Math.atan2(ball1.velocityY, ball1.velocityX);
      var direction2 = Math.atan2(ball2.velocityY, ball2.velocityX);
      
      // Rotate velocity vectors so we can plug into equation for conservation of momentum
      var rotatedVelocityX1 = speed1 * Math.cos(direction1 - collisionAngle);
      var rotatedVelocityY1 = speed1 * Math.sin(direction1 - collisionAngle);
      var rotatedVelocityX2 = speed2 * Math.cos(direction2 - collisionAngle);
      var rotatedVelocityY2 = speed2 * Math.sin(direction2 - collisionAngle);
      
      // Update actual velocities using conservation of momentum
      /* Uses the following formulas:
           velocity1 = ((mass1 - mass2) * velocity1 + 2*mass2 * velocity2) / (mass1 + mass2)
           velocity2 = ((mass2 - mass1) * velocity2 + 2*mass1 * velocity1) / (mass1 + mass2)
      */
      var finalVelocityX1 = ((ball1.mass - ball2.mass) * rotatedVelocityX1 + (ball2.mass + ball2.mass) * rotatedVelocityX2) / (ball1.mass + ball2.mass);
      var finalVelocityX2 = ((ball1.mass + ball1.mass) * rotatedVelocityX1 + (ball2.mass - ball1.mass) * rotatedVelocityX2) / (ball1.mass + ball2.mass);
      
      // Y velocities remain constant
      var finalVelocityY1 = rotatedVelocityY1;
      var finalVelocityY2 = rotatedVelocityY2;
      
      // Rotate angles back again so the collision angle is preserved
      ball1.velocityX = Math.cos(collisionAngle) * finalVelocityX1 + Math.cos(collisionAngle + Math.PI/2) * finalVelocityY1;
      ball1.velocityY = Math.sin(collisionAngle) * finalVelocityX1 + Math.sin(collisionAngle + Math.PI/2) * finalVelocityY1;
      ball2.velocityX = Math.cos(collisionAngle) * finalVelocityX2 + Math.cos(collisionAngle + Math.PI/2) * finalVelocityY2;
      ball2.velocityY = Math.sin(collisionAngle) * finalVelocityX2 + Math.sin(collisionAngle + Math.PI/2) * finalVelocityY2;
      
      // Update nextX and nextY for both balls so we can use them in render() or another collision
      ball1.nextX += ball1.velocityX;
      ball1.nextY += ball1.velocityY;
      ball2.nextX += ball2.velocityX;
      ball2.nextY += ball2.velocityY;
    }
    
    // Draws and updates each ball
    function render() {
      var ball;
      
      for (var i = 0; i < balls.length; i += 1) {
        ball = balls[i];
        context.fillStyle = ball.colour;
        ball.x = ball.nextX;
        ball.y = ball.nextY;
        if (ball.colour != deadColour ) {
			context.beginPath();
			context.arc(ball.x, ball.y, ball.radius, 0, Math.PI *2, true);
			context.closePath();
			context.fill();
		} else {
			context.beginPath();
			context.lineWidth = 2;
			context.moveTo(ball.x - 5, ball.y - 5);
			context.lineTo(ball.x + 5, ball.y + 5);	
			context.moveTo(ball.x + 5, ball.y - 5);
			context.lineTo(ball.x - 5, ball.y + 5);
			context.stroke();
			ball.velocityX = 0;
			ball.velocityY = 0;
			context.lineWidth = 1;
		}
      }
    }
    
    // Draws/updates the screen
    function drawScreen() {
      // Reset canvas
      context.fillStyle = "#EEEEEE";
      context.fillRect(0, 0, theCanvas.width, theCanvas.height);
      
      // Outside border
      context.strokeStyle = "#000000";
      context.strokeRect(1, 1, textLeftMargin, theCanvas.height - 2);
	  context.fillStyle = "#000000";
	  context.font = "30px Arial";
	  context.fillText("SimPlague",textLeftMargin + 10,35);
	  context.font = "20px Arial";
	  context.fillText("Infected:",textLeftMargin + 20,65);
	  context.fillText(totalIll.toString(),textLeftMargin + 140,65);
	  context.fillText("Naive:",textLeftMargin + 20,85);
	  context.fillText(totalNaive.toString(),textLeftMargin + 140,85);
	  context.fillText("Recovered:",textLeftMargin + 20,105);
	  context.fillText(totalImmune.toString(),textLeftMargin + 140,105);
	  context.fillText("Dead:",textLeftMargin + 20,125);
	  context.fillText(totalDeaths.toString(),textLeftMargin + 140,125);
      context.fillStyle = illColour;
      context.beginPath();
      context.arc(textLeftMargin+10, 59, maxSize, 0, Math.PI *2, true);
      context.closePath();
      context.fill();
	  context.fillStyle = naiveColour;
      context.beginPath();
      context.arc(textLeftMargin+10, 79, maxSize, 0, Math.PI *2, true);
      context.closePath();
      context.fill();
	  context.fillStyle = immuneColour;
      context.beginPath();
      context.arc(textLeftMargin+10, 99, maxSize, 0, Math.PI *2, true);
      context.closePath();
      context.fill();
	  context.beginPath();
      context.lineWidth = 2;
	  context.moveTo(textLeftMargin+5, 119 - 5);
	  context.lineTo(textLeftMargin+15, 119 + 5);	
	  context.moveTo(textLeftMargin+15, 119 - 5);
	  context.lineTo(textLeftMargin+5, 119 + 5);
	  context.stroke();
	  context.lineWidth = 1;
	  context.fillStyle = text1Colour;
	  context.fillText("Days:",textLeftMargin + 20,165);
	  context.fillText(totalDays.toString(),textLeftMargin + 100,165);
	  context.fillStyle = illColour;
	  context.fillText("CPD:",textLeftMargin + 20,185);
	  context.fillText(collisionsPerDay.toFixed(2).	toString(),textLeftMargin + 100,185);
	  context.fillStyle = text2Colour;
	  context.fillText("Illness profile:",textLeftMargin+5,300);
	  context.fillText("Duration (days):",textLeftMargin+10,320);
	  context.fillText(illnessLength/cyclesPerDay.toString(),textLeftMargin+160,320);
	  context.fillText("Mortality:",textLeftMargin+10,340);
	  context.fillText((mortalityRate*100).toString()+"%",textLeftMargin+160,340);
	  update();
      testWalls();
      collide();
      render();
    }
    
    //returns a random integer between 2 given values.
    function getRandomInt(minVal, maxVal) {
     return Math.floor(Math.random() * (maxVal - minVal+1) + minVal);
    }
    
    //returns a random html colour
    function get_random_colour() {
	  var letters = '0123456789ABCDEF'.split('');
      var colour = '#';
      for (var i = 0; i < 6; i++ ) {
        colour += letters[Math.round(Math.random() * 15)];
      }
      return colour;
    }
  }
  
});