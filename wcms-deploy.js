#!/usr/bin/env node

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import process from "process";

const [, , cmd, ...rest] = process.argv;

const task = await import(`./scripts/${cmd}.js`);

switch (cmd) {
  case "addNewTags":
    await task.default(...rest);
    break;
  case 'toggleHold':
    await task.default(...rest);
    break;
  default:
    await task.default();
}
