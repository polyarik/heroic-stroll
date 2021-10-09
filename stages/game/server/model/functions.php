<?php

function getWorldSize() {
	$worldSize = array(
		'width' => count($_SESSION['maps']['zones'][0]),
		'height' => count($_SESSION['maps']['zones'])
	);

	return $worldSize;
}

function getMaps($width, $height) {
	if ($width > 29) $width = 29;
	if ($height > 29) $height = 29;

	//map chunk coords
	$chunkX = $_SESSION['hero']['stats']['x'] - ($width - 1)/2;
	$chunkY = $_SESSION['hero']['stats']['y'] - ($height - 1)/2;

	//query to db
	//...

	//TEMP
	$zoneMap = $_SESSION['maps']['zones'];
	$groundMap = $_SESSION['maps']['ground'];
	$objectMap = $_SESSION['maps']['objects'];

	$zoneMapChunk = array();
	$groundMapChunk = array();
	$objectMapChunk = array();

	for ($y = $chunkY; $y < $chunkY + $height; $y++) {
		for ($x = $chunkX; $x < $chunkX + $width; $x++) {
			$zoneMapChunk[$y][$x] = $zoneMap[$y][$x];
			$groundMapChunk[$y][$x] = $groundMap[$y][$x];
			$objectMapChunk[$y][$x] = $objectMap[$y][$x];
		}
	}

	$maps = array('map_zones' => $zoneMapChunk, 'map_ground' => $groundMapChunk, 'map_objects' => $objectMapChunk);
	return $maps;
}

function getFieldSettings() {
	$staminaConsumption = Constants::getStaminaConsumption();
	$mapInterpreter = Constants::getMapInterpreter();
	$objPresets = Constants::getObjPresets();

	$settings = array('staminaConsumption' => $staminaConsumption, 'mapInterpreter' => $mapInterpreter, 'objPresets' => $objPresets);
	return $settings;
}

function getImagesName($folder) {
	$currentFolder = $rootFolder."../../client/view/images/".$folder;

	$imagesName = scanDirs($currentFolder);
	return $imagesName;
}

function scanDirs($folder, $start=0) {
	$count = $start;
	$files = array();

	$handle = opendir($folder);

	while (($file = readdir($handle)) !== false) {
		if ($file != '.' && $file != '..') {
			if (is_dir($folder.'/'.$file)) {
				$dir = scanDirs($folder.'/'.$file, $count);
				$files[$file] = $dir[0];
				$count = $dir[1];
			} else if (substr($file, -4) === ".png") {
				$count++;
				array_push($files, $file);
			}
		}
	}

	closedir($handle);

	$res = array($files, $count);
	return $res;
}