#!/bin/bash

_dockerDir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

exec docker compose -p buidler-webapp-stg \
  -f "$_dockerDir/compose.stg.yml" \
  "$@"
