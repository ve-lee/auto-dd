"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const systeminformation_1 = __importDefault(require("systeminformation"));
const await_exec_1 = __importDefault(require("await-exec"));
const fs_1 = __importDefault(require("fs"));
let ripping = undefined;
function addToHistory(rippedId) {
    return __awaiter(this, void 0, void 0, function* () {
        var logStream = fs_1.default.createWriteStream("log.txt", { flags: "a+" });
        // use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file
        //   logStream.write("Initial line...");
        logStream.end(`\n${rippedId}`);
    });
}
function alreadyRipped(rippingId) {
    const log = fs_1.default.readFileSync("log.txt", { encoding: "utf8" });
    //   console.log(log, log.includes(rippingId));
    //   return fs.existsSync(`.\\rips\\${rippingId}\\${rippingId}.iso`);
    return log.includes(rippingId);
}
function getImage() {
    return __awaiter(this, void 0, void 0, function* () { });
}
function createRipFolder(path) {
    const created = fs_1.default.mkdirSync(`.\\rips\\${path}`, { recursive: true });
    console.log(created);
}
function checkDvd(driveId) {
    return __awaiter(this, void 0, void 0, function* () {
        const drives = yield systeminformation_1.default.blockDevices();
        const cddrive = drives.find((driver) => driver.physical === "CD/DVD" && driver.identifier === `${driveId}:`);
        ripping = cddrive;
        //   console.log("drive", ripping);
        if (!ripping) {
            return () => console.log(`Drive '${driveId}' not found, exiting...`);
        }
        const rippingId = `${ripping.serial}-${ripping.label}`;
        //   console.log(`checking drive ${driveId}: = ${rippingId}`)
        if (ripping.serial === "") {
            console.log(`Empty tray, please insert a cd`);
        }
        else if (alreadyRipped(rippingId)) {
            console.log(`${rippingId} Already ripped, please inser another cd`);
        }
        else {
            console.log(`Starting ripping ${rippingId} in :`);
            createRipFolder(rippingId);
            const ripExec = `dd if=\\\\.\\${driveId.toLowerCase()}: of=".\\rips\\${rippingId}\\${rippingId}.iso" bs=1M --progress`;
            console.log("ripping", ripExec);
            const ripResult = (0, await_exec_1.default)(ripExec);
            const scanExec = `wia-cmd-scanner /w 210 /h 297 /dpi 300 /color RGB /format PNG /output ".\\rips\\${rippingId}\\${rippingId}.png"`;
            console.log("scanning", scanExec);
            const scanResult = (0, await_exec_1.default)(scanExec);
            const results = yield Promise.all([ripResult, scanResult]);
            console.log(results);
            if (results.every((result) => result.stdout !== "")) {
                addToHistory(rippingId);
                console.log(`${ripping} ripped, waiting new cd`);
            }
        }
        //   else {
        //     console.log(`${rippingId} Already ripped Iso, waiting new cd`);
        //   }
        return yield checkDvd("D");
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        checkDvd("D");
    });
}
main();
