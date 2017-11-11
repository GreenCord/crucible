$(document).ready(function(){
	
	// theme music
	

	// define game object
	var game = {

		chars: ['char1','char2','char3','char4'],
		initpanels: ['#char-select-pool','#char-chosen-pool','#char-attack-pool','#char-defender','#chars-defeated'],
		player: {},	// during battle, this is the player's object
		defender: {}, // during battle, this is the defender's object
		attacking: false, // when true, player has attacked an opponent and can't switch
		wonRound: false,
		numAttackers: null, // number of attackers to face (0 based)
		phase: 'pregame', // game phase tracker | possible phases: pregame, select, begin, battle, gameover

		// audio
		intromusic: new Audio('./assets/sounds/game.ogg'),
		gamestart: new Audio('./assets/sounds/game-start.ogg'),
		charselect: new Audio('./assets/sounds/player-select.ogg'),
		battlemusic: new Audio('./assets/sounds/battle-music.ogg'),
		victorymusic: new Audio('./assets/sounds/victory-music.ogg'),
		defeatedmusic: new Audio('./assets/sounds/defeated-music.ogg'),
		hitsound: new Audio('./assets/sounds/hit.ogg'),
		defenderdeath: new Audio('./assets/sounds/defender-death.ogg'),
		playerdeath: new Audio('./assets/sounds/player-death.ogg'),
		
		// characters
		char1: {
			id: 'char1',
			name: 'Yellow Warrior',
			image: '<img src="./assets/images/yellowwarrior.jpg" alt="Image of the Yellow Warrior" />',
			imagedead: '',
			imagewin: '',
			imagelose: '',
			basehp: 150, // base/default HP
			currhp: null,  // current HP during game
			baseatk: 10,  // base attack power as player
			curratk: null, // current attack power as player during game
			cntratk: 22, // counter attack as enemy
			halfhealth: 'I\'ve not seen such bravery!', // text to display when, as player, has <50% health
			quarterhealth: 'Yellow Warrior is about to die.' // text to deplay when, as player, has <25% health 
		},

		char2: {
			id: 'char2',
			name: 'Blue Valkyrie',
			image: '<img src="./assets/images/bluevalkyrie.jpg" alt="Image of the Blue Valkyrie" />',
			imagedead: '',
			imagewin: '',
			imagelose: '',
			basehp: 110,
			currhp: null,
			baseatk: 15,
			curratk: null,
			cntratk: 25,
			halfhealth: 'Your life force is running out.',
			quarterhealth: 'Blue Valkyrie is about to die.'
		},

		char3: {
			id: 'char3',
			name: 'Red Wizard',
			image: '<img src="./assets/images/redwizard.jpg" alt="Image of the Red Wizard" />',
			imagedead: '',
			imagewin: '',
			imagelose: '',
			basehp: 90,
			currhp: null,
			baseatk: 16,
			curratk: null,
			cntratk: 40,
			halfhealth: 'Red Wizard needs food badly.',
			quarterhealth: 'Red Wizard is about to die.'
		},

		char4: {
			id: 'char4',
			name: 'Green Elf',
			image: '<img src="./assets/images/greenelf.jpg" alt="Image of the Green Elf" />',
			imagedead: '',
			imagewin: '',
			imagelose: '',
			basehp: 100,
			currhp: null,
			baseatk: 20,
			curratk: null,
			cntratk: 15,
			halfhealth: 'Green Elf has shot the food.',
			quarterhealth: 'Green Elf is about to die.'
		},

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
			var areakeys = this.initpanels;
			var charkeys = this.chars;
			var gameobj = this;
			console.log('Char Array: ' + charkeys);
			$.each(areakeys, function(index, value){ // clears all characters from game board
				$(value).empty();	
			});			
			$.each(charkeys, function(index, value){ // reset hp and attack power
				console.log(index + ': ' + value);
				gameobj.resetChar(value);
			});
			gameobj.numAttackers = 2;
			gameobj.wonRound = false;
			game.playSound(game.intromusic,true);
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

		fightText: function(text,classadd,classremove,classremove2){ // update the fight text area
			$('#fight-text').text(text).addClass(classadd).removeClass(classremove).removeClass(classremove2);
		},

		resolveRound: function(playerobj, defenderobj){ // handles attack round
			var gameobj = this;
			// resolve an attack round.  Player's tile is always #chosen-char
			var defenderid = '#choose-'+defenderobj.id;
			console.log('resolving attack round');
			// player attacks defender ( defender.currhp - player.curratk )
				// update defender hp
			console.log('Player attacks defender:');
			console.log(defenderobj.currhp + '=' + defenderobj.currhp + '-' + playerobj.curratk);
			var tempdefenderhp = defenderobj.currhp - playerobj.curratk;
			if (tempdefenderhp <= 0) { 
				gameobj.playSound(gameobj.defenderdeath,false);
				defenderobj.currhp = 0;
				gameobj.wonRound = true;

				// if defender dead, if there are more attackers, choose a new one, or else game won
				if (gameobj.numAttackers > 0) {
					gameobj.numAttackers--;
					gameobj.fightText('You defeated your enemy! Choose a new enemy to attack!','default','caution','warning');
					gameobj.attacking = false;
					gameobj.phase = 'attack';
				} else {
					gameobj.phase = 'gameover';
					$('#game-over-title').text('You emerged victorious!');
					$('#game-over-text').text('After so many rounds of battle, you are battered and bruised. Yet you live to fight again.');
					gameobj.playSound(gameobj.victorymusic,true);
					$('#replay-btn').text('Play Again');
					gameobj.hideArea('#char-attackpool','fast');
					gameobj.hideArea('#fight-section','fast');
					gameobj.showArea('#game-over','fast');
				}

				$('#chars-defeated').append($(defenderid));

			} else { 
				defenderobj.currhp = tempdefenderhp; 
			}

			var currhppercent = Math.round(defenderobj.currhp / defenderobj.basehp * 100);
			$(defenderid).children('.character-hp').children('.character-currhp').text(defenderobj.currhp).css('width', currhppercent+'%');
				// increase player curratk power
			playerobj.curratk += playerobj.baseatk;

			// defender attacks player ( player.currhp - defender.cntratk ) - only if player hasn't won first
			if (!gameobj.wonRound) {
				console.log('Defender attacks player:');
				console.log(playerobj.currhp + '=' + playerobj.currhp + '-' + defenderobj.cntratk);
				var tempplayerhp = playerobj.currhp - defenderobj.cntratk;
					// update player hp
				if (tempplayerhp <= 0) {
					gameobj.playSound(gameobj.playerdeath,false);
					playerobj.currhp = 0;
					// if player is dead, trigger game over
					gameobj.playSound(gameobj.defeatedmusic,true);
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
			}
			currhppercent = Math.round(playerobj.currhp / playerobj.basehp * 100);
			if( !$.trim( $('#char-defender').html() ).length ) {
				console.log('trim encountered');
				gameobj.fightText('You defeated your enemy! Choose a new enemy to attack!','default','caution','warning');
				
			} else {
				console.log('trim not encountered');
				if ((currhppercent < 50) && (currhppercent > 25)) {
					gameobj.fightText(playerobj.halfhealth,'caution','warning','default');
				} else if ((currhppercent < 25) && (currhppercent > 0)) {
					gameobj.fightText(playerobj.quarterhealth,'caution','warning','default');
				}
				
			}
			$('#chosen-char').children('.character-hp').children('.character-currhp').text(playerobj.currhp).css('width', currhppercent+'%');
			gameobj.wonRound = false;

			console.log('Round resolved.');
		},

		playSound: function(objid,loop){
			if (loop) {
				if ((this.intromusic.duration > 0) && (!this.intromusic.paused)) { 
					this.intromusic.pause();
					this.intromusic.currentTime = 0;
				}
				if ((this.battlemusic.duration > 0) && (!this.battlemusic.paused)) { 
					this.battlemusic.pause();
					this.battlemusic.currentTime = 0;
				}
				if ((this.victorymusic.duration > 0) && (!this.victorymusic.paused)) { 
					this.victorymusic.pause();
					this.victorymusic.currentTime = 0;
				}
				if ((this.defeatedmusic.duration > 0) && (!this.defeatedmusic.paused)) {
					this.defeatedmusic.pause();
					this.defeatedmusic.currentTime = 0;
				}
				objid.addEventListener('ended', function(){
				objid.currentTime = 0;
				objid.play();
				}, false);
			}
			objid.currentTime = 0;
			objid.play();
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
						gameobj.playSound(gameobj.gamestart,false);
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
					gameobj.playSound(gameobj.charselect,false);
					gameobj.phase = 'attack'; // update game phase
					break; //end select phase

				case 'attack': // game phase attack - select an enemy
					if (objid === '#attack-btn') { // handles replaying games to force an enemy selection
						gameobj.fightText('You must choose an enemy before you can attack!','warning','default','caution');
					} else {
						$('#char-defender').append($objid);
						gameobj.defender = gameobj[chosencharobj]; // put values of chosen defender into defender object
						gameobj.showArea('#fight-section'); // display #fight-section
						gameobj.playSound(gameobj.charselect,false);
						gameobj.playSound(gameobj.battlemusic,true);
						gameobj.phase = 'battle'; // update game phase
					}
					break; // end attack phase - select an enemy

				case 'battle': // game phase battle
					var $parentid = $(objid).parent().attr('id'); // get parent id of clicked item
					switch ($parentid) {

						case 'char-defender': 
						// if thing clicked is char-defender, remove the defender and put back in #char-attack-pool, change game phase back to attack
							if (!gameobj.attacking) {
								gameobj.defender = {};
								$('#char-attack-pool').append($objid);
								gameobj.toggleArea('#fight-section');
								gameobj.playSound(gameobj.charselect,false);
								gameobj.playSound(gameobj.intromusic,true);
								gameobj.phase = 'attack';
							} else { // catches when player clicks on defender while actively in battle
								gameobj.fightText('You\'re in the heat of battle, you can\'t retreat!','warning','default','caution');
							}
							break;

						case 'char-attack-pool':
						// if thing clicked is in the char-attack-pool, swap it with defender
							if (!gameobj.attacking) {
								var $orig = $('#char-defender > div');
								var $origchar = $orig.attr('charid');
								var $origcharid = '#' + $orig.attr('id');
								gameobj[$origchar] = gameobj.defender;
								gameobj.defender = gameobj[chosencharobj];
								// swap tiles
								$('#char-attack-pool').append($($origcharid));
								$('#char-defender').append($(objid));
								gameobj.playSound(gameobj.charselect,false);
							} else { // catches when player clicks on attacker pool while actively in battle
								gameobj.fightText('You\'re in the heat of battle, you can\'t change attackers now!','warning','default','caution');
							}
							break;

						case 'char-attackbtn':
						// if it is char-attackbtn, then attack!
							console.log('ATTAAAAAAACK!');
							gameobj.playSound(gameobj.hitsound,false);
							gameobj.attacking = true;
							gameobj.fightText('You engage in a round of battle!','default','warning','caution');
							gameobj.resolveRound(gameobj.player,gameobj.defender);
							break;

						default: 
							alert('i dunno what happened in the battle phase'); // this should never trigger
					}
					
					
					
					break;

				// game phase gameover
				case 'gameover':
					// reinitialize game upon replay
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
	
	// capture click action
	$(document).click(function(event){
		$(event.target).closest('.clickable').each(function(){
			var objid = '#' + this.id;
			console.log(objid + ' clicked!');
			game.clickHandler(objid);
		});
	});

});