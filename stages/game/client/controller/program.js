let gamefield;

function initGamePage() {
	gamefield = new GameField("content", 9, 5, "main");

	gamefield.init().then(() => {
		loadGameDisplay();
	});
}

function minIndex(arr) {
	let index = null;

	for (let i in arr) {
		if (!index)
			index = +i;
		else if (index > +i)
			index = +i;
	}

	return index;
}

function arrLength(arr) {
	let length = 0;

	for (let index in arr) {
		length++;
	}

	return length;
}