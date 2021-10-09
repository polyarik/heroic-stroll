<?php

header("Content-Type: text/html; charset=utf-8");
error_reporting(E_ERROR | E_PARSE);

require("stages/hero/model/server.php");

include("stages/hero/controller/jsconnections.html");
include("stages/hero/view/frame.html");