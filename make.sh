#!/usr/bin/env bash

set -euo pipefail
clear

bold=$(tput bold)
reset=$(tput sgr0)
green=$(tput setaf 2)
red=$(tput setaf 1)
yellow=$(tput setaf 3)
blue=$(tput setaf 4)
gray=$(tput setaf 7)


OUT_DIR="./bin/out"
RUST_LIB="./target/release/libdbgdr.a"
CXX_FLAGS="-Wall -Wextra -pedantic -save-temps"

local_only=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    -l|--local)
    local_only=1
    shift
    ;;
  esac
done


log_section() {
  echo ""
  echo "${bold}${yellow}> $1${reset}"
}

log_success() {
  echo "${green}✓ $1${reset}"
}

log_error() {
  echo "${red}x $1${reset}"
}


compile_test() {
  g++ $CXX_FLAGS -o "$OUT_DIR/dbgd-test" "$RUST_LIB" ./src/test/test.cpp
}

compile_core() {
  g++ $CXX_FLAGS -o "$OUT_DIR/dbgd" "$RUST_LIB" ./src/main/main.cpp
}


mkdir -p "$OUT_DIR"


log_section "Checking git status..."

if ! node ./gitchk.js "$@"; then
  exit 1 
fi

echo "Done."


log_section "Creating Rust library binaries..."

if cargo test; then
  log_success "Rust tests passed."

  if cargo build --release; then
    log_success "Run release build complete."
  else
    log_error "Rust build failed."
    exit 1
  fi
else
  log_error "Rust tests failed."
  exit 1
fi


log_section "Creating core binaries..."

if compile_test; then
  log_success "Core tests compiled successfully."

  if "$OUT_DIR/dbgd-test"; then
    log_success "Core tests passed execution."
  else
    log_error "Core tests failed execution."
    exit 1
  fi
else
  log_error "Core tests compilation failed."
  exit 1
fi


if compile_core; then
  log_section "Main core binary (dbgd) compiled."
else
  log_error "Main core binary compilation failed."
  exit 1
fi

echo "Done."


log_section "Building node's library..."

if yarn spec:inline && yarn test:inline; then
  log_success "Node library tests passed."

  if yarn build:no-fix && NODE_ENV=production node ./post-build.js; then
    log_success "Node library built."
  else
    log_error "Failed to build Node library."
    exit 1
  fi

else
  log_error "Node library tests failed."
  exit 1
fi

echo "Done."


if ! ((local_only)); then
  echo "Publishing Node's package..."

  cd ./dist/
  npm publish --access public

  cd ..
fi
