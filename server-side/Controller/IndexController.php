<?php
// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: http://localhost:5173'); // Allow requests from React app
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    http_response_code(200); // OK
    exit();
}

// Set CORS headers for the actual request
header('Access-Control-Allow-Origin: http://localhost:5173'); // Allow requests from React app
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read the raw POST data
    $postData = file_get_contents('php://input');

    // Parse the JSON data
    $requestData = json_decode($postData, true);

    // Check if JSON data was successfully parsed
    if ($requestData === null) {
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Invalid JSON data']);
        exit();
    }

    // Check if the 'input' key is set in the request data
    if (isset($requestData['input'])) {
        // Process the input data
        $inputData = $requestData['input'];
        // For demonstration, let's just echo back the received data
        echo json_encode(['receivedData' => $inputData]);
    } else {
        // If the 'input' key is not set, send an error response
        http_response_code(400); // Bad Request
        echo json_encode(['error' => 'Input data is missing']);
    }
} else {
    // Handle other HTTP methods
    http_response_code(405); // Method Not Allowed
    echo json_encode(['error' => 'Only POST requests are allowed']);
}
