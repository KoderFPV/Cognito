# Jenkins Evaluation Tests Setup

This guide explains how to set up and run LLM evaluation tests on Jenkins.

## Prerequisites

### Jenkins Server Requirements

- Jenkins 2.x or newer
- Docker and Docker Compose installed on Jenkins agent
- NodeJS Plugin installed in Jenkins
- Access to Ollama server at `192.168.68.80:11434`

### Required Jenkins Plugins

1. **NodeJS Plugin** - for Node.js installation management
2. **Pipeline** - for Jenkinsfile support
3. **Docker Pipeline** (optional) - for better Docker integration

## Setup Steps

### 1. Install NodeJS Plugin

1. Go to **Manage Jenkins** → **Plugins** → **Available plugins**
2. Search for "NodeJS"
3. Install "NodeJS Plugin"
4. Restart Jenkins if required

### 2. Configure Node.js Tool

1. Go to **Manage Jenkins** → **Tools**
2. Scroll to **NodeJS installations**
3. Click **Add NodeJS**
4. Configure:
   - **Name**: `Node24` (must match exactly)
   - **Version**: Select Node.js 24.x
   - **Global npm packages to install**: (leave empty)
5. Click **Save**

### 3. Create Jenkins Pipeline Job

1. Click **New Item**
2. Enter job name: `cognito-eval-tests`
3. Select **Pipeline**
4. Click **OK**

### 4. Configure Pipeline

In the job configuration:

#### Option A: Pipeline from SCM (Recommended)

1. In **Pipeline** section, select **Pipeline script from SCM**
2. **SCM**: Git
3. **Repository URL**: `https://github.com/KoderFPV/Cognito.git`
4. **Branch**: `*/feature/product-search-with-evaluation` (or `*/main`)
5. **Script Path**: `Jenkinsfile.eval`
6. Click **Save**

#### Option B: Inline Pipeline Script

1. In **Pipeline** section, select **Pipeline script**
2. Copy contents of `Jenkinsfile.eval` into the script area
3. Click **Save**

### 5. Verify Ollama Server

Ensure Ollama is running and accessible:

```bash
curl http://192.168.68.80:11434/api/tags
```

Verify the model is available:

```bash
curl http://192.168.68.80:11434/api/tags | grep mistral-small3.2
```

If model is not present, pull it:

```bash
curl http://192.168.68.80:11434/api/pull -d '{"name": "mistral-small3.2:24b-instruct-2506-q8_0"}'
```

### 6. Run the Pipeline

1. Open the job
2. Click **Build Now**
3. Monitor progress in **Console Output**

## Pipeline Stages

| Stage | Description | Duration |
|-------|-------------|----------|
| Checkout | Clone repository | ~10s |
| Start Infrastructure | Start MongoDB + Weaviate containers | ~60-120s |
| Install Dependencies | Run `npm ci` | ~30-60s |
| Run Evaluation Tests | Execute LLM evaluation tests | ~5-10min |

## Environment Variables

The pipeline sets these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `TEST_LOCALE` | `en` | Test locale |
| `OLLAMA_URL` | `http://192.168.68.80:11434/v1` | Ollama API endpoint |
| `OLLAMA_MODEL` | `mistral-small3.2:24b-instruct-2506-q8_0` | LLM model |
| `MONGODB_URI` | `mongodb://localhost:27017/cognito-eval` | MongoDB connection |
| `WEAVIATE_HTTP_HOST` | `localhost` | Weaviate host |
| `WEAVIATE_HTTP_PORT` | `8080` | Weaviate HTTP port |

## Artifacts

After each run, failed test results are archived:

- Location: **Build Artifacts** → `agents/__tests__/evaluation/last-run/`
- Format: JSON files with conversation and evaluation details

## Troubleshooting

### MongoDB fails to start

```bash
# Check container logs
docker logs cognito-eval-mongo

# Manually test
docker run --rm mongo:7 mongosh --eval "db.runCommand({ ping: 1 })"
```

### Weaviate fails to start

```bash
# Check container logs
docker logs cognito-eval-weaviate
docker logs cognito-eval-vectorizer

# Verify readiness endpoint
curl http://localhost:8080/v1/.well-known/ready
```

### Ollama connection refused

1. Verify Ollama is running on `192.168.68.80`
2. Check firewall rules allow port `11434`
3. Test connectivity from Jenkins agent:
   ```bash
   curl http://192.168.68.80:11434/api/tags
   ```

### Node.js tool not found

Error: `Tool type "nodejs" does not have an install of "Node24" configured`

Solution: Follow step 2 above to configure Node.js tool with exact name `Node24`.

### Docker permission denied

```bash
# Add Jenkins user to docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## Customization

### Change Ollama Server

Edit `Jenkinsfile.eval`:

```groovy
environment {
    OLLAMA_URL = 'http://YOUR_OLLAMA_IP:11434/v1'
}
```

### Change Model

Edit `Jenkinsfile.eval`:

```groovy
environment {
    OLLAMA_MODEL = 'your-model-name'
}
```

### Schedule Automatic Runs

In job configuration, add **Build Triggers**:

- **Build periodically**: `H 2 * * *` (daily at 2 AM)
- **Poll SCM**: `H/15 * * * *` (every 15 minutes)
