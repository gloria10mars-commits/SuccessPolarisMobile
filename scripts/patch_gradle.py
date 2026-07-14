#!/usr/bin/env python3
"""Patch build.gradle pour supprimer le check de version Kotlin/Compose.

La propriété `suppressKotlinVersionCompatibilityCheck` doit être définie
comme propriété Kotlin (pas Compose) sous la forme d'un map kotlinOptions.kotlinCompilerExtensionVersion.
En réalité elle s'écrit : composeOptions { kotlinCompilerExtensionVersion = "..." }
et la suppression se met dans le block kotlinOptions.

Référence: https://developer.android.com/jetpack/androidx/releases/compose-kotlin
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

# La propriété suppressKotlinVersionCompatibilityCheck se met dans kotlinOptions
# sous forme: kotlinOptions { freeCompilerArgs += ["-P", "plugin:androidx.compose.compiler.plugins.kotlin:suppressKotlinVersionCompatibilityCheck=1.9.24"] }
patch = '''
    kotlinOptions {
        freeCompilerArgs += [
            "-P",
            "plugin:androidx.compose.compiler.plugins.kotlin:suppressKotlinVersionCompatibilityCheck=1.9.24"
        ]
    }'''

# Injecter dans le block android { }
android_pattern = r"(android\s*\{)"
new_src, count = re.subn(android_pattern, r"\1\n" + patch, src)

if count == 0:
    print("ERROR: Could not find android {} block")
    sys.exit(1)

with open(p, "w") as f:
    f.write(new_src)

print(f"OK Patched ({count} replacement(s)) - injected kotlinOptions.freeCompilerArgs")
print("--- Preview ---")
match = re.search(r"android\s*\{[^}]*kotlinOptions[^}]*\}", new_src)
if match:
    print(match.group(0)[:500])
