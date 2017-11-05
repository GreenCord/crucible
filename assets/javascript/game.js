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
		initpanels: ['#char-select','#char-chosen','#char-attackpool','#fight-section','#game-over'],

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
			cntratk: 10
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

		initializeGame: function(){
			var charkeys = this.chars;
			var areakeys = this.initpanels;
			var gameobj = this;
			console.log('Char Array: ' + charkeys);
			$.each(charkeys, function(index, value){ // reset hp and attack power
				console.log(index + ': ' + value);
				gameobj.resetChar(value);
			});
		},

		toggleAllPanels: function(){

			// $.each(areakeys, function(index, value){ // hide or show game areas
			// 	gameobj.toggleArea(value);	
			// });			
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

		clickHandler: function(objid){
		//define click action functions
			console.log('clickHandler called:');
			console.log(this);
			var charkeys = this.chars;
			var areakeys = this.initpanels;
			var gameobj = this;
			switch (this.phase) {
				// game phase pregame
				case 'pregame': 
					console.log('pregame phase detected');
					switch (objid) { // check object clicked
						
						case '#replay-btn':  // should always be this
							
							// populate #char-select-pool
							$.each(charkeys, function(index, value){
								gameobj.createTile(value,'#char-select-pool');
							});
							
							// show char select and update game phase
							gameobj.phase = 'select';
							gameobj.toggleArea('#char-select');
							gameobj.toggleArea('#game-over');
						break;

						default:
							alert('Something went wrong. (Phase - Pregame, clicked item ' + objid + ')');

					} // end pregame switch
					break;

				//game phase select - select character to play
				case 'select':
					console.log('select phase detected');
					console.log('objid is: ' + objid);
					var $objid = $(objid);
					var chosencharobj = objid.replace('#choose-','');
					console.log('chosencharobj = '+ chosencharobj);
					// put clicked character into player object
					gameobj.player = gameobj[chosencharobj];
					console.log('chosen player is');
					console.log(gameobj.player);

					// put player character into #char-chosen-pool
					$('#char-chosen-pool').append($objid);
					// remove clickable class
					$(objid).removeClass('clickable');
					// add hook for chosen-char
					$(objid).attr('id', 'chosen-char');

					// put other characters into #char-attack-pool
					var otherchars = $('#char-select-pool').html();
					console.log('otherchars: ' + otherchars);
					$('#char-attack-pool').append(otherchars);

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
					// choose defender to attack
					
					break;

				// game phase battle
				case 'battle':
					console.log();
					// click attack button
					break;

				// game phase gameover
				case 'gameover':
					console.log();
					// update game win/loss and display game over section
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
			var thisid = '#' + this.id;
			console.log(thisid + ' clicked!');
			game.clickHandler(thisid);
		});
	});
	// $('.clickable').on('click', function(){
	// 	var thisid = '#' + this.id;
	// 	console.log(thisid + " has been clicked");
	// 	game.clickHandler(thisid);	

	// });

});