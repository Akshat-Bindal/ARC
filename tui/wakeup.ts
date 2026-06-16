import chalk from "chalk";
import figlet from "figlet";

import {select, isCancel} from "@clack/prompts";
import { runCliMode } from "../modes/cli";

const BANNER_Font = 'ANSI Shadow';
const SHADOW =  chalk.hex('#276dd5');
const FACE = chalk.hex('#e8dcf8').bold;

function printBannerWithShadow(ascii: string) {

  const bannerLines = ascii.replace(/\s+$/, '').split('\n');
  const maxLen = Math.max(...bannerLines.map((l) => l.length), 0);
  const rowWidth = maxLen + 2;

  for (const line of bannerLines) {
    console.log(SHADOW(('  ' + line).padEnd(rowWidth)));
  }
  process.stdout.write(`\x1b[${bannerLines.length}A`);
  for (const line of bannerLines) {
    console.log(FACE(line.padEnd(rowWidth)));
  }
  console.log();
}

export async function runWakeup(){
    let ascii:string;
    try{
        ascii = figlet.textSync("OPENCLAW", {font:BANNER_Font});
    }catch(error){
        ascii = figlet.textSync("OPENCLAW",{font:"Standard"});
    }

    printBannerWithShadow(ascii)

    const mode=await select({
        message:"Select the mode you prefer",
        options:[
            {value:"CLI", label:"CLI"},
            {value:"Telegram",label:"Telegram"}
        ]
    });
    
    if(isCancel(mode || mode === "exit")){
        console.log(chalk.dim('\n Goodbye. \n'));
        return;
    }

    if(mode=="CLI"){
        await runCliMode();
    }
    else if(mode=="Telegram"){
        console.log(chalk.dim("Starting Telegram Mode ... "));
    }
}