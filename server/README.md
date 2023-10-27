# Virtual Browser

Backend repository for the virtual browser service.

1. Server waits for a connection from a client
2. Init websocket connection. Fire up a chrome puppeteer window.
3. Setup an interval with a callback to send a screenshot of browser.
4. Listen for the 'image' event on the client. Draw the image on the canvas.
