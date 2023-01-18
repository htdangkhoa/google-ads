#!/bin/bash

version=$1

path="$PWD/googleapis"

outdir="$PWD/src/generated"

rm -rf $outdir

if [ ! -d "$path/.git" ]; then
  echo 'Cloning Git repository'
  git clone https://github.com/googleapis/googleapis.git "$path"
fi

mkdir -p $outdir

yarn protoc --ts_out $outdir --proto_path $path \
  --ts_opt generate_dependencies,long_type_string,force_optimize_code_size,optimize_speed,force_server_none \
  $path/google/ads/googleads/$version/**/*.proto

node scripts/export_client.js $outdir/google/ads/googleads/$version

node scripts/indexing.js $outdir/google $version