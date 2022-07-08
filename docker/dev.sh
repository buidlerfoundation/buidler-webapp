#!/bin/bash

_dockerDir=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

exec docker-compose -p buidler-webapp-dev \
  -f "$_dockerDir/compose.dev.yml" \
  "$@"
