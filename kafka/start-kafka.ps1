$ErrorActionPreference = 'Stop'

if (-not $env:KAFKA_HOME) {
    throw 'Set KAFKA_HOME to the Apache Kafka installation directory.'
}

$storageCommand = Join-Path $env:KAFKA_HOME 'bin\windows\kafka-storage.bat'
$serverCommand = Join-Path $env:KAFKA_HOME 'bin\windows\kafka-server-start.bat'
$configFile = Join-Path $PSScriptRoot 'server.properties'
$metadataFile = Join-Path $PSScriptRoot 'data\kafka-logs\meta.properties'

if (-not (Test-Path $storageCommand) -or -not (Test-Path $serverCommand)) {
    throw "Kafka Windows scripts were not found under KAFKA_HOME: $env:KAFKA_HOME"
}

Push-Location $PSScriptRoot
try {
    if (-not (Test-Path $metadataFile)) {
        $clusterId = (& $storageCommand random-uuid | Select-Object -Last 1).Trim()
        if ($LASTEXITCODE -ne 0 -or -not $clusterId) {
            throw 'Could not generate the Kafka cluster ID.'
        }

        & $storageCommand format -t $clusterId -c $configFile
        if ($LASTEXITCODE -ne 0) {
            throw 'Could not format the local Kafka storage directory.'
        }
    }

    & $serverCommand $configFile
    if ($LASTEXITCODE -ne 0) {
        throw "Kafka exited with code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}
