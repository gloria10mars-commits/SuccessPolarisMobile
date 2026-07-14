#!/usr/bin/env python3
"""Patch build.gradle pour supprimer le check de version Kotlin/Compose.
Injecte suppressKotlinVersionCompatibilityCheck = "1.9.24" dans composeOptions.
"""
import re
import sys
import os

p = os.path.join(os.environ.get("GITHUB_WORKSPACE", "."), "android", "app", "build.gradle")
if not os.path.exists(p):
    print(f"ERROR: {p} not found")
    sys.exit(1)

with open(p) as f:
    src = f.read()

if "suppressKotlinVersionCompatibilityCheck" in src:
    print("Already patched - skipping")
    sys.exit(0)

# Inject inside composeOptions block
pattern = r"(composeOptions\s*\{)"
replacement = r'\1\n        suppressKotlinVersionCompatibilityCheck = "1.9.24"'

new_src, count = re.subn(pattern, replacement, src)
if count == 0:
    # If no composeOptions block exists, inject one inside android { }
    print("No composeOptions block found - injecting new one")
    android_pattern = r"(android\s*\{)"
    injection = r'\1\n    composeOptions {\n        suppressKotlinVersionCompatibilityCheck = "1.9.24"\n    }'
    new_src, count = re.subn(android_pattern, injection, src)
    if count == 0:
        print("ERROR: Could not find android {} block either")
        sys.exit(1)

with open(p, "w") as f:
    f.write(new_src)

print(f"OK Patched ({count} replacement(s))")
print("--- Preview of patched composeOptions ---")
match = re.search(r"composeOptions\s*\{[^}]*\}", new_src)
if match:
    print(match.group(0))
