# Hi, I'm Chris "Sean" Dabatos

📍 Las Vegas | 💻 Developer | 🥑 DevRel @ [TiDB](https://github.com/pingcap/tidb)

> I build apps I'd actually use myself, then share them with the world.

![Profile Views](https://komarev.com/ghpvc/?username=RealChrisSean&color=blue&style=flat-square)

[![My Skills](https://skillicons.dev/icons?i=ts,nextjs,react,python,nodejs,tailwind,mysql,vercel)](https://skillicons.dev)

## Currently Working On
- [**Speak2Me**](https://speak2me.io) - I wanted to build an AI companion that actually remembers you. So I built Speak2Me. But here's what makes it different from slapping a mic on a notes app: it can actually pick up on your emotions in real time through your ACTUAL voice. And not because you told it you were stressed, but because it can literally HEAR that you're stressed. Claude Opus 4.6 runs the brain. And for the memory system - well, it isn't some LLM-generated summary that drifts over time. Every fact gets its own row in my database, categorized and validated. Deterministic. No LLM synthesis, no corruption from a bad run, and facts never fall off no matter how many conversations you have. When new info contradicts old info, the old fact gets superseded - not duplicated, not deleted. Identity facts like your wife's name or your kid's birthday are pinned and can never get pushed out by newer stuff. You can come back tomorrow, next week or next year and it will remember and know your story. No catch-up. No repeating yourself. You just talk.

<details>
<summary><b>How the Memory Architecture Works</b></summary>
<br>

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPEAK2ME MEMORY ARCHITECTURE                 │
└─────────────────────────────────────────────────────────────────┘

  YOU TALK                        REAL-TIME
  ───────►  Hume EVI  ─────────►  Emotion Detection
            (voice)               (prosody analysis)
               │                        │
               ▼                        ▼
         Transcription         Top 3 emotions + scores
               │                   attached to each message
               ▼                        │
        ┌──────────────────────────────────┐
        │         Claude Opus 4.6          │
        │     (knows your full story +     │
        │      can hear how you feel)      │
        └──────────────────────────────────┘

═══════════════════════════════════════════════════════════════════
  AFTER EACH CONVERSATION — THE FACTS ENGINE
═══════════════════════════════════════════════════════════════════

  Transcript
      │
      ├──► FAST PATH (inline, ~500ms)          Start a new session
      │    Claude Haiku quick extraction        10 seconds later and
      │    Facts available immediately          the AI already knows.
      │
      └──► DEEP PATH (async, background)
           Deeper extraction + embeddings
           Catches anything fast path missed

  Both paths run through the same pipeline:
                │
                ▼
  VALIDATE ── garbage? ──► REJECT
      │         (meta-observations,
      │          AI behavior notes,
      │          negatives, generics)
      ▼
  CATEGORIZE (keyword matching, no LLM)
      │
      │   ┌──────────────────────────────────┐
      │   │  identity · family · work        │
      │   │  finance · health · interest     │
      │   │  project · social                │
      │   └──────────────────────────────────┘
      ▼
  SUPERSEDE ── overlaps existing fact? ──► old fact marked inactive
      │          (70% word overlap check)       (never deleted)
      ▼
  STORE as its own row in s2m_user_facts
      │
      ▼
  PIN IDENTITY FACTS — family, names, birthdays
      │    are flagged and ALWAYS loaded.
      │    Can never be pushed out.
      ▼
  BUILD PROFILE (deterministic string format)
      No LLM. Same input = same output. Always.

═══════════════════════════════════════════════════════════════════
  NEXT SESSION — INSTANT RECALL
═══════════════════════════════════════════════════════════════════

  App opens                    You click "Start Talking"
      │                              │
      ▼                              ▼
  Prefetch ALL active facts    Everything already loaded.
  profile + recent context     Zero wait. Zero catch-up.
  (background, before you      AI knows your whole story
   even click anything)        from word one.
```

| | How Most AI Apps Do It | Speak2Me |
|---|---|---|
| **Storage** | JSON blobs / summaries | One row per fact |
| **Profile** | LLM synthesis (can corrupt) | Deterministic, no LLM |
| **Fact lifespan** | Falls off after N chats | Never falls off |
| **Bad LLM run** | Corrupts everything | Can't happen |
| **Contradictions** | Both versions kept | Old fact superseded |
| **Garbage facts** | Stored anyway | Rejected on write |
| **Identity facts** | Same priority as all | Pinned, always loaded |
| **Recall speed** | 5-10s mid-conversation | Pre-loaded, instant |
| **Back-to-back sessions** | Waits for background processing | Facts ready in ~500ms |

</details>

## Current Status for Speak2Me

| Phase | What | Status |
|-------|------|--------|
| 1 | Foundation ([Next.js](https://nextjs.org/), [TiDB](https://tidbcloud.com/), auth) | ✅ Complete |
| 2 | Voice conversation ([Hume EVI](https://www.hume.ai/) + emotion detection) | ✅ Complete |
| 3 | AI brain ([Claude](https://www.anthropic.com/) via custom LM endpoint) | ✅ Complete |
| 4 | Dedicated facts table (deterministic profile, no LLM synthesis, facts never fall off) | ✅ Complete |
| 5 | Instant memory recall (zero-delay prefetch on app open) | ✅ Complete |
| 6 | Session history, search, transcript export | ✅ Complete |
| 7 | Dashboard (streaks, per-message emotion scores charted over weeks, memory carousel) | ✅ Complete |
| 8 | "On This Day" throwbacks (surfaces journal entries from the same date in past months) | ✅ Complete |
| 9 | Proactive reminders (upcoming birthdays, anniversaries) | ✅ Complete |
| 10 | Research Mode (voice-in, text-out, web search in your speaking style) | ✅ Complete |
| 11 | Voice identity verification (Modal infra + DB + API built, UI wiring left) | 🔧 In progress |
| 12 | Memory management (user can see/edit/correct what AI remembers) | Not started |
| 13 | Mobile app (PWA or native) | Not started |

## My Projects

- [BaseCamp](https://base-camp-five.vercel.app) - Voice-first personal health OS that builds long-term memory about what works for YOUR body
- [Parallel Lives](https://app.parallellives.ai) - AI decision simulator using multi-model reasoning (Claude + GPT)
- [Speak It](https://app.parallellives.ai/speak-it) - Voice-to-text Chrome extension that learns your style without storing your words
- [College Picker](https://github.com/RealChrisSean/college-picker) - AI college comparison with real Dept. of Education data
- [Journal It](https://app.parallellives.ai/journal) - AI journaling system that writes your autobiography
- [atlasMemory](https://github.com/RealChrisSean/atlasMemory) - Unified AI memory layer with branching and rollbacks
- [OriginAI](https://app.parallellives.ai/detect) - Chrome extension to detect AI-generated content

## Latest Blog Posts

- [AI Memory Is Broken. I Know Because I Built It.](https://www.chrisdabatos.com/blog/ai-memory-is-broken/) - Feb 2026
- [Building a Voice-to-Text App That Learns Your Style](https://www.chrisdabatos.com/blog/speak-it/) - Jan 2026
- [I Built a System That Writes My Autobiography While I Use It](https://www.chrisdabatos.com/blog/ai-journal-system/) - Dec 2025

## Content

- [YouTube](https://youtube.com/@RealChrisSean) - AI tools, databases, developer tutorials
- [Blog](https://www.chrisdabatos.com/) - Technical deep-dives
- Speaking: [AllThingsAI 2026](https://2026.allthingsai.org/sessions/write-like-me-not-for-me), [Percona Live](https://www.youtube.com/watch?v=ufiRoKlBj4A), SF Awesome AI Dev Tools

## Latest Video

<a href="https://youtu.be/-hsrwt5mSpU">
  <img src="https://img.youtube.com/vi/-hsrwt5mSpU/maxresdefault.jpg" width="400" alt="Latest YouTube Video">
</a>

## Connect

[![X](https://img.shields.io/badge/@RealChrisSean-black?style=flat-square&logo=x&logoColor=white)](https://x.com/RealChrisSean) [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/realchrissean) [![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=flat-square&logo=youtube&logoColor=white)](https://youtube.com/@RealChrisSean) [![Website](https://img.shields.io/badge/chrisdabatos.com-000?style=flat-square&logo=vercel&logoColor=white)](https://chrisdabatos.com)
