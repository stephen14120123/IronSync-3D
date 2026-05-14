
# 1. 清理可能残留的旧密钥，防止冲突警告
Remove-Item Env:\ANTHROPIC_API_KEY -ErrorAction SilentlyContinue

# 2. 配置 DeepSeek 官方原生兼容接口
$env:ANTHROPIC_BASE_URL="https://api.deepseek.com/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="sk-899f2aab1f2e4b64a3e62512f5828b14"

# 3. 将底层模型全部重定向为 DeepSeek (推荐日常敲代码用 chat，逻辑推导用 reasoner)
$env:ANTHROPIC_MODEL="deepseek-chat"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="deepseek-chat"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="deepseek-chat"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="deepseek-chat"
$env:CLAUDE_CODE_SUBAGENT_MODEL="deepseek-chat"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"

# 4. 穿透环境变量直接启动 Claude Code
npx @anthropic-ai/claude-code