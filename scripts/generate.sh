#!/bin/bash

version=$1

importSuffix=$2

if [ -z "$version" ]; then
    echo "Version is required! Usage: generate.sh v17"
    exit 1
fi

path="$PWD/googleapis"

outdir="$PWD/src/generated"

rm -rf $outdir

if [ ! -d "$path/.git" ]; then
  echo 'Cloning Git repository'
  git clone https://github.com/googleapis/googleapis.git "$path"
else 
  echo 'Pulling latest changes'
  cd $path
  git pull
  cd -
fi

mkdir -p $outdir

echo 'Generating Protobuf files'

ts_proto_opts="forceLong=string,snakeToCamel=false,useOptionals=all,useAbortSignal=true,useExactTypes=false,esModuleInterop=true"

if [ -n "$importSuffix" ]; then
  ts_proto_opts="$ts_proto_opts,importStyle=commonjs,importSuffix=$importSuffix"
fi

ts_proto_opts="$ts_proto_opts,outputServices=generic-definitions,outputServices=grpc-js"

protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --experimental_allow_proto3_optional \
  --proto_path $path \
  --ts_proto_out=$outdir \
  --ts_proto_opt=$ts_proto_opts \
  $path/google/ads/googleads/$version/**/*.proto

node scripts/export-client.js $outdir/google/ads/googleads/$version

node scripts/indexing.js $outdir/google $version