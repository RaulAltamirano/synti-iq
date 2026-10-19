#!/bin/bash

mkdir -p keys

openssl genrsa -out keys/private_key.pem 2048

openssl rsa -in keys/private_key.pem -pubout -out keys/public_key.pem

openssl pkcs8 -topk8 -inform PEM -in keys/private_key.pem -outform PEM -nocrypt -out keys/private_key_pkcs8.pem

chmod 600 keys/private_key.pem
chmod 600 keys/private_key_pkcs8.pem
chmod 644 keys/public_key.pem

echo "Keys generated in ./keys/"
echo "IMPORTANT: Add keys/ to .gitignore"
echo ""
echo "Environment variables to configure:"
echo "  JWT_PRIVATE_KEY_PATH=./keys/private_key_pkcs8.pem"
echo "  JWT_PUBLIC_KEY_PATH=./keys/public_key.pem"
