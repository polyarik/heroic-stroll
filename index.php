<?php

header("Content-Type: text/html; charset=utf-8");
error_reporting(E_ERROR | E_PARSE);

if (isset($_GET["stage"]))
	$stage = $_GET["stage"];
else
	$stage = "login";

switch ($stage) {
	case "login":
		include("stages/login/login.php");
		break;

	case "hero":
		include("stages/hero/hero.php");
		break;

	case "game":
		include("stages/game/game.php");
		break;

	default:
		include("stages/errors/404/e404.php");
		break;
}