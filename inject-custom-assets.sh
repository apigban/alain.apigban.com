#!/bin/bash

# Script to inject custom CSS and JS into the built HTML

# Backup original index.html
cp public/index.html public/index.html.backup

# Inject custom CSS after existing CSS links
sed -i '/<\/head>/i\  <!-- Custom CSS for Hero Section -->\n  <link rel="stylesheet" href="/css/custom.css">\n  <!-- Font Awesome for social icons -->\n  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />' public/index.html

# Inject custom JS before closing body tag
sed -i '/<\/body>/i\  <!-- Custom JavaScript for Hero Section -->\n  <script src="/js/hero-enhancements.js" defer></script>' public/index.html

echo "Custom assets injected successfully!"
echo "Original file backed up as: public/index.html.backup"