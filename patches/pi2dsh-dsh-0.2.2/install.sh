#!/usr/bin/env bash
# Install the Pi vision bridge (pi2dsh + @kassing/pi-vision) into a DSH profile and
# apply the 0.2.2-rc.3 compatibility patches. Rerun after any engine upgrade.
set -euo pipefail

profile=${1:-web}
dsh_version=0.2.2-rc.3
root=${DSH_HOME:-$HOME/.dsh}

dsh plugin --profile "$profile" allow-version "pi2dsh@0.28.0-next.1" \
  --dsh-version "$dsh_version" --accept-risk
dsh plugin --profile "$profile" add "pi2dsh@0.28.0-next.1"
dsh plugin --profile "$profile" add "@kassing/pi-vision"
node "$(dirname "$0")/apply.mjs" "$root/profiles/$profile"

echo "Restart dsh so the engine mounts, then select a '… + Vision Bridge' model group."
