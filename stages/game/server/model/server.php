<?php

header("Content-Type: text/html; charset=utf-8");
session_start();

require_once("constants.php");
require_once("obj.php");
require_once("functions.php");
require_once("../controller/hero.php");

//identifyUser();

if (!isset($_SESSION['maps']) || !isset($_SESSION['hero'])) {
	eraseData();
}

function identifyUser() {
	//query to db with a key from $_SESSION
}

function eraseData() {
	unset($_SESSION['hero']);
	unset($_SESSION['maps']);

	$_SESSION['maps'] = array();

	$mapWidth = rand(30, 50);
	$mapHeight = rand(30, 50);

	// zone generation
	$_SESSION['maps']['zones'] = array();

	for ($y = 0; $y < $mapHeight; $y++) {
		$_SESSION['maps']['zones'][$y] = array();

		for ($x = 0; $x < $mapWidth; $x++) {
			$_SESSION['maps']['zones'][$y][$x] = 1; // forest
		}
	}

	// ground generation
	$_SESSION['maps']['ground'] = array();

	for ($y = 0; $y < $mapHeight; $y++) {
		$_SESSION['maps']['ground'][$y] = array();

		for ($x = 0; $x < $mapWidth; $x++) {
			$randNum = rand(1, 4);

			if ($randNum < 4) $_SESSION['maps']['ground'][$y][$x] = 1; // grass
			else $_SESSION['maps']['ground'][$y][$x] = 2; // overgrown grass
		}
	}

	// object generation
	$_SESSION['maps']['objects'] = array();
	$presetsNum = count(Constants::getObjPresets());
	
	for ($y = 0; $y < $mapHeight; $y++) {
		$_SESSION['maps']['objects'][$y] = array();

		for ($x = 0; $x < $mapWidth; $x++) {
			$randNum = rand(0, 5);

			if (!$randNum)
				$_SESSION['maps']['objects'][$y][$x] = rand(1, $presetsNum);
		}
	}

	// hero stats
	$_SESSION['hero'] = array();
	$_SESSION['hero']['stats'] = array(
		'race' => 'human',
		'type' => 'warrior',
		'name' => 'PolYarik',
		'x' => 0,
		'y' => 0,
		'status' => 'stand',
		'direction' => 'down',
		'lvl' => 1,
		'exp' => 0,
		'needexp' => 10,
		'hpMax' => 100,
		'mpMax' => 100,
		'spMax' => 100,
		'hp' => 100,
		'mp' => 100,
		'sp' => 100
	);

	// hero placement
	$x = rand(0, count($_SESSION['maps']['zones'][0]) - 1);
	$y = rand(0, count($_SESSION['maps']['zones']) - 1);

	while ($_SESSION['maps']['objects'][$y][$x]) {
		$x = rand(0, count($_SESSION['maps']['zones'][0]) - 1);
		$y = rand(0, count($_SESSION['maps']['zones']) - 1);
	}

	$_SESSION['hero']['stats']['x'] = $x;
	$_SESSION['hero']['stats']['y'] = $y;
}

//-----------------------------

if (isset($_POST['func'])) {
	switch ($_POST['func']) {
		case 'getWorldSize': {
			$worldSize = getWorldSize();
			echo json_encode($worldSize);
			break;
		}

		case 'getMaps': {
			$width = $_POST['width'];
			$height = $_POST['height'];

			if (ctype_digit($width) != "integer" || ctype_digit($height) != "integer" || $width < 1 || $height < 1)
				echo "0";
			else {
				$maps = getMaps($width, $height);
				echo json_encode($maps);
			}

			break;
		}

		case 'getFieldSettings': {
			$settings = getFieldSettings();
			echo json_encode($settings);
			break;
		}

		case 'getImagesName': {
			$folder = $_POST['folder'];
			$res = getImagesName($folder);
			echo json_encode($res);
			break;
		}

		case 'getHeroStats': {
			$stats = getHeroStats();
			echo json_encode($stats);
			break;
		}

		case 'interactWithHero': {
			$x = $_POST["x"];
			$y = $_POST["y"];

			$res = interactWithHero($x, $y);
			echo json_encode($res);
			break;
		}

		case 'moveHero': {
			$x = $_POST["x"];
			$y = $_POST["y"];

			$res = moveHero($x, $y);
			echo json_encode($res);
			break;
		}

		//FOR TESTING
		case 'eraseWorld': {
			eraseData();
			echo 'true';
		}
	}
}