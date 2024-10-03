#!/bin/bash

version=$1

type=$2 # optional, can be 'commonjs' or 'esm'. Default is 'esm'

if [ -z "$version" ]; then
    echo "Version is required! Usage: generate.sh v17"
    exit 1
fi

is_esm=$([ "$type" == "cjs" ] && echo "false" || echo "true")

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

ts_proto_opts="forceLong=string,snakeToCamel=false,useOptionals=all,useAbortSignal=true,useExactTypes=false,esModuleInterop=true,outputIndex=true"

# if [ -n "$importSuffix" ]; then
#   ts_proto_opts="$ts_proto_opts,importStyle=commonjs,importSuffix=$importSuffix"
# fi

# is_esm == true => importSuffix=.js
if [ "$is_esm" == "true" ]; then
  echo "Using ESM"
  ts_proto_opts="$ts_proto_opts,importSuffix=.js"
fi

ts_proto_opts="$ts_proto_opts,outputServices=false,outputServices=grpc-js"

protoc --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --experimental_allow_proto3_optional \
  --proto_path $path \
  --ts_proto_out=$outdir \
  --ts_proto_opt=$ts_proto_opts \
  $path/google/ads/googleads/$version/**/*.proto
