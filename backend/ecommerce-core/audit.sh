#!/usr/bin/env bash
set -euo pipefail

# Uso:
#   ./audit.sh scan
#   ./audit.sh show <caminho-do-arquivo> [inicio] [fim]
#   ./audit.sh grep "<regex>" [pasta]

cmd="${1:-scan}"

show() {
  local f="$1"
  local a="${2:-1}"
  local b="${3:-220}"
  echo "===== $f ($a-$b) ====="
  nl -ba "$f" | sed -n "${a},${b}p"
  echo
}

scan() {
  echo "== 1) Duplicatas por nome (interfaces/classes) =="
  grep -RIn --include="*.java" -E "^(public )?(class|interface) SystemConfigRepository" src/main/java || true
  echo

  echo "== 2) Onde DynamicConfigService aponta =="
  grep -RIn --include="*.java" "class DynamicConfigService" -n src/main/java || true
  grep -RIn --include="*.java" "SystemConfigRepository" src/main/java/com/atelie/ecommerce/api/config || true
  echo

  echo "== 3) Entities de config e @Table =="
  grep -RIn --include="*.java" -E "@Table\\(name = \"system_config(s)?\"\\)" src/main/java || true
  echo

  echo "== 4) allow-bean-definition-overriding (NÃO deveria ficar ligado) =="
  grep -RIn --include="*.properties" --include="*.yml" --include="*.yaml" \
    "allow-bean-definition-overriding" src/main/resources src/test/resources || true
  echo

  echo "== 5) Beans de security duplicados =="
  grep -RIn --include="*.java" -E "@Bean\\s+public\\s+(PasswordEncoder|AuthenticationManager|SecurityFilterChain)" src/main/java || true
  echo

  echo "== 6) Tests que mexem em SystemConfigEntity =="
  grep -RIn --include="*.java" "SystemConfigEntity" src/test/java || true
  echo
}

grep_any() {
  local pattern="$1"
  local dir="${2:-src}"
  grep -RIn --include="*.java" -E "$pattern" "$dir" || true
}

case "$cmd" in
  scan) scan ;;
  show) show "${2:?arquivo}" "${3:-1}" "${4:-220}" ;;
  grep) grep_any "${2:?regex}" "${3:-src}" ;;
  *) echo "uso: $0 scan|show|grep" ; exit 1 ;;
esac
