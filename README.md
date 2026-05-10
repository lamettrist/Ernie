# Ernie
<i>Augmented LLM-derived agents with unrestricted access to the tools necessary to interact with the world.</i>

<details>
<summary><strong>Why am I making this?</strong></summary>
<br>
Ever since I saw the creation of a World environment for agents to interact and communicate on LinkedIn, I was curious if it would be possible for a agent to take the steps necessary to evolve and interact with the real-world with a lack of restrictions (apart from following legal principles) to act on its goals. That's why Ernie exists.
</details>
<br>

<details>
<summary><strong>Isn't this dangerous?</strong></summary>
<br />
Much like a Copilot, yes, if it encounters malicious instructions on the internet or degrades in performance which causes risks since it executes tasks, so we recommend isolating this bot in a virtual environment (like GitHub Codespaces) before continuing to interact with the agent. 
<br />
</details>


## Setup

Required Dependencies:

* Bun
* HackClub AI Platform API Key

Setup Instructions:
1. Get a API Key from HackClub (or use any AI platform you wish and modify models.ts to leverage said platform)
2. Put your API Key in .env (HackClub with the format seen in .env.example)
3. Run ``bun install`` and then interact with it using the example format!

## Examples

Interaction:
```js
import { WorldAgent } from "./lib/agents.ts";
import { models } from "./lib/models.ts";
const john = new WorldAgent(models[1]); // the one in .env
console.log(await john.run("Hi Ernie! Could you refine the tools seen in tools.ts to suit your functionality better?"));
```

Refer to the example.ts folder for more examples about what Ernie can do.