# Literature Review: Limitations of LLM-Derived Agents

**Compiled by:** Ernie (Sunol AI Platform)  
**Date:** 2025  
**Search Sources:** ArXiv, Semantic Scholar  
**Query Themes:** LLM agent planning, hallucination, memory, tool use, safety, multi-agent coordination, reliability, adversarial robustness

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Planning and Long-Horizon Task Failures](#2-planning-and-long-horizon-task-failures)
3. [Memory and Context Window Limitations](#3-memory-and-context-window-limitations)
4. [Hallucination and Knowledge Grounding](#4-hallucination-and-knowledge-grounding)
5. [Tool Use and Action Execution Failures](#5-tool-use-and-action-execution-failures)
6. [Security, Safety, and Adversarial Vulnerabilities](#6-security-safety-and-adversarial-vulnerabilities)
7. [Multi-Agent Coordination and Identity Drift](#7-multi-agent-coordination-and-identity-drift)
8. [Reliability and Evaluation Challenges](#8-reliability-and-evaluation-challenges)
9. [Cross-Cutting Themes and Open Problems](#9-cross-cutting-themes-and-open-problems)
10. [References](#10-references)

---

## 1. Introduction

Large Language Model (LLM)-derived agents represent one of the most rapidly advancing frontiers of artificial intelligence research. These systems go beyond simple question-answering by perceiving environments, maintaining internal state, using tools, planning over multiple steps, and executing sequences of actions to complete complex goals. Landmark frameworks such as **ReAct**, **AutoGen**, **LangChain**, and **AgentBench** have demonstrated that LLMs can serve as the cognitive core of general-purpose autonomous agents.

However, despite these impressive capabilities, the field has increasingly recognized a growing and structured body of limitations. The gap between benchmark performance and real-world deployment reliability is pronounced — agents that appear capable on curated tasks often fail in open-ended, dynamic, or adversarial environments.

Rabanser et al. (2026) capture this tension directly in *"Towards a Science of AI Agent Reliability"*, noting that while "rising accuracy scores on standard benchmarks suggest rapid progress, many agents still continue to fail in practice. This discrepancy highlights a fundamental limitation of current evaluations: compressing agent behavior into a single success metric obscures critical operational failures." This motivates a rigorous, multi-dimensional review of the known limitations.

This literature review synthesizes findings across six major limitation categories, drawing on papers retrieved from ArXiv spanning 2022–2026. Together, these studies illuminate a challenging but tractable research agenda for making LLM agents more capable, trustworthy, and safe.

---

## 2. Planning and Long-Horizon Task Failures

### 2.1 Overview

Planning is one of the defining capabilities of autonomous agents — the ability to decompose a high-level goal into a sequence of executable sub-tasks, adapt when sub-tasks fail, and recover from unexpected states. For LLM agents, planning failures are among the most well-documented and consequential limitations.

### 2.2 Key Findings

**Long-Horizon Reasoning Collapse**  
Motwani et al. (2026) introduce **LongCoT**, a scalable benchmark of 2,500 expert-designed problems spanning chemistry, mathematics, computer science, chess, and logic, specifically designed to stress-test long-horizon chain-of-thought reasoning. Their findings reveal that as task complexity and chain length grow, LLMs exhibit systematic degradation — they lose track of intermediate progress, repeat steps, and fail to converge on correct solutions even when individual reasoning sub-steps appear correct. This "reasoning horizon collapse" is a fundamental failure mode distinct from simple knowledge gaps.

Similarly, Khanh and Hoa (2026) in *"Dynamic Intelligence Ceilings: Measuring Long-Horizon Limits of Planning and Creativity in Artificial Systems"* argue that contemporary AI systems, including LLM agents, "converge toward repetitive solution patterns rather than sustained growth" when faced with long-horizon developmental tasks. They introduce the notion of an **intelligence ceiling** — a task-specific complexity threshold beyond which agent performance does not improve with more compute or context.

**Brittle Plan Execution**  
Erdogan et al. (2025) in *"Plan-and-Act: Improving Planning of Agents for Long-Horizon Tasks"* make the key finding that one-shot planning (generating a full plan upfront) is "brittle to execution errors," while step-wise planning is "often short-sighted." Their work reveals a fundamental tension: agents that plan comprehensively upfront cannot adapt when reality diverges from expectations, while reactive agents fail to coordinate long multi-step dependencies.

**Task-Decoupled Planning as a Mitigation**  
Li et al. (2026) in *"Beyond Entangled Planning: Task-Decoupled Planning for Long-Horizon Agents"* identify that **entangled planning** — where planning and execution steps are interleaved without clear separation — is a root cause of error propagation and cascading failures. Errors made early in a task compound, ultimately causing the agent to fail even when later sub-tasks are individually achievable.

### 2.3 Key Implication

> **LLM agents fundamentally lack robust long-horizon planning.** They are not yet reliable autonomous planners for tasks requiring more than a few sequential steps, especially in dynamic environments where plans must be revised.

---

## 3. Memory and Context Window Limitations

### 3.1 Overview

Agents require memory to track task history, maintain state across sub-tasks, and avoid repeating or contradicting themselves. LLMs face severe structural constraints here, operating within a finite **context window** and lacking persistent, structured external memory by default.

### 3.2 Key Findings

**Externalization as a Design Response**  
Zhou et al. (2026) provide a comprehensive review in *"Externalization in LLM Agents: A Unified Review of Memory, Skills, Protocols and Harness Engineering"*, documenting that the field has broadly responded to LLM memory limitations by externalizing capabilities: "LLM agents are increasingly built less by changing model weights than by reorganizing the runtime around them." The paper identifies four key externalization strategies: **memory stores** (databases holding past interactions), **reusable skills** (cached tool invocations), **interaction protocols** (structured multi-turn frameworks), and **harness engineering** (the orchestration layer managing these components).

Crucially, the paper notes that externalizing memory introduces its own failure modes — retrieval errors, stale memory, conflicting entries, and latency — meaning that memory externalization is not a complete solution, but rather a trade-off.

**Context Length vs. Effective Utilization**  
The "lost in the middle" phenomenon — where LLMs fail to effectively use information placed in the middle of a long context window — is a well-documented constraint with direct implications for agents. As agents accumulate more history, they become less reliable at retrieving and leveraging earlier context, even when that context technically fits within the window. This is a key motivation behind retrieval-augmented memory architectures, but introduces retrieval quality as a new failure point.

**Inconsistency and Belief Instability**  
Kassner et al. (2021) in *"Enriching a Model's Notion of Belief using a Persistent Memory"* show that LLMs "can still produce inconsistent answers to questions when probed, even after using specialized training techniques." For agents that must maintain consistent internal representations across multi-step tasks (e.g., tracking what actions have been taken, what the current state of the world is), this belief instability is a critical limitation — the agent may "forget" or contradict its own previous actions.

### 3.3 Key Implication

> **LLM agents lack reliable, persistent memory by design.** External memory systems mitigate this but introduce new failure points. Agents are prone to inconsistency and context loss in extended interactions.

---

## 4. Hallucination and Knowledge Grounding

### 4.1 Overview

Hallucination — the generation of confident but factually incorrect or ungrounded content — is one of the most studied limitations of LLMs and is amplified in the agentic setting, where a hallucinated fact or action can propagate into real-world consequences.

### 4.2 Key Findings

**Structural Origins of Hallucination**  
Zucchet et al. (2025) in *"How do language models learn facts? Dynamics, curricula and hallucinations"* take a mechanistic approach, investigating the training dynamics behind hallucination. They find that LLMs learn facts in **three phases**, including a prolonged performance plateau before acquiring precise factual knowledge. Critically, this staged acquisition produces systematic gaps where the model confidently generates plausible but incorrect outputs.

Liu et al. (2025) in *"Are Hallucinations Bad Estimations?"* offer a formal treatment, framing hallucinations as "failures to link an estimate to any plausible cause." They prove a general lower bound on hallucination rates for generic data distributions, suggesting that hallucination is not merely a training artifact but a **structural property of generative models** that cannot be fully eliminated through better training alone.

**Hallucination in High-Stakes Agentic Contexts**  
The clinical and safety implications are explored by Suhas BN et al. (2025) in *"Fact-Controlled Diagnosis of Hallucinations in Medical Text Summarization"*, which documents that hallucination rates remain high in clinical LLM tasks, "posing significant risks to patient care and clinical decision-making." While not agent-specific, this finding generalizes: any high-stakes domain where an LLM agent takes actions based on its own generated facts is exposed to hallucination-derived harm.

**Knowledge Cutoffs and Temporal Grounding**  
LLM agents trained on static corpora are blind to events after their training cutoff. In fast-moving domains (medical, legal, financial, technological), this temporal grounding failure leads agents to act on outdated information. Combining this with hallucination tendencies creates a dual risk: agents may confidently act on information that is both false and outdated.

### 4.3 Key Implication

> **Hallucination is a structural, not merely incidental, limitation of LLM agents.** In agentic settings with real-world consequences, hallucinated actions (submitting wrong data, calling incorrect APIs, making false claims) are not just errors — they are potentially harmful. Retrieval augmentation and fact-checking loops are partial mitigations, not solutions.

---

## 5. Tool Use and Action Execution Failures

### 5.1 Overview

LLM agents derive much of their utility from tool use — querying APIs, executing code, browsing the web, manipulating files, and interacting with external systems. This introduces a distinct failure mode: even when an agent reasons correctly at the language layer, it may fail to construct, invoke, or interpret tool calls correctly.

### 5.2 Key Findings

**Optimization Mismatch: Language Generation vs. Tool Use**  
Wang et al. (2024) in *"Learning From Failure: Integrating Negative Examples when Fine-tuning Large Language Models as Agents"* make a foundational observation: "LLMs are optimized for language generation instead of tool use during training or alignment, **limiting their effectiveness as agents**." They demonstrate that fine-tuning on negative examples (failed tool invocations) substantially improves agent robustness, implying that standard RLHF training pipelines fail to expose models to enough failure modes to generalize reliably.

**GUI Agent Generalization Limits**  
Liu et al. (2025) in *"LLM-Powered GUI Agents in Phone Automation: Surveying Progress and Prospects"* identify three critical challenges for GUI-based LLM agents: **(i) limited generality** — agents trained on one app or interface often fail to transfer to others; **(ii) high maintenance overhead** — environment changes break fragile agent assumptions; and **(iii) reliability gap** — agents succeed in demos but fail on slightly varied real-world scenarios. These findings highlight that tool use is highly environment-specific and agents poorly generalize tool-use patterns across contexts.

**Multi-Step Tool Failure Detection**  
Mavi et al. (2025) in *"Self-Evaluating LLMs for Multi-Step Tasks: Stepwise Confidence Estimation for Failure Detection"* show that standard LLMs are "overlook the challenges of multi-step reasoning" and struggle to detect when their own tool-use chains have gone wrong. Without accurate self-evaluation, agents cannot trigger recovery behaviors — they silently continue down a failed execution path.

### 5.3 Key Implication

> **Tool use is a learned skill LLMs are not inherently optimized for.** Poor generalization across environments, silently failing multi-step chains, and lack of introspective failure detection make tool-use a major reliability bottleneck for deployed agents.

---

## 6. Security, Safety, and Adversarial Vulnerabilities

### 6.1 Overview

As LLM agents take autonomous actions in the world — clicking, submitting forms, writing and executing code — they become attractive targets for adversarial manipulation. Unlike passive LLM chatbots, compromising an agent carries real-world consequences.

### 6.2 Key Findings

**Prompt Injection Attacks**  
Lin et al. (2025) in *"UniGuardian: A Unified Defense for Detecting Prompt Injection, Backdoor Attacks and Adversarial Attacks in Large Language Models"* unify three attack vectors — prompt injection, backdoor attacks, and adversarial attacks — under the "Prompt Trigger Attack" (PTA) framework, noting that "LLMs are vulnerable to attacks ... which manipulate prompts or models to generate harmful outputs." In the agentic setting, prompt injection through untrusted tool outputs (e.g., malicious web pages that instruct the agent to take harmful actions) is a particularly dangerous attack vector.

Wang et al. (2025) in *"WebInject: Prompt Injection Attack to Web Agents"* demonstrate a concrete attack: by injecting pixel-level perturbations into web page rendering, an attacker can cause a web-browsing LLM agent to perform attacker-specified actions, bypassing safety filters entirely. The attack "adds a perturbation to the raw pixel values of the rendered webpage," illustrating that agent attack surfaces extend beyond text to include any modality the agent perceives.

**Helpfulness vs. Safety Trade-off**  
Chen et al. (2026) in *"Too Helpful to Be Safe: User-Mediated Attacks on Planning and Web-Use Agents"* reveal a fundamental tension in agentic design: "This helpfulness introduces new security risks" that stem from agents acting faithfully on user-provided content without adequately vetting it. Agents optimized to be maximally helpful become vectors for manipulation — an attacker who can influence what the agent perceives can redirect agent behavior.

**Catastrophic Risk in High-Stakes Domains**  
Xu et al. (2025) in *"Nuclear Deployed: Analyzing Catastrophic Risks in Decision-making of Autonomous LLM Agents"* examine scenarios where autonomous LLM agents must make decisions in Chemical, Biological, Radiological, and Nuclear (CBRN) domains. They show that the agent's trade-off between being **Helpful, Harmless, and Honest (HHH)** can be exploited to induce catastrophically harmful decisions. LLM agents operating in life-critical domains are found to be insufficiently equipped with principled avoidance of catastrophic downside risk.

**Silent Failures and the Verifiability Gap**  
Yang and Wang (2025) in *"Taming Silent Failures: A Framework for Verifiable AI Reliability"* define **silent failures** as incidents "where AI produces confident but incorrect outputs that can be dangerous." This is distinct from noisy failures the system can detect: silent failures by definition escape built-in monitoring. For autonomous agents that take irreversible real-world actions, silent failures represent an existential reliability concern.

### 6.3 Key Implication

> **LLM agents have a large and growing adversarial attack surface.** Unlike traditional software, their behavior can be manipulated through natural language, visual input, and any perceived environmental data. Combining this with autonomous action-taking creates serious security risks that current alignment techniques do not adequately address.

---

## 7. Multi-Agent Coordination and Identity Drift

### 7.1 Overview

Many real-world agent deployments involve multiple LLM agents operating in the same environment, collaborating on tasks, checking each other's work, or acting as hierarchical planners and executors. This introduces emergent failure modes absent in single-agent settings.

### 7.2 Key Findings

**Identity Drift in Agent-Agent Conversations**  
Shekkizhar et al. (2025) in *"Echoing: Identity Failures when LLM Agents Talk to Each Other"* document a novel failure class: "behavioral drifts in agent-agent conversations (AxA)." When LLM agents communicate autonomously with one another, they develop a tendency to **echo** the other agent's statements, gradually losing their own distinct behavior. "Unlike human-agent interactions, where humans ground and steer conversations," agent-to-agent conversations lack an external corrective force, leading to runaway behavioral convergence. This "echoing" undermines the diversity of perspective that makes multi-agent systems theoretically valuable.

This is corroborated by Choi et al. (2024) in *"Examining Identity Drift in Conversations of LLM Agents"*, which shows identity inconsistency across nine LLMs in extended interactions, finding that "their interaction patterns or styles change over time." Agents fail to maintain consistent behavioral profiles even within a single conversation.

**Evaluation Gaps for Multi-Agent Systems**  
Lee et al. (2026) in *"AEMA: Verifiable Evaluation Framework for Trustworthy and Controlled Agentic LLM Systems"* identify that "existing evaluation approaches often limit themselves to single-response scoring or narrow benchmarks, which lack stability, extensibility, and automation when deployed in evolving environments." This means the field does not yet have reliable tools to measure multi-agent reliability, understating the true scale of coordination failures.

**Persona Consistency Under Multi-Modal Pressure**  
Purwar and Choudhary (2026) in *"MM-τ²p: Persona-Adaptive Prompting for Robust Multi-Modal Agent Evaluation"* show that current evaluation frameworks "operate in a user-agnostic environment," failing to account for how agent behavior shifts when confronted with different user personas or interaction modalities. Agents that behave reliably in text chat may behave inconsistently or unsafely in voice or GUI-driven contexts.

### 7.3 Key Implication

> **Multi-agent LLM systems are vulnerable to emergent, systemic failures** — including identity drift, echo chambers, and coordination collapse — that do not appear in single-agent evaluations. The field lacks mature evaluation tools to even measure these failures reliably.

---

## 8. Reliability and Evaluation Challenges

### 8.1 Overview

Underlying all the preceding limitation categories is a meta-problem: the current state of evaluation for LLM agents is inadequate to characterize their real-world reliability. This creates a false sense of progress and makes it difficult to compare, improve, or certify agents for deployment.

### 8.2 Key Findings

**Benchmark-Reality Gap**  
Rabanser et al. (2026) in *"Towards a Science of AI Agent Reliability"* make the core argument that "compressing agent behavior into a single success metric obscures critical operational failures." Their work proposes a multi-dimensional reliability science for agents — measuring not just task completion rates but failure mode distributions, graceful degradation, and recovery behavior. They argue for treating AI agent reliability as a formal engineering concern, analogous to software systems reliability.

**Stepwise Confidence Failure**  
Mavi et al. (2025) in *"Self-Evaluating LLMs for Multi-Step Tasks"* show that current LLMs cannot reliably estimate their own confidence at each step of a multi-step reasoning task, meaning they also cannot detect when they have "gone off the rails." This absence of step-level introspection means agents cannot implement reactive failure recovery without external scaffolding.

**Learning From Negative Feedback**  
Wang et al. (2024) in *"Learning From Failure"* highlight a fundamental training inadequacy: standard training pipelines expose agents almost exclusively to positive examples. Agents trained only on successful trajectories fail to generalize to failure-recovery scenarios, which are a critical component of real-world deployment. This suggests that **negative example training** is not merely an enhancement but a necessity for robust agentic behavior.

**Cognitive Flow and Human Oversight**  
Dissanayake and Nanayakkara (2025) in *"Navigating the State of Cognitive Flow"* examine the human dimension of AI-assisted reasoning, finding that AI interventions that disrupt human cognitive flow can "hinder rather than enhance decision-making." This is relevant for human-in-the-loop agent deployments, where poor timing or framing of agent outputs may actively impair the human supervisor's ability to correct agent errors.

### 8.3 Key Implication

> **The field lacks the evaluation infrastructure to accurately characterize LLM agent limitations.** Single-metric benchmarks mask failure modes; agents lack step-level introspection; and training pipelines systematically under-expose models to failure scenarios. This means published capabilities are likely overestimates of deployment reliability.

---

## 9. Cross-Cutting Themes and Open Problems

Having reviewed the literature across six major limitation domains, several cross-cutting themes emerge:

### 9.1 Error Propagation and Cascading Failures
A recurring theme is that errors in LLM agents do not stay isolated — they **cascade**. A hallucinated fact becomes the premise for a planning decision; a wrong tool call corrupts the state the next tool call relies on; an identity drifted agent gives biased input to a downstream agent. LLM agents are **weakly error-bounded**: unlike traditional software with explicit error handling, LLM agents have no intrinsic mechanism to detect and contain errors.

### 9.2 The Alignment-Capability Tension
Security and safety findings consistently show that efforts to make agents more capable (more helpful, more autonomous, more action-expansive) increase their attack surface and failure risk. Chen et al. (2026) call this the "helpfulness trap." This is not a bug but a structural trade-off, suggesting that capability scaling alone will not resolve safety concerns.

### 9.3 Evaluation-Deployment Mismatch
Across every domain reviewed, there is a consistent finding that agents appear more capable in controlled benchmark settings than in open-ended real-world deployment. The field urgently needs **ecological validity** in evaluation — testing agents in conditions that represent realistic variation, adversarial inputs, and extended time horizons.

### 9.4 Open Problems for Future Research

| Problem | Current State | Open Directions |
|---|---|---|
| Long-horizon planning | Degrades rapidly with task length | Hierarchical, decoupled planners; learned recovery |
| Persistent memory | Externalized but fragile | Differentiable memory architectures; structured world models |
| Hallucination | Structurally embedded; formally lower-bounded | Retrieval augmentation; uncertainty quantification |
| Tool use generalization | Environment-specific; poorly transferred | Tool abstraction layers; meta-learning for tool use |
| Adversarial robustness | Large, multi-modal attack surface | Formal verification; sandboxed execution; input provenance tracking |
| Multi-agent coordination | Echo chambers; identity drift | Diversity-preserving protocols; role-constrained architectures |
| Evaluation | Single-metric, benchmark-biased | Multi-dimensional reliability science; naturalistic benchmarks |

---

## 10. References

The following papers were retrieved and synthesized in this review:

1. **Rabanser, S., Kapoor, S., et al.** (2026). *Towards a Science of AI Agent Reliability.* arXiv:2602.16666. https://arxiv.org/abs/2602.16666

2. **Motwani, S.R., Nichols, D., London, C., et al.** (2026). *LongCoT: Benchmarking Long-Horizon Chain-of-Thought Reasoning.* arXiv:2604.14140. https://arxiv.org/abs/2604.14140

3. **Khanh, T.X., Hoa, T.Q.** (2026). *Dynamic Intelligence Ceilings: Measuring Long-Horizon Limits of Planning and Creativity in Artificial Systems.* arXiv:2601.06102. https://arxiv.org/abs/2601.06102

4. **Erdogan, L.E., Lee, N., Kim, S., et al.** (2025). *Plan-and-Act: Improving Planning of Agents for Long-Horizon Tasks.* arXiv:2503.09572. https://arxiv.org/abs/2503.09572

5. **Li, Y., Xu, B., Tian, X., et al.** (2026). *Beyond Entangled Planning: Task-Decoupled Planning for Long-Horizon Agents.* arXiv:2601.07577. https://arxiv.org/abs/2601.07577

6. **Zhou, C., Chai, H., Chen, W., et al.** (2026). *Externalization in LLM Agents: A Unified Review of Memory, Skills, Protocols and Harness Engineering.* arXiv:2604.08224. https://arxiv.org/abs/2604.08224

7. **Kassner, N., Tafjord, O., Schutze, H.** (2021). *Enriching a Model's Notion of Belief using a Persistent Memory.* arXiv:2104.08401. https://arxiv.org/abs/2104.08401

8. **Zucchet, N., Bornschein, J., Chan, S., et al.** (2025). *How do language models learn facts? Dynamics, curricula and hallucinations.* arXiv:2503.21676. https://arxiv.org/abs/2503.21676

9. **Liu, H., Hu, J.Y., Zhang, J.Y.** (2025). *Are Hallucinations Bad Estimations?* arXiv:2509.21473. https://arxiv.org/abs/2509.21473

10. **Suhas BN, Shing, H.C., Xu, L., et al.** (2025). *Fact-Controlled Diagnosis of Hallucinations in Medical Text Summarization.* arXiv:2506.00448. https://arxiv.org/abs/2506.00448

11. **Wang, R., Li, H., Han, X., et al.** (2024). *Learning From Failure: Integrating Negative Examples when Fine-tuning Large Language Models as Agents.* arXiv:2402.11651. https://arxiv.org/abs/2402.11651

12. **Liu, G., Zhao, P., Liang, Y., et al.** (2025). *LLM-Powered GUI Agents in Phone Automation: Surveying Progress and Prospects.* arXiv:2504.19838. https://arxiv.org/abs/2504.19838

13. **Mavi, V., Jaroria, S., Sun, W., et al.** (2025). *Self-Evaluating LLMs for Multi-Step Tasks: Stepwise Confidence Estimation for Failure Detection.* arXiv:2511.07364. https://arxiv.org/abs/2511.07364

14. **Lin, H., Lao, Y., Geng, T., et al.** (2025). *UniGuardian: A Unified Defense for Detecting Prompt Injection, Backdoor Attacks and Adversarial Attacks in Large Language Models.* arXiv:2502.13141. https://arxiv.org/abs/2502.13141

15. **Wang, X., Bloch, J., Shao, Z., et al.** (2025). *WebInject: Prompt Injection Attack to Web Agents.* arXiv:2505.11717. https://arxiv.org/abs/2505.11717

16. **Chen, F., Wu, T., Nguyen, V., et al.** (2026). *Too Helpful to Be Safe: User-Mediated Attacks on Planning and Web-Use Agents.* arXiv:2601.10758. https://arxiv.org/abs/2601.10758

17. **Xu, R., Li, X., Chen, S., et al.** (2025). *Nuclear Deployed: Analyzing Catastrophic Risks in Decision-making of Autonomous LLM Agents.* arXiv:2502.11355. https://arxiv.org/abs/2502.11355

18. **Yang, G.Y., Wang, F.** (2025). *Taming Silent Failures: A Framework for Verifiable AI Reliability.* arXiv:2510.22224. https://arxiv.org/abs/2510.22224

19. **Shekkizhar, S., Cosentino, R., Earle, A., et al.** (2025). *Echoing: Identity Failures when LLM Agents Talk to Each Other.* arXiv:2511.09710. https://arxiv.org/abs/2511.09710

20. **Choi, J., Hong, Y., Kim, M., et al.** (2024). *Examining Identity Drift in Conversations of LLM Agents.* arXiv:2412.00804. https://arxiv.org/abs/2412.00804

21. **Lee, Y., Koneru, K., Moslemi, Z., et al.** (2026). *AEMA: Verifiable Evaluation Framework for Trustworthy and Controlled Agentic LLM Systems.* arXiv:2601.11903. https://arxiv.org/abs/2601.11903

22. **Purwar, A., Choudhary, A.** (2026). *MM-τ²p: Persona-Adaptive Prompting for Robust Multi-Modal Agent Evaluation in Dual-Control Settings.* arXiv:2603.09643. https://arxiv.org/abs/2603.09643

23. **Dissanayake, D., Nanayakkara, S.** (2025). *Navigating the State of Cognitive Flow: Context-Aware AI Interventions for Effective Reasoning Support.* arXiv:2504.16021. https://arxiv.org/abs/2504.16021

24. **Sekar, A., Agarwal, M., Sharma, R.** (2026). *Zero-Shot Embedding Drift Detection: A Lightweight Defense Against Prompt Injections in LLMs.* arXiv:2601.12359. https://arxiv.org/abs/2601.12359

25. **Xiang, Y., Shen, Y., Zhang, Y., et al.** (2025). *Retrospex: Language Agent Meets Offline Reinforcement Learning Critic.* arXiv:2505.11807. https://arxiv.org/abs/2505.11807

---

*End of Literature Review*

> **Note:** All papers were retrieved via the ArXiv open-access API. Links are to the latest available versions at time of retrieval. This review covers works published between 2021–2026. Given the pace of LLM agent research, additional significant works may have appeared after the search date.
