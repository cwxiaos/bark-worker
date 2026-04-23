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
  "body": "Test Message In Body with %",
  "device_key": "'$BAD_DEVICE_KEY'",
  "title": "Test Title In Body with %",
  "subtitle": "Test Subtitle In Body with %",
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
curl --data-urlencode "ciphertext=$ciphertext" "$SERVER_ADDRESS/$DEVICE_KEY?isArchive=0"

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
  "device_keys": ",,'',\"\""
}'

echo ""

# Invalid JSON
curl -X "POST" "$SERVER_ADDRESS/push" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Batch Message In Body",
  "group": "testBatchPush",
  "url": "https://mritd.com",
  "isArchive": "0",
  "device_keys": ['', ,]
}'

echo ""

# Empty Array
curl -X "POST" "$SERVER_ADDRESS/push" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
  "body": "Test Batch Message In Body",
  "group": "testBatchPush",
  "url": "https://mritd.com",
  "isArchive": "0",
  "device_keys": ["", "", ""]
}'

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test MCP Generic Endpoint (/mcp) [Go/mcp-go stateful session]"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

MCP_URL="$SERVER_ADDRESS/mcp"
MCP_SPECIFIC_URL="$SERVER_ADDRESS/mcp/$DEVICE_KEY"

echo "--- initialize (capture Mcp-Session-Id) ---"
INIT_RESPONSE=$(curl -s -D - -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}}}')
echo "$INIT_RESPONSE"

SESSION_ID=$(echo "$INIT_RESPONSE" | grep -i 'Mcp-Session-Id' | awk '{print $2}' | tr -d '\r')
echo ""
echo "Session ID: $SESSION_ID"

echo ""
echo "--- notifications/initialized (with session, expect 204) ---"
curl -s -o /dev/null -w "HTTP %{http_code}" -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -H "Mcp-Session-Id: $SESSION_ID" \
     -d '{"jsonrpc":"2.0","id":null,"method":"notifications/initialized"}'

echo ""
echo "--- tools/list (device_key should be required) ---"
curl -s -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -H "Mcp-Session-Id: $SESSION_ID" \
     -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

echo ""
echo "--- tools/call notify (device_key in args) ---"
curl -s -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -H "Mcp-Session-Id: $SESSION_ID" \
     -d '{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "notify",
    "arguments": {
      "device_key": "'"$DEVICE_KEY"'",
      "title": "MCP Generic Test",
      "body": "Sent via /mcp with device_key in args",
      "group": "mcp-test"
    }
  }
}'

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test MCP Specific Endpoint (/mcp/:device_key)"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

echo "--- initialize (capture Mcp-Session-Id) ---"
INIT_SPECIFIC_RESPONSE=$(curl -s -D - -X POST "$MCP_SPECIFIC_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}}}')
echo "$INIT_SPECIFIC_RESPONSE"

SESSION_ID_SPECIFIC=$(echo "$INIT_SPECIFIC_RESPONSE" | grep -i 'Mcp-Session-Id' | awk '{print $2}' | tr -d '\r')
echo ""
echo "Session ID: $SESSION_ID_SPECIFIC"

echo ""
echo "--- tools/list (device_key should NOT be required) ---"
curl -s -X POST "$MCP_SPECIFIC_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -H "Mcp-Session-Id: $SESSION_ID_SPECIFIC" \
     -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'

echo ""
echo "--- tools/call notify (device_key from URL) ---"
curl -s -X POST "$MCP_SPECIFIC_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -H "Mcp-Session-Id: $SESSION_ID_SPECIFIC" \
     -d '{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "notify",
    "arguments": {
      "title": "MCP Specific Test",
      "body": "Sent via /mcp/:device_key, no device_key in args",
      "group": "mcp-test"
    }
  }
}'

echo -e "\e[1;32m"
echo ""
echo "---------------------------------------------------------------------"
echo "Test MCP Error Cases"
echo "---------------------------------------------------------------------"
echo ""
echo -e "\e[0m"

echo "--- Invalid JSON body (expect parse error, no session needed) ---"
curl -s -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -d 'not json'

echo ""
echo "--- Request without session ID (expect Invalid session ID) ---"
curl -s -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -d '{"jsonrpc":"2.0","id":5,"method":"tools/list"}'

echo ""
echo "--- tools/call unknown tool name (expect error) ---"
curl -s -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -H "Mcp-Session-Id: $SESSION_ID" \
     -d '{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"no_such_tool","arguments":{}}}'

echo ""
echo "--- tools/call missing device_key on generic endpoint (expect isError) ---"
curl -s -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -H "Mcp-Session-Id: $SESSION_ID" \
     -d '{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "tools/call",
  "params": {
    "name": "notify",
    "arguments": {
      "body": "No device_key provided"
    }
  }
}'

echo ""
echo "--- tools/call bad device_key (expect isError from APNs) ---"
curl -s -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -H "Mcp-Session-Id: $SESSION_ID" \
     -d '{
  "jsonrpc": "2.0",
  "id": 8,
  "method": "tools/call",
  "params": {
    "name": "notify",
    "arguments": {
      "device_key": "'"$BAD_DEVICE_KEY"'",
      "body": "Bad device key test"
    }
  }
}'

echo ""
echo "--- Stale/invalid session ID (expect session error) ---"
curl -s -X POST "$MCP_URL" \
     -u admin:admin \
     -H 'Content-Type: application/json' \
     -H "Mcp-Session-Id: invalid-session-id-000" \
     -d '{"jsonrpc":"2.0","id":9,"method":"tools/list"}'

echo ""