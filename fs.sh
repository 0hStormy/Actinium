# Zip filesystem
mkdir fs
cd fs
cp -r ../apps bin
mkdir home
zip -r ../fs.zip *
cd ..
rm -r fs