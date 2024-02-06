#!/bin/bash

SERVER_ADDRESS=""
DEVICE_KEY=""
BAD_DEVICE_KEY=""

echo "Testing $SERVER_ADDRESS/$DEVICE_KEY"
echo ""
echo "---------------------------------------------------------------------"
echo "Test URL/KEY With Body"
echo "---------------------------------------------------------------------"
echo ""

curl -X "POST" "$SERVER_ADDRESS/$DEVICE_KEY" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Message In Body",
  "device_key": "'$BAD_DEVICE_KEY'",
  "title": "Test Title In Body",
  "badge": 1,
  "category": "myNotificationCategory",
  "icon": "https://day.app/assets/images/avatar.jpg",
  "group": "test",
  "url": "https://mritd.com",
  "isArchive": 0
}'

echo ""

curl -X "POST" "$SERVER_ADDRESS/push" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Message In Body",
  "device_key": "'$DEVICE_KEY'",
  "title": "Test Title In Body",
  "badge": 1,
  "category": "myNotificationCategory",
  "icon": "https://day.app/assets/images/avatar.jpg",
  "group": "test",
  "url": "https://mritd.com",
  "isArchive": 0
}'

echo ""
echo "---------------------------------------------------------------------"
echo "Test URL/KEY With Message In URL"
echo "---------------------------------------------------------------------"
echo ""

ENCODED_TITLE=Test%20Title%20In%20URL
ENCODED_MESSAGE=Test%20Message%20In%20URL

curl -X "POST" "$SERVER_ADDRESS/$DEVICE_KEY/$ENCODED_MESSAGE?isArchive=0"

echo ""
curl -X "POST" "$SERVER_ADDRESS/$DEVICE_KEY/$ENCODED_TITLE/$ENCODED_MESSAGE?isArchive=0"

# echo ""
# echo "---------------------------------------------------------------------"
# echo "Test URL/KEY With Message In Form"
# echo "---------------------------------------------------------------------"
# echo ""

echo ""
echo "---------------------------------------------------------------------"
echo "Test ciphertext"
echo "---------------------------------------------------------------------"
echo ""

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

echo ""
echo "---------------------------------------------------------------------"
echo "Test Bad Device Token"
echo "---------------------------------------------------------------------"
echo ""

curl -X "POST" "$SERVER_ADDRESS/$BAD_DEVICE_KEY"

echo ""
