$(document).ready(function(){

	// define game object
	var game = {

		chars: ['char1','char2','char3','char4'],
		initpanels: ['#char-select-pool','#char-chosen-pool','#char-attack-pool','#char-defender','#chars-defeated'],

		char1: {
			id: 'char1',
			name: 'Character 1',
			image: '<img src="https://placehold.it/320x240" alt="Character 1" />',
			imagedead: '',
			imagewin: '',
			imagelose: '',
			basehp: 100, // base/default HP
			currhp: null,  // current HP during game
			baseatk: 8,  // base attack power as player
			curratk: null, // current attack power as player during game
			cntratk: 10 // counter attack as enemy
		},

		char2: {
			id: 'char2',
			name: 'Character 2',
			image: '<img src="https://placehold.it/320x240" alt="Character 2" />',
			imagedead: '',
			imagewin: '',
			imagelose: '',
			basehp: 130,
			currhp: null,
			baseatk: 10,
			curratk: null,
			cntratk: 15
		},

		char3: {
			id: 'char3',
			name: 'Character 3',
			image: '<img src="https://placehold.it/320x240" alt="Character 3" />',
			imagedead: '',
			imagewin: '',
			imagelose: '',
			basehp: 110,
			currhp: null,
			baseatk: 5,
			curratk: null,
			cntratk: 20
		},

		char4: {
			id: 'char4',
			name: 'Character 4',
			image: '<img src="https://placehold.it/320x240" alt="Character 4" />',
			imagedead: '',
			imagewin: '',
			imagelose: '',
			basehp: 120,
			currhp: null,
			baseatk: 7,
			curratk: null,
			cntratk: 6
		},

		player: {},
		defender: {},
		attacking: false,
		numAttackers: null,
		phase: 'pregame', // game phase tracker | possible phases: pregame, select, begin, battle, gameover

		resetChar: function(objid) {  // resets the character object passed in to its original values
			console.log('Resetting: ' + objid);
			var character = this[objid];
			character.currhp = character.basehp;
			character.curratk = character.baseatk;
		},

		toggleArea: function(areaid) { // toggles visibility of area passed in
			$(areaid).slideToggle();
		},

		showArea: function(areaid,key) { // show an area
			if (key === undefined) {
				$(areaid).fadeIn('slow');
			} else {
				$(areaid).fadeIn(key);
			}
		},

		hideArea: function(areaid,key) { // hide an area
			if (key === undefined) {
				$(areaid).fadeOut('slow');
			} else {
				$(areaid).fadeOut(key);
			}
		},

		initializeGame: function(){ // initializes game
			var charkeys = this.chars;
			var gameobj = this;
			console.log('Char Array: ' + charkeys);
			$.each(charkeys, function(index, value){ // reset hp and attack power
				console.log(index + ': ' + value);
				gameobj.resetChar(value);
			});
			gameobj.numAttackers = 2;
		},

		clearAllPanels: function(){ // clears characters from game board
			var areakeys = this.initpanels;
			var gameobj = this;
			$.each(areakeys, function(index, value){ 
				$(value).empty();	
			});			
		},

		createTile: function(objid,targetid){ // creates character tiles
			/* Tile structure for reference
			<div id="" class="character-tile clickable">
                <div class="character-name">Character 1</div>
                <div class="character-pic"><img src="https://placehold.it/320x240" alt="char pic" /></div>
                <div class="character-hp">
                	<div class="character-currhp">100</div>
                </div>
            </div> */
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
            newdiv.append('<div class="character-hp"><div class="character-currhp">' + gameobjid.currhp + '</div></div>');
		},

		createSelectPool: function(){ // populates the character select pool
			var charkeys = this.chars;
			var gameobj = this;
			$.each(charkeys, function(index, value){
				gameobj.createTile(value,'#char-select-pool');
			});
		},

		fightText: function(text,classadd,classremove){ // update the fight text area
			$('#fight-text').text(text).addClass(classadd).removeClass(classremove);
		},

		resolveRound: function(playerobj, defenderobj){ // handles attack round
			var gameobj = this;
			// resolve an attack round.  Player's tile is always #chosen-char
			var defenderid = '#choose-'+defenderobj.id;
			console.log('resolving attack round');
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
			$(defenderid).children('.character-currhp').text(defenderobj.currhp);
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
			$('#chosen-char').children('.character-currhp').text(playerobj.currhp);

			console.log('Round resolved.');
		},

		clickHandler: function(objid){ //define click action functions
			var charkeys = this.chars;
			var gameobj = this;
			var $objid = $(objid);
			var chosencharobj = objid.replace('#choose-','');
			switch (this.phase) {
				case 'pregame': // game phase pregame
					if (objid === '#replay-btn') {
						// populate #char-select-pool and show char select and update game phase
						gameobj.createSelectPool();
						gameobj.phase = 'select';
						gameobj.showArea('#char-select');
						gameobj.hideArea('#game-over');
					} else {
						alert('Something went wrong. (Phase - Pregame, clicked item ' + objid + ')');
					}
					break; // end pregame phase

				case 'select': //game phase select - select character to play
					gameobj.player = gameobj[chosencharobj]; // put clicked character into player object
					$('#char-chosen-pool').append($objid); // put player character into #char-chosen-pool
					$objid.removeClass('clickable'); // remove clickable class
					$objid.attr('id', 'chosen-char'); // add hook for chosen-char
					$('#char-attack-pool').append($('#char-select-pool').children()); // put other characters into #char-attack-pool
					var arr = ['#char-chosen','#char-attackpool', '#char-select']; // show #char-chosen and #char-attackpool, hide #char-select
					$.each(arr, function(index, value){
						gameobj.toggleArea(value);
					});
					gameobj.phase = 'attack'; // update game phase
					break; //end select phase

				case 'attack': // game phase attack - select an enemy
					if (objid === '#attack-btn') { // handles replaying games to force an enemy selection
						gameobj.fightText('You must choose an enemy before you can attack!','warning','default');
					} else {
						$('#char-defender').append($objid);
						gameobj.defender = gameobj[chosencharobj]; // put values of chosen defender into defender object
						gameobj.showArea('#fight-section'); // display #fight-section
						gameobj.phase = 'battle'; // update game phase
					}
					break; // end attack phase - select an enemy

				case 'battle': // game phase battle
					var $parentid = $(objid).parent().attr('id'); // get parent id of clicked item
					switch ($parentid) {

						case 'char-defender': 
						// if it is char-defender, remove the defender and put back in #char-attack-pool, change game phase back to attack
							if (!gameobj.attacking) {
								gameobj.defender = {};
								$('#char-attack-pool').append($objid);
								gameobj.toggleArea('#fight-section');
								gameobj.phase = 'attack';
							} else {
								gameobj.fightText('You\'re in the heat of battle, you can\'t retreat!','warning','default');
							}
							break;

						case 'char-attack-pool':
						// if it is char-attack-pool, swap the characters
							if (!gameobj.attacking) {
								var $orig = $('#char-defender > div');
								var $origchar = $orig.attr('charid');
								var $origcharid = '#' + $orig.attr('id');
								gameobj[$origchar] = gameobj.defender;
								gameobj.defender = gameobj[chosencharobj];
								// swap tiles
								$('#char-attack-pool').append($($origcharid));
								$('#char-defender').append($(objid));
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
					// reinitialize game upon replay
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

});