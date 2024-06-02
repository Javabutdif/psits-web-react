<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Handle preflight requests
    http_response_code(200);
    exit;
}
$requestMethod = $_SERVER["REQUEST_METHOD"];

if ($requestMethod == 'GET') {
    echo json_encode(["message" => "Hello, world!"]);
} elseif ($requestMethod == 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    echo json_encode(["received" => $input]);
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}

