# Imposta variabili di percorso e device ID
$adbPath = "C:\Users\campus.uniurb.it\scrcpy-win64-v3.3.1\adb"
$deviceId = "000881486002672"   # cambia se il tuo flutter devices mostra altro
$frontendPath = "C:\Users\campus.uniurb.it\Dapp_Project\Frontend\flutter_frontend"

# 1) adb reverse per mappare porte
Write-Host "Imposto adb reverse..."
& $adbPath reverse tcp:8081 tcp:8081
& $adbPath reverse tcp:8080 tcp:8080

# 2) Avvio flutter run in una nuova finestra
Write-Host "Avvio Flutter Run..."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$frontendPath`"; flutter run -d $deviceId --dart-define=AUTH_BASE_URL=http://127.0.0.1:8081/auth --dart-define=API_BASE_URL=http://127.0.0.1:8081"
)

# 3) Avvio logcat filtrato in un'altra finestra
Write-Host "Apro adb logcat (filtrato su 'flutter')..."
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "cd `"$($adbPath | Split-Path)`"; .\adb.exe logcat | findstr flutter"
)

Write-Host "Tutto pronto! Le finestre si apriranno in parallelo."
