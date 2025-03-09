<?php
// Nome del file di output
$outputFile = "index.html";

// Avvia il buffer di output
ob_start();

// Includi la tua pagina PHP principale
include("index.php");

// Cattura il contenuto generato e scrivilo in un file HTML
file_put_contents($outputFile, ob_get_clean());

echo "✅ Conversione completata! Controlla $outputFile";
?>
