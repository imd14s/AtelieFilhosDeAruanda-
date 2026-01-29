#!/bin/bash
find . -type f \
  -not -path '*/target/*' \
  -not -path '*/.git/*' \
  -not -path '*/.idea/*' \
  -not -path '*/.mvn/*' \
  -not -name '*.class' \
  -not -name '*.jar' \
  -not -name '*.jpg' \
  -not -name '*.png' \
  -not -name 'mvnw*' \
  -exec bash -c 'echo -e "\n--- ARQUIVO: $1 ---" >> projeto_completo.txt; cat "$1" >> projeto_completo.txt' _ {} \;