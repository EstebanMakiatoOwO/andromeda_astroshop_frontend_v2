<?php
/**
 * Proxy server-side para el Apps Script de Google Drive.
 * Deployar en la raíz del sitio o en /api/drive-proxy.php.
 * La URL del script NUNCA llega al browser.
 *
 * Variables de entorno requeridas:
 *   DRIVE_SCRIPT_URL  — URL completa del Apps Script (exec)
 *   DRIVE_ALLOWED_ORIGIN — dominio permitido, ej. https://andromedaastroshop.com
 */

$allowedOrigin = getenv('DRIVE_ALLOWED_ORIGIN') ?: 'https://andromedaastroshop.com';
$scriptUrl     = getenv('DRIVE_SCRIPT_URL');

// Bloquear si no hay URL configurada
if (!$scriptUrl) {
    http_response_code(503);
    exit(json_encode(['error' => 'not configured']));
}

// CORS — solo el dominio permitido
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === $allowedOrigin) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
}
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300'); // 5 min cache

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Solo GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    exit(json_encode(['error' => 'method not allowed']));
}

// Llamada al Apps Script (server-side, invisible para el browser)
$ctx = stream_context_create([
    'http' => [
        'method'          => 'GET',
        'timeout'         => 10,
        'follow_location' => true,
    ],
    'ssl' => [
        'verify_peer'      => true,
        'verify_peer_name' => true,
    ],
]);

$response = @file_get_contents($scriptUrl, false, $ctx);

if ($response === false) {
    http_response_code(502);
    exit(json_encode(['error' => 'upstream error']));
}

echo $response;
