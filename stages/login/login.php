<?php

header("Content-Type: text/html; charset=utf-8");
error_reporting(E_ERROR | E_PARSE);

require("stages/login/model/server.php");

include("stages/login/controller/jsconnections.html");
include("stages/login/view/frame.html");