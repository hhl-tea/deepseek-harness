# Pi vision bridge on DSH 0.2.2-rc.3

Image understanding for text-only models, run as the published Pi packages
`pi2dsh@0.28.0-next.1` and `@kassing/pi-vision@0.1.1`. The engine registers a
`<route>-vision` companion for every text-only route; a pasted or path-referenced
image is analyzed by a vision endpoint you configure and the analysis enters the
turn as a context injection, so the original model answers from text.

`pi2dsh@0.28.0-next.1` declares `0.2.2-alpha.3` peers. Three host differences on
the `0.2.2-rc.3` line stop it from mounting, and `apply.mjs` closes them in the
profile's installed copy:

1. **`ctx.root`** — Cordis 4.1 dropped the accessor; the root context is keyed by
   `Symbol.for('cordis.root')`. Without this the engine fails its first `apply`
   with `cannot get property "root" without inject`.
2. **`llm/models-updated`** — the engine re-sweeps companion routes on
   `llm/adapters-updated` only. This host announces loaded provider catalogs on
   `llm/models-updated`, so the first sweep sees an empty directory and no
   companion is ever registered.
3. **Empty directory** — startup publishes an empty provider list before the
   profile finishes mounting. A sweep that trusts it disposes the companions it
   just registered, and nothing re-registers them.

## Install

```sh
patches/pi2dsh-dsh-0.2.2/install.sh web
```

`install.sh` grants the exact-version exemption for `pi2dsh` on `0.2.2-rc.3`, adds
both packages, applies the patches, and leaves the profile ready for a restart.

## Vision endpoint

`~/.pi/agent/vision-bridge.json` holds the endpoint; any OpenAI-compatible vision
API works. This profile uses DashScope's compatible mode:

```json
{
  "vision": {
    "active": "dashscope-qwen3-vl",
    "models": [{
      "name": "dashscope-qwen3-vl",
      "type": "openai-compat",
      "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "apiKey": "$DASHSCOPE_API_KEY",
      "model": "qwen3-vl-plus",
      "maxTokensField": "max_tokens"
    }]
  }
}
```

The plugin reads the process environment, so `DASHSCOPE_API_KEY` must be exported
in the shell that starts `dsh`.

**Proxy setting.** The plugin calls the vision endpoint through the process's
global `fetch`. With `HTTPS_PROXY` pointing at a proxy that is not listening, every
vision call fails with `fetch failed` while model traffic keeps working. Unset the
proxy variables for the launching shell or add the vision host to `NO_PROXY`.

## Verify

```sh
pnpm dsh <profile> "What solid color fills the image at /tmp/solid-green.png ? Answer with just the color name."
```

A working install replaces the image path in the message with guide text and
answers from the injected analysis:

```
dsh: reasoning:
The user asks: "What solid color fills the image at [图片文件已由外部视觉模型分析，内容见下方 vision-bridge 消息] ?"
The vision analysis result says "green".
dsh: Green
```

The Web app shows the same injection as a `pi2dsh:@kassing/pi-vision` context row,
and its model picker gains a `<provider> + Vision Bridge` group whose routes accept
image pastes.

## Upgrading

`apply.mjs` is idempotent, but `dsh plugin add` reinstalls the bundle and drops the
patch. Rerun `install.sh` — or `node apply.mjs <profileDir>` after an engine-only
reinstall.
