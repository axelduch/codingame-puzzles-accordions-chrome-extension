chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			// ----------------------------------------------------------
			// This part of the script triggers when page is done loading
			console.log("Setting up puzzle sections togglers");
			// ----------------------------------------------------------
			var prevUrl;
			var currentUrl = window.location.pathname;
			var app;
			var state;


			function setup () {
					var activationUrls = ['/games/puzzles'];
					watchUrlChanges(activationUrls, activate);

					if (urlMatches(currentUrl, activationUrls)) {
						activate();
					}
			}


			function activate () {
				var puzzleSections = getPuzzleSections();

				attachTogglers(puzzleSections);

				persistentState = new PersistentState('codingame-puzzle-sections');

				persistentState.data.puzzleSections = persistentState.data.puzzleSections ||
				puzzleSections.map(function () { return 0; });

				var togglableElements = puzzleSections.map(locateElementToToggle);

				persistentState.data.puzzleSections.forEach(function (hidden, index) {
					if (hidden) {
						hide(togglableElements[index]);
					}
				});

				persistentState.save();

				app = {
					puzzleSections: puzzleSections,
					persistentState: persistentState
				};
			}


			function urlMatches (url, urls) {
				return urls.indexOf(url) !== -1;
			}


			function watchUrlChanges (activationUrls, callback) {
				previousUrl = currentUrl;
				currentUrl = window.location.pathname;

				if (previousUrl !== currentUrl &&
						urlMatches(currentUrl, activationUrls)) {
					callback();
				}

				setTimeout(function () {
					watchUrlChanges(activationUrls, callback);
				}, 100);
			}


			function getPuzzleSections () {
				var sectionsNodeList = document.querySelectorAll('.level-header');
				return Array.prototype.slice.call(sectionsNodeList);
			}


			function attachTogglers (puzzleSections) {
				puzzleSections.forEach(attachToggler);
			}


			function attachToggler (element) {
				var toggleListener = bindDOMEventCallback(toggle);
				var $element = $(element);

				$element.off('click');
				$element.on('click', toggleListener);
			}


			function bindDOMEventCallback (callback) {
				return function (event) {
					if (callback) {
						callback(extractElementFromEvent(event));
					}
				}
			}


			function extractElementFromEvent (event) {
				return event.currentTarget;
			}


			function locateElementToToggle (element) {
				return element.nextSibling.nextSibling;
			}


			function toggle (puzzleSection) {
				var element = locateElementToToggle(puzzleSection);
				var persistentStateIndex = app.puzzleSections.indexOf(puzzleSection);
				var hidden;

				if (isVisible(element)) {
					hide(element);
					hidden = 1;
				} else {
					show(element);
					hidden = 0;
				}

				app.persistentState.data.puzzleSections[persistentStateIndex] = hidden;
				app.persistentState.save();
			}


			function isVisible (element) {
				return $(element).is(':visible');
			}


			function show (element) {
				$(element).show(400);
			}


			function hide (element) {
				$(element).hide(400);
			}

			function PersistentState (name) {
				this.name = name;
				this.data = this.unserialize();
			}

			PersistentState.prototype.unserialize = function () {
				return JSON.parse(localStorage.getItem(this.name)) || {};
			};


			PersistentState.prototype.serialize = function () {
				return JSON.stringify(this.data);
			};


			PersistentState.prototype.save = function () {
				localStorage.setItem(this.name, this.serialize());
			};

			setup();
		}

	}, 10);
});
