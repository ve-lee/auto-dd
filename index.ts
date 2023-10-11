import si from "systeminformation";
import exec from "await-exec";
import fs from "fs";

let ripping = undefined as si.Systeminformation.BlockDevicesData | undefined;

async function addToHistory(rippedId: string) {
  var logStream = fs.createWriteStream("log.txt", { flags: "a+" });
  // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
  //   logStream.write("Initial line...");
  logStream.end(`\n${rippedId}`);
}

function alreadyRipped(rippingId: string) {
  const log = fs.readFileSync("log.txt", { encoding: "utf8" });
  return log.includes(rippingId);
}

async function getImage() {}

function createRipFolder(path: string) {
  const created = fs.mkdirSync(`.\\rips\\${path}`, { recursive: true });
  console.log(created);
}

async function checkDvd(driveId: string): Promise<Function> {
  const drives = await si.blockDevices();
  const cddrive = drives.find(
    (driver) =>
      driver.physical === "CD/DVD" && driver.identifier === `${driveId}:`
  );
  ripping = cddrive;
  if (!ripping) {
    return () => console.log(`Drive '${driveId}' not found, exiting...`);
  }
  const rippingId = `${ripping.serial}-${ripping.label}`;
  if (ripping.serial === "") {
    console.log(`Empty tray, please insert a cd`);
  } else if (alreadyRipped(rippingId)) {
    console.log(`${rippingId} Already ripped, please inser another cd`);
  } else {
    console.log(`Starting ripping ${rippingId} in :`);
    createRipFolder(rippingId);

    const ripExec = `dd if=\\\\.\\${driveId.toLowerCase()}: of=".\\rips\\${rippingId}\\${rippingId}.iso" bs=1M --progress`;
    console.log("ripping", ripExec);
    const ripResult = exec(ripExec);

    const scanExec = `wia-cmd-scanner /w 210 /h 297 /dpi 300 /color RGB /format PNG /output ".\\rips\\${rippingId}\\${rippingId}.png"`;
    console.log("scanning", scanExec);
    const scanResult = exec(scanExec);

    const results = await Promise.all([ripResult, scanResult]);

    console.log(results);
    if (results.every((result) => result.stdout !== "")) {
      addToHistory(rippingId);
      console.log(`${ripping} ripped, waiting for new cd`);
    }
  }
  return await checkDvd("D");
}

async function main() {
  checkDvd("D");
}

main();
