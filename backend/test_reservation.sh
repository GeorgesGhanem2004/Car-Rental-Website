#!/usr/bin/env bash
set -euo pipefail

API="http://localhost:3000/api"

echo "1) Logging in as gio123@gmail.com..."
login_resp=$(curl -s -H "Content-Type: application/json" \
                -X POST "$API/login" \
                -d '{"email":"gio123@gmail.com","password":"Gio123"}')
TOKEN=$(echo "$login_resp" | jq -r .token)

if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "❌ Login failed. Response was:"
  echo "$login_resp"
  exit 1
fi
echo "✅ Got token: $TOKEN"
echo

echo "2) Fetching list of cars to grab a valid ID..."
cars_resp=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/cars")
CAR_ID=$(echo "$cars_resp" | jq -r '.[0]._id')

if [[ -z "$CAR_ID" || "$CAR_ID" == "null" ]]; then
  echo "❌ Could not extract a car ID. Cars response:"
  echo "$cars_resp"
  exit 1
fi
echo "✅ Using car ID: $CAR_ID"
echo

echo "3) Creating a reservation..."
reservation_resp=$(curl -s -w "\n%{http_code}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -X POST "$API/reservations" \
  -d '{
        "car":"'"$CAR_ID"'",
        "pickupBranch":"Beirut Airport",
        "returnBranch":"Tripoli",
        "pickupAt":"2025-05-10T10:00:00Z",
        "returnAt":"2025-05-12T10:00:00Z",
        "driverName":"Gio Abou Sleiman",
        "driverAge":24,
        "extras":["gps","baby-seat"],
        "insuranceOption":"full",
        "fuelOption":"prepaid"
      }')

# Separate body and status
http_body=$(echo "$reservation_resp" | sed '$d')
http_status=$(echo "$reservation_resp" | tail -n1)

echo "→ HTTP status: $http_status"
echo "→ Response body:"
echo "$http_body" | jq .

if [[ "$http_status" -ne 201 ]]; then
  echo "❌ Reservation failed."
  exit 1
fi
echo "✅ Reservation created!"
echo

echo "4) Listing all your reservations..."
curl -s -H "Authorization: Bearer $TOKEN" "$API/reservations" | jq .

echo
echo "🎉 All tests passed!"
