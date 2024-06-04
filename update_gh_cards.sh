#!/bin/bash

if [[ "$1" == "update" ]]; then
    cd static/img/gh-cards/Twinklebear/

    for f in `ls *.svg`; do
        echo "Fetching updated SVG for $f"
        rm $f
        wget https://gh-card.dev/repos/Twinklebear/$f 
    done

    cd ../../../../
elif [[ "$1" == "add" ]]; then
    cd static/img/gh-cards/Twinklebear/

    echo "Adding new SVG for $2"
    wget https://gh-card.dev/repos/Twinklebear/$2.svg

    cd ../../../../
else
    echo "Commands: update or add <repo name>"
fi

