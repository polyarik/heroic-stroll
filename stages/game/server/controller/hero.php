<?php

//class??

function changeHeroStat($stat, $value) {
	$_SESSION['hero']['stats'][$stat] += $value;

	if ($stat == 'hp' || $stat == 'mp' || $stat == 'sp')
		$_SESSION['hero']['stats'][$stat] = max(min($_SESSION['hero']['stats'][$stat], $_SESSION['hero']['stats'][$stat.'Max']), 0);

	if ($stat == 'exp')
		checkLvlUp();
}

function checkLvlUp() {
	while ($_SESSION['hero']['stats']['exp'] >= $_SESSION['hero']['stats']['needexp']) {
		$_SESSION['hero']['stats']['lvl']++;
		$_SESSION['hero']['stats']['exp'] = $_SESSION['hero']['stats']['exp'] - $_SESSION['hero']['stats']['needexp'];
		$_SESSION['hero']['stats']['needexp'] = $_SESSION['hero']['stats']['lvl'] * 10;
	}
}

function getHeroStats() {
	//query to db for all hero stats

	$stats = $_SESSION['hero']['stats'];
	return $stats;
}

//TEMP | (open inventory)
function interactWithHero($x, $y) {
	$heroX = $_SESSION['hero']['stats']['x'];
	$heroY = $_SESSION['hero']['stats']['y'];

	if ($heroX === $x && $heroY === $y) {
		if ($_SESSION['hero']['stats']['mp'] - 20 < 0)
			return $_SESSION['hero']['stats']; // not enough mp

		changeHeroStat('mp', -20);
		changeHeroStat('sp', 15);

		return true;
	}

	// wrong coords
	return $_SESSION['hero']['stats'];
}

function moveHero($x, $y) {
	$heroX = $_SESSION['hero']['stats']['x'];
	$heroY = $_SESSION['hero']['stats']['y'];

	// nearest tile
	if ((abs($heroX - $x) == 1 && $heroY == $y || $heroX == $x && abs($heroY - $y) == 1)) {
		$mapInterpreter = Constants::getMapInterpreter();

		$zone = $mapInterpreter['zones'][$_SESSION['maps']['zones'][$y][$x]];
		$ground = $mapInterpreter['ground'][$_SESSION['maps']['ground'][$y][$x]];

		if ($_SESSION['maps']['objects'][$y] && $_SESSION['maps']['objects'][$y][$x]) {
			$tile = $_SESSION['maps']['objects'][$y][$x];
			$objName = $mapInterpreter['objects'][$tile];
			$objPresets = Constants::getObjPresets();
			$objPreset = $objPresets[$objName];
			$obj = new Obj($objPreset);

			if ($obj->solid)
				return false;
		}

		$staminaConsumption = Constants::getStaminaConsumption();
		$staminaChange = -$staminaConsumption[$zone][$ground];

		if ($_SESSION['hero']['stats']['sp'] + $staminaChange < 0)
			return $_SESSION['hero']['stats']; // not enough energy

		if (moveTo($x, $y)) {
			changeHeroStat('sp', $staminaChange);
			changeHeroStat('exp', 1); //TEST

			// pick up an item
			if ($_SESSION['maps']['objects'][$y] && $_SESSION['maps']['objects'][$y][$x]) {
				if ($obj->collectability) {
					$_SESSION['maps']['objects'][$y][$x] = null;
					changeHeroStat($obj->collectability['stat'], $obj->collectability['value']);
				}
			}

			return true;
		}
	}

	return $_SESSION['hero']['stats']; // move failed
}

function moveTo($x, $y) {
	$heroX = $_SESSION['hero']['stats']['x'];
	$heroY = $_SESSION['hero']['stats']['y'];

	if ($heroY == $y) {
		if ($heroX > $x)
			$_SESSION['hero']['stats']['direction'] = 'left';
		else
			$_SESSION['hero']['stats']['direction'] = 'right';

		$_SESSION['hero']['stats']['x'] = $x;
	} else if ($heroX == $x) {
		if ($heroY > $y)
			$_SESSION['hero']['stats']['direction'] = 'up';
		else
			$_SESSION['hero']['stats']['direction'] = 'down';

		$_SESSION['hero']['stats']['y'] = $y;
	}

	return true;
}