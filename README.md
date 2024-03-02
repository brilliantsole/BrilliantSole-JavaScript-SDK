# BrilliantSole.js

Web SDK for BrilliantSole insoles

## Running the Node.js server for OSC/WebSocket stuff

On macOS:  
for the security stuff, run the command in the terminal:  
`sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./sec/key.pem -out ./sec/cert.pem`
Windows is the same but without `sudo`, if you have openssl installed

install https://code.visualstudio.com/ & https://nodejs.org/en/  
install npm in terminal: sudo npm install  
install yarn in VS Code terminal: yarn install  
start localhost: yarn start (try sudo yarn start if that doesn't work)  
open https://localhost/ in chrome

if it doesn't work, try turning the firewall off

if you have issues saving or running stuff on mac, try:  
`sudo chown -R username directory_name`
