# BrilliantSole.js

Web SDK for BrilliantSole insoles

## Installation

__To insall via npm:__
```javascript
npm install brilliantsole
```

__to add in a webpage:__
```html
<script src="https://unpkg.com/brilliantsole@latest/build/brilliantsole.js"></script>
```

## Running the Node.js server for WebSocket/UDP stuff

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

afterward, you can install using yarn:  
`yarn install`

and then run `start`:  
`yarn start`
