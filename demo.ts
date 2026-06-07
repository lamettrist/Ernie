import { WorldAgent } from "./lib/agents.ts";
import { models } from "./lib/models.ts";
const john = new WorldAgent(models[1]); // the one in .env
// console.log(await john.run("Ernie make documentation for your CLI dawg"));
console.log(await john.run("Ernie also pls commit this to github under you committing it!"))