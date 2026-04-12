# Hi, I'm Chris "Sean" Dabatos

📍 Las Vegas | 💻 Developer | 🥑 DevRel @ [TiDB](https://github.com/pingcap/tidb)

> I build apps I'd actually use myself, then share them with the world.

![Profile Views](https://komarev.com/ghpvc/?username=RealChrisSean&color=blue&style=flat-square)

[![My Skills](https://skillicons.dev/icons?i=ts,nextjs,react,python,nodejs,tailwind,postgres,vercel)](https://skillicons.dev)

## Currently Working On
- [**RecallMEM**](https://github.com/RealChrisSean/RecallMEM) - Built my own private AI chatbot w/ Gemma 4. I personally just don't want my data sitting on someone else's server. So I built RecallMEM. Where every single byte of YOUR conversation stays on YOUR machine. No account, no cloud, and no telemetry needed. And the best part, it remembers everything you talk about across not only sessions, but days, weeks and even months.<br>
<details>
<summary><b>How RecallMEM's Memory Architecture Works</b></summary>
<br>

```
┌─────────────────────────────────────────────────────────────────┐
│                  RECALLMEM MEMORY ARCHITECTURE                  │
│                  100% local. No cloud. No LLM in the loop       │
│                  for retrieval. Ever.                           │
└─────────────────────────────────────────────────────────────────┘

  YOU SEND A MESSAGE                READ PATH (deterministic)
  ──────────────────►       ┌──────────────────────────────┐
                            │  Plain SQL pulls profile     │
                            │  Plain SQL pulls active      │
                            │    facts (with valid_from    │
                            │    date stamps)              │
                            │  EmbeddingGemma converts     │
                            │    your message to a vector  │
                            │  pgvector cosine similarity  │
                            │    ranks past chunks         │
                            │  TypeScript template builds  │
                            │    the system prompt         │
                            └──────────────┬───────────────┘
                                           │
                                           ▼
                            ┌──────────────────────────────┐
                            │   Your chosen LLM            │
                            │   (Gemma 4 / Claude / GPT)   │
                            │   sees a fully-assembled     │
                            │   prompt with dated memory   │
                            └──────────────────────────────┘

  The LLM never queries the database. It cannot "decide" to
  retrieve something. It cannot hallucinate a memory that
  isn't there - if it's not in the prompt, it doesn't exist
  for the model.

═══════════════════════════════════════════════════════════════════
  AFTER EVERY ASSISTANT REPLY — LIVE FACT EXTRACTION
═══════════════════════════════════════════════════════════════════

  Stream closes
       │
       ▼  fire-and-forget, user never waits
  Local Gemma 4 E4B reads the running transcript AND the
  existing active facts. Returns a JSON object:
       {
         facts: ["new fact 1", "new fact 2"],
         supersedes: ["uuid-of-old-fact-that-no-longer-true"]
       }
       │
       ▼
  TypeScript validator (6 gates)
       │
       ├──► garbage filter (meta-observations,
       │    AI behavior notes, "hasn't shared", etc)
       ├──► JSON parse + type validation
       ├──► length / quality bar
       ├──► dedupe against entire facts table
       ├──► category routing (keyword + inflection,
       │    no LLM)
       └──► insert OR retire
              │
              ▼
  Old facts get is_active=false, valid_to=NOW().
  History preserved. Active set always reflects current truth.
       │
       ▼
  recategorizeAllFacts() re-runs the router on every fact.
  Categories self-heal as the logic improves.
       │
       ▼
  rebuildProfile() synthesizes a structured profile from
  active facts. Each fact stamped with its valid_from date.

═══════════════════════════════════════════════════════════════════
  TEMPORAL CONTEXT — SOLVES THE COLLAPSE PROBLEM
═══════════════════════════════════════════════════════════════════

  Across conversations:  every active fact in the prompt is
                         stamped [YYYY-MM-DD]. Newer facts
                         override older ones if they conflict.

  Resumed conversations: chat last touched > 2 hours ago?
                         single system marker injected:
                         [Conversation resumed 6 days later]

  Retrieved chunks:      vector search results prefixed with
                         [from conversation on YYYY-MM-DD]
                         so the model can tell history from now.
```

| | How Most AI Apps Do It | RecallMEM |
|---|---|---|
| **Runs locally** | ❌ Cloud only | ✅ Postgres + Ollama on your Mac |
| **Memory retrieval** | LLM tool calls (hallucinable) | Deterministic SQL + pgvector |
| **Fact storage** | JSON blobs / summaries | One row per fact, validated 6 ways |
| **Profile synthesis** | LLM (drift, corruption) | Pure TypeScript, idempotent |
| **Bad LLM run** | Corrupts memory | Cannot touch the DB |
| **Stale facts** | Sit alongside current ones | Auto-retired via supersession |
| **Temporal awareness** | None (everything looks "now") | Every fact has valid_from + valid_to |
| **Resumed chats** | Model has no idea time passed | System marker for >2hr gaps |
| **Bring your own LLM** | ❌ vendor lock-in | ✅ Ollama / Claude / GPT / any OpenAI-compatible |
| **Install** | sign up, pay, wait | `npx recallmem` |
| **License** | Closed | Apache 2.0 |

</details>

## Current Status for RecallMEM

| Phase | What | Status |
|-------|------|--------|
| 1 | Foundation (Next.js 16 + Postgres 17 + pgvector + EmbeddingGemma) | ✅ Complete |
| 2 | Deterministic memory (profile + facts + vector search, TS-gated writes, temporal awareness) | ✅ Complete |
| 3 | LLM agnostic (Ollama, Anthropic, OpenAI, xAI, any OpenAI-compatible) | ✅ Complete |
| 4 | Multiple brains (isolated memory namespaces per project/context) | ✅ Complete |
| 5 | Voice + vision (STT/TTS multi-provider, PDF page rendering for LLMs) | ✅ Complete |
| 6 | Settings, usage tracking, in-app updates, dark mode, web search | ✅ Complete |
| 7 | Grok Voice Agent (real-time WebSocket with memory + web search) | 🔧 Built, stabilizing |
| 8 | Cloud SaaS version | 📅 Next week |

## My Projects

- [Speak2Me](https://speak2me.io) - Your personal Voice AI Agent. Built with real-time emotion detection through your voice (Hume EVI), Claude Opus 4.6 brain, deterministic facts engine that pins identity facts so they never fall off. 
- [BaseCamp](https://base-camp-five.vercel.app) - Voice-first personal health OS that builds long-term memory about what works for YOUR body
- [Parallel Lives](https://app.parallellives.ai) - AI decision simulator using multi-model reasoning (Claude + GPT)
- [Speak It](https://app.parallellives.ai/speak-it) - Voice-to-text Chrome extension that learns your style without storing your words
- [College Picker](https://github.com/RealChrisSean/college-picker) - AI college comparison with real Dept. of Education data
- [Journal It](https://app.parallellives.ai/journal) - AI journaling system that writes your autobiography
- [atlasMemory](https://github.com/RealChrisSean/atlasMemory) - Unified AI memory layer with branching and rollbacks
- [OriginAI](https://app.parallellives.ai/detect) - Chrome extension to detect AI-generated content

## Latest Blog Posts

- [Coding Used to Be Hard](https://www.chrisdabatos.com/blog/coding-used-to-be-hard/) - Apr 2026
- [Study Mode](https://www.chrisdabatos.com/blog/study-mode/) - Mar 2026
- [AI Engineering Is the New Web Dev](https://www.chrisdabatos.com/blog/ai-engineering-new-web-dev/) - Mar 2026
- [AI Memory Is Broken. I Know Because I Built It.](https://www.chrisdabatos.com/blog/ai-memory-is-broken/) - Feb 2026
- [Building a Voice-to-Text App That Learns Your Style](https://www.chrisdabatos.com/blog/speak-it/) - Jan 2026
- [I Built a System That Writes My Autobiography While I Use It](https://www.chrisdabatos.com/blog/ai-journal-system/) - Dec 2025

## Content
- [Blog](https://www.chrisdabatos.com/) - Technical deep-dives
- Speaking: [AllThingsAI 2026](https://2026.allthingsai.org/sessions/write-like-me-not-for-me), [Percona Live](https://www.youtube.com/watch?v=ufiRoKlBj4A), SF Awesome AI Dev Tools

## Connect

[![X](https://img.shields.io/badge/@RealChrisSean-black?style=flat-square&logo=x&logoColor=white)](https://x.com/RealChrisSean) [![LinkedIn](https://img.shields.io/badge/YouTube-FF0000?style=flat-square&logo=youtube&logoColor=white)](https://youtube.com/@RealChrisSean) [![Website](https://img.shields.io/badge/chrisdabatos.com-000?style=flat-square&logo=vercel&logoColor=white)](https://chrisdabatos.com)
