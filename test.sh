#!/bin/bash

SERVER_ADDRESS=""
DEVICE_KEY=""
BAD_DEVICE_KEY=""
INVALID_DEVICE_KEY=""

BATCH_PUSH_KEY_1=""
BATCH_PUSH_KEY_2=$DEVICE_KEY
BATCH_PUSH_KEY_3=$BAD_DEVICE_KEY

DEVICE_TOKEN="0000test0device0token0000"

echo -e "\e[1;32m"
echo "Testing $SERVER_ADDRESS/$DEVICE_KEY"
echo ""
echo "---------------------------------------------------------------------"
echo "Test URL/KEY With Body"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

curl -X "POST" "$SERVER_ADDRESS/$DEVICE_KEY" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Message In Body",
  "device_key": "'$BAD_DEVICE_KEY'",
  "title": "Test Title In Body",
  "subtitle": "Test Subtitle In Body",
  "badge": 1,
  "icon": "https://day.app/assets/images/avatar.jpg",
  "group": "test",
  "url": "https://mritd.com",
  "isArchive": "0"
}'

echo ""

curl -X "POST" "$SERVER_ADDRESS/push" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Message In Body",
  "device_key": "'$DEVICE_KEY'",
  "title": "Test Title In Body",
  "subtitle": "Test Subtitle In Body",
  "badge": 1,
  "icon": "https://day.app/assets/images/avatar.jpg",
  "group": "test",
  "url": "https://mritd.com",
  "isArchive": "0"
}'

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test URL/KEY With Message In URL"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

ENCODED_TITLE="Test%20Title%20In%20URL"
ENCODED_SUBTITLE="Test%20Subtitle%20In%20URL"
ENCODED_MESSAGE="Test%20Message%20In%20URL"

curl -X "POST" "$SERVER_ADDRESS/$DEVICE_KEY/$ENCODED_MESSAGE?isArchive=0"

echo ""
curl -X "POST" "$SERVER_ADDRESS/$DEVICE_KEY/$ENCODED_TITLE/$ENCODED_MESSAGE?isArchive=0"

echo ""
curl -X "POST" "$SERVER_ADDRESS/$DEVICE_KEY/$ENCODED_TITLE/$ENCODED_SUBTITLE/$ENCODED_MESSAGE?isArchive=0"

# echo ""
# echo "---------------------------------------------------------------------"
# echo "Test URL/KEY With Message In Form"
# echo "---------------------------------------------------------------------"
# echo ""

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test ciphertext"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

set -e
json='{"body": "test", "sound": "birdsong"}'

key='1234567890123456'
iv='1111111111111111'

# openssl requires Hex encoding of manual keys and IVs, not ASCII encoding.
key=$(printf $key | xxd -ps -c 200)
iv=$(printf $iv | xxd -ps -c 200)

ciphertext=$(echo -n $json | openssl enc -aes-128-cbc -K $key -iv $iv | base64)

# The console will print "d3QhjQjP5majvNt5CjsvFWwqqj2gKl96RFj5OO+u6ynTt7lkyigDYNA3abnnCLpr"
echo $ciphertext

# URL encoding the ciphertext, there may be special characters.
curl --data-urlencode "ciphertext=$ciphertext" $SERVER_ADDRESS/$DEVICE_KEY?isArchive=0

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test Batch Push"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

curl -X "POST" "$SERVER_ADDRESS/push" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Batch Message In Body",
  "group": "testBatchPush",
  "url": "https://mritd.com",
  "isArchive": "0",
  "device_keys": ["'$BATCH_PUSH_KEY_1'", "'$BATCH_PUSH_KEY_2'", "'$BATCH_PUSH_KEY_3'"]
}'

echo ""

curl -X "POST" "$SERVER_ADDRESS/push" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Batch Message In Body",
  "group": "testBatchPush",
  "url": "https://mritd.com",
  "isArchive": "0",
  "device_keys": "'$BATCH_PUSH_KEY_1','$BATCH_PUSH_KEY_2','$BATCH_PUSH_KEY_3'"
}'

echo ""

curl -X "POST" "$SERVER_ADDRESS/push/Body?device_keys=$BATCH_PUSH_KEY_1,$BATCH_PUSH_KEY_2,$BATCH_PUSH_KEY_3"

echo ""

#"$SERVER_ADDRESS/push/Body?device_keys=["$BATCH_PUSH_KEY_1", "$BATCH_PUSH_KEY_2", "$BATCH_PUSH_KEY_3"]"
curl -X "POST" "$SERVER_ADDRESS/push/Body?device_keys=%5B%22$BATCH_PUSH_KEY_1%22%2C%20%22$BATCH_PUSH_KEY_2%22%2C%20%22$BATCH_PUSH_KEY_3%22%5D"

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test Bad Device Token"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

curl -X "POST" "$SERVER_ADDRESS/$BAD_DEVICE_KEY"

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test Invalid Device Key"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

curl -X "POST" "$SERVER_ADDRESS/$INVALID_DEVICE_KEY"

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test Device Registeration"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

curl "$SERVER_ADDRESS/register?devicetoken=$DEVICE_TOKEN&key="

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test Reset Device Key"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

curl "$SERVER_ADDRESS/register?devicetoken=deleted&key=$BAD_DEVICE_KEY"

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test Server Info (with Basic Auth)"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

curl "$SERVER_ADDRESS/info"

echo ""
curl "$SERVER_ADDRESS/info" -u admin:admin

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test Empty Key"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

curl "$SERVER_ADDRESS/push"

echo ""

curl -X "POST" "$SERVER_ADDRESS/push" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Batch Message In Body",
  "group": "testBatchPush",
  "url": "https://mritd.com",
  "isArchive": "0",
  "device_keys": ",,"
}'

echo ""

curl -X "POST" "$SERVER_ADDRESS/push" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Batch Message In Body",
  "group": "testBatchPush",
  "url": "https://mritd.com",
  "isArchive": "0",
  "device_keys": []
}'

echo ""