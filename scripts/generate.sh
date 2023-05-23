#!/bin/bash

version=$1

if [ -z "$version" ]; then
    echo "Version is required! Usage: generate.sh v13"
    exit 1
fi

path="$PWD/googleapis"

outdir="$PWD/src/generated"

rm -rf $outdir

if [ ! -d "$path/.git" ]; then
  echo 'Cloning Git repository'
  git clone https://github.com/googleapis/googleapis.git "$path"
fi

if [ -d "node_modules/patch-package" ]; then
  echo 'Patch package "ts-proto" with local changes'
  patch-package
fi

mkdir -p $outdir

echo 'Generating Protobuf files'

protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --experimental_allow_proto3_optional \
  --proto_path $path \
  --ts_proto_out=$outdir \
  --ts_proto_opt=forceLong=string \
  --ts_proto_opt=snakeToCamel=false \
  --ts_proto_opt=useOptionals=all \
  --ts_proto_opt=useAbortSignal=true \
  --ts_proto_opt=useExactTypes=false \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=outputServices=generic-definitions,outputServices=grpc-js \
  $path/google/ads/googleads/$version/**/*.proto

node scripts/export-client.js $outdir/google/ads/googleads/$version

node scripts/indexing.js $outdir/google $version