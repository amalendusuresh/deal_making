#!/bin/bash

# Set the API endpoint environment variable
export FULLNODE_API_INFO=https://api.node.glif.io

#Initialize the client
boost -vv init

#To calculate CommP CID, Piece size and Car file size 
#boostx commp ./bafybeie2au4pm66yr5s5rxoglgrub6gpmooxsdxnizoggaayiyexrwuzhm.car

# Set your provider address
provider="f01907556"

# Set the HTTP URL of the file you want to store
http_url="https:/home/val/Downloads/bafybeie2au4pm66yr5s5rxoglgrub6gpmooxsdxnizoggaayiyexrwuzhm.car"

# Calculate the CommP of the file
commp=$(lotus client commp "$http_url")

# Get the size of the file in bytes
car_size=$(curl -sI "$http_url" | awk '/Content-Length/ {print $2}' | tr -d '\r')

# Set the piece size for the storage deal
piece_size="262144"

# Calculate the payload CID of the file
payload_cid=$(boost car create "$http_url" | jq -r '.cid')

# Make the storage deal
boost -vv deal --provider="$provider" \
               --http-url="$http_url" \
               --commp="$commp" \
               --car-size="$car_size" \
               --piece-size="$piece_size" \
               --payload-cid="$payload_cid"
