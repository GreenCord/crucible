$(document).ready(function(){

	// define game object
	var game = {

		//define characters
			// name
			// image
			// hit points
			// current hit points
			// attack power
			// current attack power
			// counter attack power
		chars: ['char1','char2','char3','char4'],
		initpanels: ['#char-select-pool','#char-chosen-pool','#char-attack-pool','#char-defender','#chars-defeated'],

		char1: {
			id: 'char1',
			name: 'Character 1',
			image: '<img src="https://placehold.it/320x240" alt="Character 1" />',
			basehp: 100,
			currhp: null,
			baseatk: 5,
			curratk: null,
			cntratk: 10
		},

		char2: {
			id: 'char2',
			name: 'Character 2',
			image: '<img src="https://placehold.it/320x240" alt="Character 2" />',
			basehp: 100,
			currhp: null,
			baseatk: 5,
			curratk: null,
			cntratk: 50
		},

		char3: {
			id: 'char3',
			name: 'Character 3',
			image: '<img src="https://placehold.it/320x240" alt="Character 3" />',
			basehp: 100,
			currhp: null,
			baseatk: 5,
			curratk: null,
			cntratk: 10
		},

		char4: {
			id: 'char4',
			name: 'Character 4',
			image: '<img src="https://placehold.it/320x240" alt="Character 4" />',
			basehp: 100,
			currhp: null,
			baseatk: 5,
			curratk: null,
			cntratk: 10
		},

		player: {},
		defender: {},
		attacking: false,
		numAttackers: null,

		//define game phase tracker

		phase: 'pregame', // possible phases: pregame, select, begin, battle, gameover

		//define game initialization

		resetChar: function(objid) {
			console.log('Resetting: ' + objid);
			var character = this[objid];
			character.currhp = character.basehp;
			character.curratk = character.baseatk;
		},

		toggleArea: function(areaid) {
			// if ($(areaid).is(':hidden')) {
			// 	$(areaid).show();
			// } else {
			// 	$(areaid).hide();
			// }
			$(areaid).slideToggle();
		},

		showArea: function(areaid,key) {
			if (key === undefined) {
				$(areaid).fadeIn('slow');
			} else {
				$(areaid).fadeIn(key);
			}

		},

		hideArea: function(areaid,key) {
			if (key === undefined) {
				$(areaid).fadeOut('slow');
			} else {
				$(areaid).fadeOut(key);
			}
		},

		initializeGame: function(){
			var charkeys = this.chars;
			var gameobj = this;
			console.log('Char Array: ' + charkeys);
			$.each(charkeys, function(index, value){ // reset hp and attack power
				console.log(index + ': ' + value);
				gameobj.resetChar(value);
			});
			gameobj.numAttackers = 2;
		},

		clearAllPanels: function(){
			var areakeys = this.initpanels;
			var gameobj = this;
			$.each(areakeys, function(index, value){ // clear game areas
				$(value).empty();	
			});			
		},

		createTile: function(objid,targetid){
			/* Tile structure
			<div id="" class="character-tile clickable">
                <div class="character-name">Character 1</div>
                <div class="character-pic"><img src="https://placehold.it/320x240" alt="char pic" /></div>
                <div class="character-hp">100</div>
            </div> 
            */
            var gameobjid = this[objid];
            console.log('Creating tiles');
            console.log('objid = ' + objid);
            console.log('targetid = ' + targetid);
            // start building tile
            var createid = 'choose-' + gameobjid.id;
            $(targetid).append('<div id="' + createid + '"></div>');
            var newdiv = $('#'+createid);
            newdiv.attr('charid', gameobjid.id);
            newdiv.addClass('character-tile clickable');
            newdiv.append('<div class="character-name">' + gameobjid.name + '</div>');
            newdiv.append('<div class="character-pic" alt="'+ gameobjid.name + '">' + gameobjid.image + '</div>');
            newdiv.append('<div class="character-hp">' + gameobjid.currhp + '</div>');

		},

		createSelectPool: function(){
			var charkeys = this.chars;
			var gameobj = this;
			$.each(charkeys, function(index, value){
				gameobj.createTile(value,'#char-select-pool');
			});
		},

		fightText: function(text,classadd,classremove){
			$('#fight-text').text(text).addClass(classadd).removeClass(classremove);
		},

		resolveRound: function(playerobj, defenderobj){
			var gameobj = this;
			// resolve an attack round.  Player's tile is always #chosen-char
			var defenderid = '#choose-'+defenderobj.id;
			console.log('resolving attack round');
			console.log('playerobj: #chosen-char');
			console.log(playerobj);
			console.log('defenderobj:');
			console.log(defenderid);
			console.log(defenderobj);
			// player attacks defender ( defender.currhp - player.curratk )
				// update defender hp
			console.log('Player attacks defender:')
			console.log(defenderobj.currhp + '=' + defenderobj.currhp + '-' + playerobj.curratk);
			var tempdefenderhp = defenderobj.currhp - playerobj.curratk;
			if (tempdefenderhp <= 0) { 
				defenderobj.currhp = 0;

				// if defender dead, if there are more attackers, choose a new one, or else game won
				if (gameobj.numAttackers > 0) {
					
					gameobj.numAttackers--;
					gameobj.fightText('Choose a new enemy to attack!');
					gameobj.attacking = false;
					gameobj.phase = 'attack';
				} else {
					gameobj.phase = 'gameover';
					$('#game-over-title').text('You emerged victorious!');
					$('#game-over-text').text('After so many rounds of battle, you are battered and bruised. Yet you live to fight again.');
					$('#replay-btn').text('Play Again');
					gameobj.hideArea('#char-attackpool','fast');
					gameobj.hideArea('#fight-section','fast');
					gameobj.showArea('#game-over','fast');
				}

				$(defenderid).fadeOut;
				$('#chars-defeated').append($(defenderid));

			} else { 
				defenderobj.currhp = tempdefenderhp; 
			}
			$(defenderid).children('.character-hp').text(defenderobj.currhp);
				// increase player curratk power
			playerobj.curratk += playerobj.baseatk;

			// defender attacks player ( player.currhp - defender.cntratk )
			console.log('Defender attacks player:')
			console.log(playerobj.currhp + '=' + playerobj.currhp + '-' + defenderobj.cntratk);
			var tempplayerhp = playerobj.currhp - defenderobj.cntratk;
				// update player hp
			if (tempplayerhp <= 0) {
				playerobj.currhp = 0;
				// if player is dead, trigger game over
				gameobj.phase = 'gameover';
				$('#game-over-title').text('You have been defeated.');
				$('#game-over-text').text('You fought valiantly, but your foes were too powerful.');
				$('#replay-btn').text('Play Again');
				gameobj.hideArea('#char-attackpool','fast');
				gameobj.hideArea('#fight-section','fast');
				gameobj.showArea('#game-over','fast');
			} else {  // player still alive
				playerobj.currhp = tempplayerhp;
			}
			$('#chosen-char').children('.character-hp').text(playerobj.currhp);

			console.log('Round resolved.');
		},

		clickHandler: function(objid){
		//define click action functions
			console.log('clickHandler called:');
			console.log(this);
			var charkeys = this.chars;
			// var areakeys = this.initpanels;
			var gameobj = this;
			var $objid = $(objid);
			var chosencharobj = objid.replace('#choose-','');
			console.log('chosencharobj: ' + chosencharobj);
			switch (this.phase) {
				// game phase pregame
				case 'pregame': 
					console.log('pregame phase detected');
					switch (objid) { // check object clicked
						
						case '#replay-btn':  // should always be this
							
							// populate #char-select-pool
							gameobj.createSelectPool();
							// $.each(charkeys, function(index, value){
							// 	gameobj.createTile(value,'#char-select-pool');
							// });
							
							// show char select and update game phase
							gameobj.phase = 'select';
							gameobj.showArea('#char-select');
							gameobj.hideArea('#game-over');
						break;

						default:
							alert('Something went wrong. (Phase - Pregame, clicked item ' + objid + ')');

					} // end pregame switch
					break;

				//game phase select - select character to play
				case 'select':
					console.log('select phase detected');
					console.log('objid is: ' + objid);
					console.log('chosencharobj = '+ chosencharobj);
					// put clicked character into player object
					gameobj.player = gameobj[chosencharobj];
					console.log('chosen player is');
					console.log(gameobj.player);

					// put player character into #char-chosen-pool
					$('#char-chosen-pool').append($objid);
					// remove clickable class
					$objid.removeClass('clickable');
					// add hook for chosen-char
					$objid.attr('id', 'chosen-char');

					// put other characters into #char-attack-pool

					// bugged code: this doesn't move original divs
					// var otherchars = $('#char-select-pool').html();
					// console.log('otherchars: ' + otherchars);
					// $('#char-attack-pool').append(otherchars);

					// update for bugged code - get divs in #char-select-pool
					$('#char-attack-pool').append($('#char-select-pool').children());


					// show #char-chosen and #char-attackpool, hide #char-select
					var arr = ['#char-chosen','#char-attackpool', '#char-select'];
					$.each(arr, function(index, value){
						gameobj.toggleArea(value);
					});
					gameobj.phase = 'attack';
					
					break;

				// game phase attack
				case 'attack':
					console.log('attack phase detected');
					// choose defender to attack and move to #char-defender
					
					// bugged code: no longer moves defender after updating char-select-pool bug
					// $('#char-defender').append($objid);
					// $(objid).remove();

					// update for bugged code - append actual div of defender chosen
					console.log('checking clicked thing: '+objid);
					if (objid === '#attack-btn') {
						gameobj.fightText('You must choose an enemy before you can attack!','warning','default');
					} else {
						$('#char-defender').append($objid);

						// put values of chosen defender into defender object
						gameobj.defender = gameobj[chosencharobj];
						console.log('defender object is:');
						console.log(gameobj.defender);

						// display #fight-section
						gameobj.showArea('#fight-section');
						gameobj.phase = 'battle';
					}
					break;

				// game phase battle
				case 'battle':
					console.log('battle phase detected');
					console.log('current gameobj is: ');
					console.log(gameobj);
					// check parent id of clicked item
					console.log('Parent id is: ' + $(objid).parent().attr('id'));
					var $parentid = $(objid).parent().attr('id');
					switch ($parentid) {

						case 'char-defender': 
						// if it is char-defender, remove the defender and put back in #char-attack-pool, change game phase back to attack
							if (!gameobj.attacking) {
								console.log('Defender was clicked. Moving back to pool.');
								// clear current defender
								gameobj.defender = {};
								console.log('defender object is now cleared:');
								console.log(gameobj.defender);
								// move defender back to pool
								$('#char-attack-pool').append($objid);
								// change game phase back to attack
								gameobj.toggleArea('#fight-section');
								gameobj.phase = 'attack';
							} else {
								gameobj.fightText('You\'re in the heat of battle, you can\'t retreat!','warning','default');
							}
							break;

						case 'char-attack-pool':
						// if it is char-attack-pool, swap the characters
							if (!gameobj.attacking) {
								console.log('Another character was chosen. Swapping characters.');

								// switch current defender
								console.log('swapping defenders, new defender is: ' + objid + '/' + chosencharobj);

								
								// update current defender's original char
								var $orig = $('#char-defender > div');
								var $origchar = $orig.attr('charid');
								var $origcharid = '#' + $orig.attr('id');
								console.log('old defender is: ' + $origcharid);
								gameobj[$origchar] = gameobj.defender;
								gameobj.defender = gameobj[chosencharobj];
								console.log('swapped defenders: ');
								console.log(gameobj);

								// swap tiles
								$('#char-attack-pool').append($($origcharid));
								$('#char-defender').append($(objid));
								console.log('characters swapped');
							} else {
								gameobj.fightText('You\'re in the head of battle, you can\'t change attackers now!','warning','default');
							}
							break;

						case 'char-attackbtn':
						// if it is char-attackbtn, then attack!
							console.log('ATTAAAAAAACK!');
							gameobj.attacking = true;
							gameobj.fightText('You engage in a round of battle!','default','warning');
							var playerobj = gameobj.player;
							var defenderobj = gameobj.defender;
							gameobj.resolveRound(playerobj,defenderobj);
							break;

						default: 
							alert('i dunno what happened in the battle phase');
					}
					
					
					
					break;

				// game phase gameover
				case 'gameover':
					console.log('gameover phase detected');
					// update game win/loss and display game over section
					gameobj.clearAllPanels();
					gameobj.initializeGame();
					gameobj.createSelectPool();
					gameobj.phase = 'select';
					gameobj.hideArea('#char-chosen',0);
					gameobj.hideArea('#game-over',0);
					gameobj.showArea('#char-select');
					break;

				default:
					alert('wut');
			} // end game phase switch
		}

	};// end game object

	
	// initialize game
	game.initializeGame();
	console.log('Initialized Game Object');
	console.log(game);

	// capture click action
	$(document).click(function(event){
		$(event.target).closest('.clickable').each(function(){
			var objid = '#' + this.id;
			console.log(objid + ' clicked!');
			game.clickHandler(objid);
		});
	});
	// $('.clickable').on('click', function(){
	// 	var thisid = '#' + this.id;
	// 	console.log(thisid + " has been clicked");
	// 	game.clickHandler(thisid);	

	// });

});