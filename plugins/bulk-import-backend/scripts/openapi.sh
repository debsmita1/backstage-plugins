#!/bin/bash
pwd
set -ex

npx --yes --package=openapicmd@2.3.1 -- typegen src/schema/openapi.yaml > src/openapi.d.ts

npx --yes --package=js-yaml-cli@0.6.0 -- yaml2json -f ./src/schema/openapi.yaml

FILE=./src/openapidocument.ts
echo '// Generated file. Do not edit.' > ${FILE}
echo 'const OPENAPI = `' >> ${FILE}
cat ./src/schema/openapi.json | sed 's/\\n/\\\\n/g' >> ${FILE}
echo '`' >> ${FILE}
echo "export const openApiDocument = JSON.parse(OPENAPI);" >> ${FILE}

rm ./src/schema/openapi.json
