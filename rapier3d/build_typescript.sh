#!/bin/bash

cp -r ../src.ts/* pkg/.
echo 'export * from "./rapier_wasm3d"' >pkg/raw.ts
find pkg/ -type f -print0 | xargs -0 sed -i '/^ *\/\/ #if DIM2/,/^ *\/\/ #endif/{/^ *\/\/ #if DIM2/!{/^ *\/\/ #endif/!d}}'
tsc
find pkg/ -type f -name *.ts ! -name *.d.ts -print0 | xargs -0 rm
sed -i 's/"module": "rapier_wasm3d.js"/"module": "rapier.js"/g' pkg/package.json
sed -i 's/"types": "rapier_wasm3d.d.ts"/"types": "rapier.d.ts"/g' pkg/package.json