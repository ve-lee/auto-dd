# auto-dd

A very simple cd backup automatic solution for windows, written in nodeJs. Could be improved.
Using dd.exe and wia-cmd-scanner.exe, included.

It polls for new cd, and when one is found it copy its content to iso file and scan whatever is in the scanner.

To start:

```js
yarn install
node index.js
```

Then follow steps:
1. insert cover in scanner
2. insert CD in drive
3. wait for completion ('Already ripped Iso, waiting for new CD')
4. eject the CD
5. remove the cover
6. put CD in cover
7. repeat

stop with `ctrl+c`