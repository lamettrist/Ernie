import { WorldAgent } from "./lib/agents.ts";
import { models } from "./lib/models.ts";
const john = new WorldAgent(models[1]); // the one in .env
console.log(await john.run("Hi Ernie, could you create an file to inference with a variety of AI agents in C++? Thanks"));
