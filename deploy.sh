npm run build
rm -rf ../guess-css-site/docs
mkdir ../guess-css-site/docs
cp dist/* ../guess-css-site/docs/
touch ../guess-css-site/docs/.nojekyll
cd ../guess-css-site
git add .
git commit -m site
git push origin main
cd ../guess-css
